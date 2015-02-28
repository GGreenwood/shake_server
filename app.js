var pg = require('pg');
var conString = "postgres://awsuser:shake123@dbggreenwood.cnc5f7nrnhvp.us-west-2.rds.amazonaws.com:5432/shake";

pg.connect(conString, function(err, client, done) {
	if(err) {
		return console.error('error fetching client from pool', err);
	}
	return console.error("success");
});
