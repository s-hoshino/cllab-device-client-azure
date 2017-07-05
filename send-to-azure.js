'use strict';

// npm
const moment = require('moment');
const config = require('config');
const exec = require('child_process').exec;

// Azure library
const Protocol = require('azure-iot-device-mqtt').Mqtt;
const Client = require('azure-iot-device').Client;
const Message = require('azure-iot-device').Message;

const connectionString = config.connectionString;
const intervalMillisec = config.intervalSec * 1000;

const client = Client.fromConnectionString(connectionString, Protocol);

const connectCallback = function (err) {
  if (err) {
    console.error('Could not connect: ' + err.message);
  } else {
    console.log('Client connected');
    client.on('message', function (msg) {
      console.log('Id: ' + msg.messageId + ' Body: ' + msg.data);
      client.complete(msg, printResultFor('completed'));
    });

    // センサデータを取得し、それをもとに IoTHub に送るメッセージ(JSON)を作成する。
    // また、メッセージを intervalSec 秒間ごとに IoTHub へ送信する。
    let sendInterval = setInterval(function () {
      let command = 'python getsensor.py --pin ' + config.dht11Pin;
      if (config.isDemo) {
        command += ' --demo';
      }

      exec(command, function (error, stdout, stderr) {
        if (error !== null || stderr) {
          console.log('exec error: ' + error);
          console.log('stderr: ' + stderr);
          return;
        }

        let now = moment.utc();
        let unixtime = now.unix() * 1000 + now.milliseconds();
        let timestamp = now.add(9, 'h').format('YYYY-MM-DD HH:mm:ss.SSS+0900');
        let sensorData = JSON.parse(stdout);

        let payload = JSON.stringify({
          id: unixtime,
          verbose_timestamp: timestamp,
          device_id: config.deviceId,
          temperature: sensorData.temperature,
          humidity: sensorData.humidity,
          lux: sensorData.lux,
        });
        
        let message = new Message(payload);
        message.properties.add('key', 'value');
        console.log('Sending message: ');
        console.log(JSON.stringify(JSON.parse(message.getData()), null, '    '));
        client.sendEvent(message, printResultFor('send'));
      });
    }, intervalMillisec);

    client.on('error', function (err) {
      console.error(err.message);
    });

    client.on('disconnect', function () {
      console.log('MQTT disconnect. Try to reconnection to Azure.');
      clearInterval(sendInterval);
      client.removeAllListeners();
      client.open(connectCallback);
    });
  }
};

client.open(connectCallback);

// Helper function to print results in the console
function printResultFor(op) {
  return function printResult(err, res) {
    if (err) console.log(op + ' error: ' + err.toString());
    if (res) console.log(op + ' status: ' + res.constructor.name);
  };
}