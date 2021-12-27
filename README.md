# winston-sentry-dia

A simple winston transport that logs [dia.js](https://github.com/do-/dia.js/) errors to sentry.

This transport is for winston 3.x and uses the new `@sentry/node` SDK.

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

Whenever an error with level `fatal` or `error` are logged with your winston logger that error will also be logged to sentry.
