# Wifi Power Logger

Node.js script that grabs the RSSI of an SSID(s) and logs it to InfluxDB, tagged with the channel, SSID, BSSID and the logging device's hostname

Only works on Mac OS as it relies on the Airport binary. No reason it couldn't be adapted to use Airmon or another wifi scanner


Change the SSID pattern at the top of the file, and the InfluxDB server address
