var pg = require('pg');
var conString = "postgres://awsuser:shake123@dbggreenwood.cnc5f7nrnhvp.us-west-2.rds.amazonaws.com:5432/shake";

var express = require('express')
  , cors = require('cors')
  , app = express();

app.use(cors());

var request = require('request');
var moment = require('moment');

var rotten_url = "http://api.rottentomatoes.com/api/public/v1.0/lists/movies/opening.json?limit=16&country=us"
var rotten_api_key = "fwb4ugwu5hwajyaj75qubcqz"
var rotten_params = {"country":"us", "limit":"16", "apikey":rotten_api_key };



console.log("Starting server");

pg.connect(conString, function(err, client, done) {
    if(err) {
        return console.error('error fetching client from pool', err);
    }
    console.log("Connected to db");

    app.get('/users/:id', function(req, res, next){
        /*
        client.query('SELECT * FROM users'), function(err, result) {
            res.json(result);
            done();
        });
        */

    });

    app.get('/movies/:id', function(req, res, next) {
        
        request({
            url: rotten_url,
            json: true,
            qs: rotten_params
        }, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                res.json(body);
                //var entries = body["movies"]
            }
        });
        
    });

    app.listen(80, function(){
        console.log('CORS-enabled web server listening on port 80');
    });
});

