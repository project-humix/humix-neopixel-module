var nats = require('nats').connect();

nats.subscribe('humix.sense.mgmt.register',function(request,replyto){
	
	nats.publish(replyto,'ok');

});
