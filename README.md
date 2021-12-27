[![build](https://github.com/jonny64/winston-sentry-dia/actions/workflows/build.yml/badge.svg)](https://github.com/jonny64/winston-sentry-dia/actions/workflows/build.yml)

# winston-sentry-dia

A simple winston transport that logs [dia.js](https://github.com/do-/dia.js/) errors to sentry.

This transport is for winston 3.x and uses `@sentry/node` SDK.

## Installation

```
npm install --save winston-sentry-dia
```

## Usage

Follow the steps in [sentry's docs](https://docs.sentry.io/error-reporting/quickstart/?platform=node) to set up your node sdk. The transport doesn't set up the sentry SDK for you in case you want to make any of your own sentry calls outside of the context of winston.

Initialize the transport and tell winston about it like this:

```
const winston            = require ('winston')
const Sentry             = require('@sentry/node')
const SentryTransportDia = require ('winston-sentry-dia')

init_logging () {

	this.logging_container = new winston.Container ()

	Sentry.init (this.sentry)

	for (let category of ['app', 'db', 'http', 'queue', 'f_s']) this.logging_container.add (category, {

		format: new Dia.Logger ({category}),

		transports: [
			new winston.transports.Console (),
			new SentryTransportDia ({ Sentry })
		]

	})

}

```

## Logging behavior

Whenever an error with level `error` are logged with your winston logger that error will also be logged to sentry.

All previous events with lower level will are cached as [breadcrumbs](https://docs.sentry.io/platforms/node/enriching-events/breadcrumbs/)
