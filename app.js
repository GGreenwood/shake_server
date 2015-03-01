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

var places_url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
var places_api_key = "AIzaSyAWaMGTy2TB0HeZxY7sd1LQ4kJsrKA7y7s"

var weather_url = "http://api.wunderground.com/api/e0c4869f7a01914f/forecast/q/"
var weather_api_key = "e0c4869f7a01914f"


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

    app.get('/movies/:id/:limit', function(req, res, next) {
        var limit = req.params["limit"];
        var rotten_params = {"country":"us", "limit":limit, "apikey":rotten_api_key };
        
        request({
            url: rotten_url,
            json: true,
            qs: rotten_params
        }, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                //var entries = body["movies"]
                movies = []
                body["movies"].forEach(function(entry) {
                    movies.push({ 
                        name: entry.title,
                        poster: entry.posters.thumbnail,
                        runtime: entry.runtime,
                        rating_mpaa: entry.mpaa_rating,
                        rating_rotten: entry.ratings.critics_rating
                    });
                });
                res.json(movies);
            }
        });
        
    });

    app.get('/theatres/:id/:location/:distance', function(req, res, next) {
        var location = req.params["location"];
        var radius = req.params["distance"];

        var params = {
            "country": "us",
            "key": places_api_key,
            "location": location,
            "radius": radius,
            "types": "movie_theater"
        };
        
        request({
            url: places_url,
            json: true,
            qs: params
        }, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                //var entries = body["movies"]
                theatres = []

                body["results"].forEach(function(theatre) {
                    theatres.push({
                        name: theatre.name,
                        address: theatre.vicinity
                    });
                });

                res.json(theatres);
            }
        });
    });
        
    app.get('/airports/:id/:location/:distance', function(req, res, next) {
        var location = req.params["location"];
        var radius = req.params["distance"];

        var params = {
            "country": "us",
            "key": places_api_key,
            "location": location,
            "radius": radius,
            "types": "airport"
        };
        
        request({
            url: places_url,
            json: true,
            qs: params
        }, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                //var entries = body["movies"]
                airports = []

                body["results"].forEach(function(airport) {
                    airports.push({
                        name: airport.name,
                        address: airport.vicinity
                    });
                });

                res.json(body);
            }
        });
    });
    app.get('/weather/:id/:state/:city', function(req, res, next) {
        var state = req.params["state"];
        var city = req.params["city"];

        var params = {};
        
        request({
            url: weather_url + state + "/" + city + ".json",
            json: true,
            qs: params
        }, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                weather = {
                    high: body.forecast.simpleforecast.forecastday[0].high.fahrenheit,
                    low: body.forecast.simpleforecast.forecastday[0].low.fahrenheit,
                    precip: body.forecast.simpleforecast.forecastday[0].pop,
                    conditions: body.forecast.simpleforecast.forecastday[0].conditions
                }

                res.json(weather);
            }
        });
    });

    app.get('/destinations/:id/:origin/:limit', function(req, res, next) {
        var origin = req.params["origin"];
        var limit = req.params["limit"];

        var params = {
            origin: origin,
            topdestinations: limit
        };
        
        request({
            url: "https://api.test.sabre.com/v1/lists/top/destinations",
            json: true,
            qs: params,
            headers: {
                'Authorization': "Bearer Shared/IDL:IceSess\/SessMgr:1\.0.IDL/Common/!ICESMS\/ACPCRTD!ICESMSLB\/CRT.LB!-0123456789012345678!123456!0!ABCDEFGHIJKLM!E2E-1",
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                destinations = [];

                body["Destinations"].forEach(function(destination) {
                    var name = destination.Destination.CityName;
                    if(name == undefined)
                        name = destination.Destination.MetropolitanAreaName;

                    destinations.push({
                        name: name,
                        code: destination.Destination.DestinationLocation
                    })
                });
                res.json(destinations);
            }
        });
    });

    app.listen(80, function(){
        console.log('CORS-enabled web server listening on port 80');
    });
});

