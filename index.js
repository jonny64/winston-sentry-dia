const _ = require('lodash')
const Transport = require('winston-transport')

const normalizeMessage = (msg, meta) => {
  let message = msg

  message.category = meta.category

  if (msg instanceof Error) {
    message = msg.message
  }

  if (meta.error instanceof Error) {
      message = meta.error.message
  }

  return message
}

module.exports = class SentryTransport extends Transport {
  constructor(options) {
    options = options || {}
    options.level = 'debug' // log anything as breadcrumb
    options = _.defaultsDeep(options, {
      name: 'SentryTransport',
      silent: false,
      levelsMap: {
        silly: 'debug',
        verbose: 'debug',
        info: 'info',
        debug: 'debug',
        warn: 'warning',
        error: 'error'
      }
    })

    super(_.omit(options, [
      'Sentry',
      'levelsMap'
    ]))

    this._sentry = options.Sentry
    this._silent = options.silent
    this._levelsMap = options.levelsMap
    this._close = options.close
  }

  log (o, next) {
    let { level, message, category, ...meta } = o
    let level_sentry = this._levelsMap[level]
    let done = () => {
      if (this._close) {
        this._sentry.close().then(() => next(null, true))
      } else {
        next(null, true)
      }
    }

    if (level !== 'error') {
      this._sentry.addBreadcrumb ({
        level: level_sentry,
        message: (meta.path || []).join ('/') + ' ' + message,
        category,
      })
      return done ()
    }

    if (this.silent) return next(null, true)
    if (!(level in this._levelsMap)) return next(null, true)

    const msg = normalizeMessage(message, meta)
    const context = meta || {}
    let tags = {
      side     : 'back',
      category,
      uuid     : context.uuid,
      parent   : context.parent? context.parent.uuid : null,
      method_name: context.parent? context.parent.method_name : null,
    }

    let u = context.parent && context.parent.user? context.parent.user : null
    let user = !u? null : {
      id          : u.uuid,
      username    : u.login || null,
      ip_address  : u.remote_addr || null,
    }

    this._sentry.captureMessage (msg, {
      tags,
      user,
      extra: context,
      level: level_sentry,
      category,
    })

    done ()
  }
}
