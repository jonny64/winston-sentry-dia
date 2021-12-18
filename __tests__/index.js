const SentryTransport = require('../index')

const getMockSentry = () => {
  const mockScope = {
    captureMessage: jest.fn()
  }

  return {
    mockScope,
    withScope: jest.fn(cb => {
      cb(mockScope)
    }),
    captureMessage: jest.fn(),
    close: jest.fn(() => Promise.resolve(true)),
  }
}

const getMockErrors = () => {
  return [
    [
      {
        level    : 'error',
        message  : 'message',
        category : 'db',
        parent   : {
          uuid: '00000000-00000000-00000000-00000001',
          user: {
            uuid        : '00000000-00000000-00000000-00000000',
            login       : 'test',
            remote_addr : '0.0.0.0'
          },
          method_name: 'do_create_test',
        },
        uuid     : '00000000-00000000-00000000-00000002',
      },
      {
        "category":"db",
        "extra":{
          "parent":{
              "method_name":"do_create_test",
              "user":{
                "login":"test",
                "remote_addr":"0.0.0.0",
                "uuid":"00000000-00000000-00000000-00000000"
              },
              "uuid":"00000000-00000000-00000000-00000001"
          },
          "uuid":"00000000-00000000-00000000-00000002"
        },
        "level":"error",
        "tags":{
          "category": "db",
          "method_name":"do_create_test",
          "parent":"00000000-00000000-00000000-00000001",
          "side":"back",
          "uuid":"00000000-00000000-00000000-00000002"
        },
        "user":{
          "id":"00000000-00000000-00000000-00000000",
          "ip_address":"0.0.0.0",
          "username":"test"
        }
      }
    ]
  ]
}

test('instantiates', () => {
  const Sentry = getMockSentry()
  const Transport = new SentryTransport({ Sentry })

  expect(Transport._sentry).toBe(Sentry)
  expect(Transport._close).toBe(undefined)
})

test('log calls sentry functions', () => {
  const Sentry = getMockSentry()
  const Transport = new SentryTransport({ Sentry })

  const cb = jest.fn()
  const todo = getMockErrors ()
  Transport.log(todo[0][0], cb)

  expect(cb).toHaveBeenCalledWith(null, true)
  expect(Sentry.captureMessage).toHaveBeenCalledWith('message', todo[0][1])
  expect(Sentry.close).not.toHaveBeenCalled()
})

test('instantiates with close and calls sentry functions', () => {
  const Sentry = getMockSentry()
  const Transport = new SentryTransport({ Sentry, close: true })

  expect(Transport._sentry).toBe(Sentry)
  expect(Transport._close).toBe(true)

  const cb = jest.fn()
  Transport.log({ level: 'error', message: 'message' }, cb)
  expect(Sentry.close).toHaveBeenCalled()
})
