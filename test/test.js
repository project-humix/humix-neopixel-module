var nats = require('nats').connect();

nats.publish('humix.sense.neopixel.command.mode','{"mode":"clock"}');
