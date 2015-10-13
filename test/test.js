var nats = require('nats').connect();

nats.publish('humix.sense.neopixel.command.feel','positive');
