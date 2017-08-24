var os = require('os')
var spawn = require('child_process').spawn;
const ssidPattern = 'testssid';
const cmd = '/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport';

const influxDbName = 'ssid_signal'
const flux = require('influx')
const influx = new flux.InfluxDB({
  host: '127.0.0.1',
  database: influxDbName,
  schema: [
    {
      measurement: 'signal',
      fields: {
        rssi: flux.FieldType.INTEGER
      },
	tags:[
		'hostname',
		'ssid',
		'bssid',
		'channel'
	]
    }
  ]
})
influx.getDatabaseNames()
  .then(names => {
    if (!names.includes(influxDbName)) {
      return influx.createDatabase(influxDbName);
    }
  })
.then(() => {
	var child = spawn(cmd,['-s']);
	var output  = "";
	child.stdout.on('data', function(data) {
		output = '' + data;
	});
	child.stderr.on('data', function(data) {
	    console.log('stderr: ' + data);
	    //Here is where the error output goes
	});
	child.on('close', function(code) {
		var lines = output.split('\n');
		for (let line of lines) {
			if (line.includes(ssidPattern)) {
				var trimmed = line.trim();
				var components = trimmed.split(' ');
				//console.log(components.length)
				var ssid = components[0];
				var bssid = components[1];
				var rssi = components[2];
				var channel = components[4];
				
				console.log("ssid:" + ssid);
				console.log("bssid:" + bssid);
				console.log("rssi:" + rssi);
				console.log("channel:" + channel);

				influx.writePoints([
      			{
        			measurement: 'signal',
        			tags : { 
        				hostname : os.hostname(),
        				ssid : ssid,
        				bssid : bssid,
        				channel : channel
        			},
        			fields: { rssi: rssi }
      			}
		    	]).catch(err => {
      				console.error(`Error saving data to InfluxDB! ${err.stack}`)
    			})

			}
		}
	});
});

