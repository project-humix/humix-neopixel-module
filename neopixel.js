var ws281x = require('rpi-ws281x-native'),
    ws281xCanvas = require('rpi-ws281x-canvas'),
    HumixSense = require('node-humix-sense')

var NUM_LEDS = 80;

ws281x.init(NUM_LEDS);


var config = {
    "moduleName":"neopixel",
    "commands" : ["feel","mode","color"],
    "events" : [],
    "debug": true
            
}

var humix = new HumixSense(config);
var canvas = ws281xCanvas.create(16,5);

var charmap = {};
charmap['1'] = [0,1,0,
             0,1,0,
             0,1,0,
             0,1,0,
             0,1,0];


charmap['2'] = [1,1,1,
             0,0,1,
             1,1,1,
             1,0,0,
             1,1,1];

charmap['3'] = [1,1,1,
                0,0,1,
                1,1,1,
                0,0,1,
                1,1,1];

charmap['4'] = [1,0,1,
                1,0,1,
                1,1,1,
                0,0,1,
                0,0,1];

charmap['5'] = [1,1,1,
                1,0,0,
                1,1,1,
                0,0,1,
                1,1,1];

charmap['6'] = [1,1,1,
                1,0,0,
                1,1,1,
                1,0,1,
                1,1,1];

charmap['7'] = [1,1,1,
                1,0,1,
                0,0,1,
                0,0,1,
                0,0,1];

charmap['8'] = [1,1,1,
                1,0,1,
                1,1,1,
                1,0,1,
                1,1,1];

charmap['9'] = [1,1,1,
                1,0,1,
                1,1,1,
                0,0,1,
                0,0,1];

charmap['0'] = [1,1,1,
                1,0,1,
                1,0,1,
                1,0,1,
                1,1,1];


var remapIndex = [ 0, 1, 2, 3, 4, 5, 6 ,7,   16,17,18,19,20,21,22,23,
                  32,33,34,35,36,37,38,39,   48,49,50,51,52,53,54,55,
                  64,65,66,67,68,69,70,71,   8, 9,10,11,12,13,14,15,
                  24,25,26,27,28,29,30,31,  40,41,42,43,44,45,46,47,
                  56,57,58,59,60,61,62,63,   72,73,74,75,76,77,78,79];

cIndexMap = [2,5,8,11];


var brightness = 180;

var gData     = new Uint32Array(NUM_LEDS);
var pixelData = new Uint32Array(NUM_LEDS);

// for repeat tasks
var clockModeID;
var robotModeID;

// for robot mode;
var count = 0;
var blink = 4;


humix.on('connection', function(humixSensorModule){
    hsm = humixSensorModule;
    
    console.log('Communication with humix-sense is now ready. hsm:'+hsm);

    hsm.on('feel', function(data){
        
        console.log('data:'+data);
        var command = JSON.parse(data);
        if(command.feel === 'positive'){

            console.log("feel positive");

            for (var i = 0; i < NUM_LEDS; i++) {
                pixelData[i] = color(0,255,0);
            }

            render(pixelData);
           
        }else if(command.feel === 'negative'){

            console.log("feel negative");

            for (var i = 0; i < NUM_LEDS; i++) {
                pixelData[i] = color(0,0,255);
                            
            }

            render(pixelData);

        }
    })

    hsm.on('mode',function(data){

        var command = JSON.parse(data);
        if(command.mode === 'clock'){
            // enable clock mode

            if(robotModeID){
                clearInterval(robotModeID);
            }
            
            clockModeID = setInterval(function(){
                showTime();
            },5000);

        }else if (command.mode === 'robot'){

            if(clockModeID){
                clearInterval(clockModeID);
            };
            
            robotModeID = setInterval(function () {

                var idx = 0,
                    ctx = canvas.getContext('2d');


                if(count == blink){
                    
                    var eye_color_1 = 'black';
                    var eye_color_2 = 'black';
                    count = 0;
                    blink = 4 + Math.floor(Math.random()*10);    
                }else{

                    var eye_color_1 = 'yellow';
                    var eye_color_2 = '#FFD700';
                }

                ctx.globalAlpha = 1;

                ctx.beginPath();
                ctx.arc(4, 3, 3, 0, 2*Math.PI);
                ctx.stroke();
                ctx.fillStyle = eye_color_1;
                ctx.fill();
                
                ctx.beginPath();
                ctx.arc(4, 3, 2, 0, 2*Math.PI);
                ctx.stroke();
                ctx.fillStyle = eye_color_2;;
                ctx.fill();

                ctx.beginPath();
                ctx.arc(12, 3, 3, 0, 2*Math.PI);
                ctx.stroke();
                ctx.fillStyle = eye_color_1;;
                ctx.fill();

                ctx.beginPath();
                ctx.arc(12, 3, 2, 0, 2*Math.PI);
                ctx.stroke();
                ctx.fillStyle = eye_color_2;
                ctx.fill();

                ws281x.setIndexMapping(remapIndex);
                ws281x.render(canvas.toUint32Array());
                
                count++;
                
            }, 500);


            
        }
    });

});


function render(data){
    ws281x.setIndexMapping(remapIndex);   
    ws281x.render(data);    
}

function color(r, g, b) {
    r = r * brightness / 255;
    g = g * brightness / 255;
    b = b * brightness / 255;
    return ((r & 0xff) << 16) + ((g & 0xff) << 8) + (b & 0xff);
    
}


function reset(){

    for(var i=0;i<NUM_LEDS;i++){
        gData[i] = 0;            
    }

    render(gData);
}

function setData(data){

    reset();
    var colors = [color(255,0,0),color(0,255,0),color(0,0,255),color(255,0,255)];

    
    for(var i=0;i<4;i++){
        setCharData(i,data[i],colors[i]);
    }
    render(gData);
}



function setCharData(charNo, text, rgb){

    var rowOffset = 14;

    var gIndex = cIndexMap[charNo];

    var cmap = charmap[text];
    for (var i=0;i<15;i++){

        if(cmap[i]){

            gData[gIndex] = rgb;
        }

        if(  (i+1) % 3 == 0 ){

            gIndex += rowOffset; 
        }else{

            gIndex ++;
        }       
    }
   
}

function showTime(){

    var d = new Date();

    // FIXME : set proper timezone to get the right time
    var hh = (d.getHours()+8).toString();
    var mm = d.getMinutes().toString();

    if(hh.length == 1) hh = '0' + hh;
    if(mm.length == 1) mm = '0' + mm;

    console.log('hh:'+hh+',mm:'+mm);
    
    var timeData = [hh[0],hh[1],mm[0],mm[1]];

    setData(timeData);
}






