var ws281x = require('rpi-ws281x-native'),
    HumixSense = require('node-humix-sense')

var NUM_LEDS = 7;
var pixelData = new Uint32Array(NUM_LEDS);

ws281x.init(NUM_LEDS);

            
var config = {
    "moduleName":"neopixel",
    "commands" : ["feel"],
    "events" : ["event1","event2"],
    "debug": true
            
}

var humix = new HumixSense(config);


humix.on('connection', function(humixSensorModule){
    hsm = humixSensorModule;
    
    console.log('Communication with humix-sense is now ready. hsm:'+hsm);

    hsm.on('feel', function(data){

        if(data === 'positive'){

            console.log("feel positive");

            for (var i = 0; i < NUM_LEDS; i++) {
                pixelData[i] = rgb2Int(0,255,0);
            }

            ws281x.render(pixelData);
            
        }else if(data === 'negative'){

            console.log("feel negative");

            for (var i = 0; i < NUM_LEDS; i++) {
                pixelData[i] = rgb2Int(0,0,255);
                            
            }

            ws281x.render(pixelData);
        }
    })
    
});


function rgb2Int(r, g, b) {
    return ((r & 0xff) << 16) + ((g & 0xff) << 8) + (b & 0xff);
    
}

