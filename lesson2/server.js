
/*
 *  PubNub EON Demo with Arduino
 *  Displaying the data sent by Arduino with DS18B20 temperature, photoresistor sensor, and a potentiometer separately, using Johnny-Five
 *  https://github.com/pubnub/johnnyfive-eon
 *
 *  Tomomi Imura @girlie_mac
 *  License: MIT
 */


// Init PubNub - Please use your own keys. Get them from https://admin.pubnub.com

var PubNub = require("pubnub");
var pubnub = new PubNub({
  ssl           : true,  // <- enable TLS Tunneling over TCP
  publishKey   : "pub-c-5a5f3514-32a6-49a0-94d9-ea376729f959",
  subscribeKey : "sub-c-d784e128-da7d-11e5-9511-0619f8945a4f"
});

var temp = 0;
var light = 0;
var channel = 'temperature-photoresistor';

function publish() {
  var data = { eon: {
    'temperature': temp,
    'light': light
  }};
  pubnub.publish({
    channel: channel,
    message: data,
  });
}

// Johnny-Five
// Using a temperature sensor, type DS18B20 requires OneWire support using the ConfigurableFirmata

var five = require('johnny-five');

five.Board().on('ready', function() {

  var temperature = new five.Thermometer({
    controller: 'DS18B20',
    pin: 2
  });

  var photoresistor = new five.Sensor({
    pin: 'A2',
    freq: 250
  });

  var potentiometer = new five.Sensor({
    pin: 'A0',
    freq: 150
  });

  temperature.on('data', function() {
    console.log(this.celsius + '°C', this.fahrenheit + '°F');
    temp = this.celsius;
  });

  photoresistor.on('data', function() {
    console.log('photoresistor: ' + this.value);
    light = this.value;
  });

  setInterval(publish, 3000);

  potentiometer.on('data', function() {
    // value range 0 - 1023
    console.log(this.value, this.raw);

    var data = { eon: {
      'potentiometer': this.value
    }};
    pubnub.publish({
      channel: 'potentiometer',
      message: data
    });
  });
});
