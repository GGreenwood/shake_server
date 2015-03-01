var pg = require('pg');
var conString = "postgres://awsuser:shake123@dbggreenwood.cnc5f7nrnhvp.us-west-2.rds.amazonaws.com:5432/shake";

var express = require('express')
  , cors = require('cors')
  , app = express();

app.use(cors());

var http = require('http').Server(app);
var io = require('socket.io')(http);

var request = require('request');
var moment = require('moment');

var rotten_url = "http://api.rottentomatoes.com/api/public/v1.0/lists/movies/opening.json?limit=16&country=us"
var rotten_api_key = "fwb4ugwu5hwajyaj75qubcqz"

var places_url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
var geocode_url = "https://maps.googleapis.com/maps/api/geocode/json"
var google_api_key = "AIzaSyAWaMGTy2TB0HeZxY7sd1LQ4kJsrKA7y7s"

var weather_url = "http://api.wunderground.com/api/e0c4869f7a01914f/forecast/q/"
var weather_api_key = "e0c4869f7a01914f"

var sabre_dest_url = "https://api.test.sabre.com/v1/lists/top/destinations"
var sabre_price_url = "https://api.test.sabre.com/v1/shop/flights/fares"
var sabre_auth = "Bearer Shared/IDL:IceSess\/SessMgr:1\.0.IDL/Common/!ICESMS\/ACPCRTD!ICESMSLB\/CRT.LB!-0123456789012345678!123456!0!ABCDEFGHIJKLM!E2E-1"

var activities = [
    {
        name: "HOBBIES",
        options: [
            {name: "TECH", method: "unimplemented", provider: "none"},
            {name: "ARTS", method: "unimplemented", provider: "none"}
        ]
    }, 
    {
        name: "TRAVEL",
        options: [
            {name: "FLIGHT", method: "flights", provider: "Sabre"}
        ]
    }, 
    {
        name: "DINING",
        options: [
            {name: "BREAKFAST", method: "unimplemented", provider: "none"},
            {name: "LUNCH", method: "unimplemented", provider: "none"},
            {name: "DINNER", method: "unimplemented", provider: "none"},
            {name: "COFFEE", method: "unimplemented", provider: "none"}
        ]
    }, 
    {
        name: "FUN",
        options: [
            {name: "MOVIES", method: "movies", provider: "Rotten Tomatoes"},
            {name: "MUSIC", method: "unimplemented", provider: "none"},
            {name: "NIGHTLIFE", method: "unimplemented", provider: "none"}
        ]
    }, 
    {
        name: "OUTDOORS",
        options: [
            {name: "HIKING", method: "unimplemented", provider: "none"},
            {name: "SWIMMING", method: "unimplemented", provider: "none"},
            {name: "PARK", method: "unimplemented", provider: "none"}
        ]
    }, 
    {
        name: "SPORTS",
        options: [
            {name: "FOOTBALL", method: "unimplemented", provider: "none"},
            {name: "BASEBALL", method: "unimplemented", provider: "none"},
            {name: "BASKETBALL", method: "unimplemented", provider: "none"},
            {name: "SOCCER", method: "unimplemented", provider: "none"}
        ]
    } 
];


console.log("Starting server");

var methods = [];

pg.connect(conString, function(err, client, done) {
    if(err) {
        return console.error('error fetching client from pool', err);
    }
    logMessage("Connected to db");

    app.get('/fb_reg/:fb_id/:name/:email', function(req, res, next){
        var fb_id = req.params["fb_id"];
        logQuery(fb_id, "fb_reg", "Facebook");

        var name = req.params["name"];
        var email = req.params["email"];

        client.query({
            text: "SELECT COUNT (id) FROM users WHERE fb_id = $1;",
            values: [fb_id]
        }, function(err, result) {
            if(result.rows[0].count == '0') {
                client.query({
                    text: "INSERT INTO users (fb_id, name, email) VALUES ($1, $2, $3) RETURNING id;",
                    values: [fb_id, name, email]
                }, function(err, result) {
                    res.json(result.rows[0].id);
                });
            } else {
                client.query({
                    text: "SELECT id FROM users WHERE fb_id = $1 LIMIT 1;",
                    values: [fb_id]
                }, function(err, result) {
                    res.json(result.rows[0].id);
                });
            }
        });
    });

    app.get('/shake/:fb_id/:course/:fine/:lat/:long', function(req, res, next) {
        var fb_id = req.params["fb_id"];

        var course = req.params["course"];
        var fine = req.params["fine"];
        var lat = req.params["lat"];
        var long = req.params["long"];

        var activity = activities[course - 1].options[fine - 1];

        logQuery(fb_id, activity.name, activity.provider);

        methods[activity.method](lat, long, 10, function(response) {
            res.json(response);
        });

    });
            
    methods["unimplemented"] = function(lat, long, limit, callback) {
        callback("Method not implemented");
    }

    methods["movies"] = function(lat, long, limit, callback) {
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
                callback(movies);
            }
        });
        
    }

    methods["theatres"] = function(lat, long, limit, callback) {
        var radius = 20000;
        var location = lat + ',' + long;

        var params = {
            "country": "us",
            "key": google_api_key,
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
                theatres = []

                body["results"].forEach(function(theatre) {
                    theatres.push({
                        name: theatre.name,
                        address: theatre.vicinity,
                        rating: theatre.rating
                    });
                });

                callback(theatres);
            }
        });
    }
        
    methods["airports"] = function(lat, long, limit, callback) {
        var location = lat + ',' + long;
        var radius = 20000;

        var params = {
            "country": "us",
            "key": google_api_key,
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
                airports = []

                body["results"].forEach(function(airport) {
                    airports.push({
                        name: airport.name,
                        address: airport.vicinity,
                        rating: airport.rating
                    });
                });

                callback(airports);
            }
        });
    }

    methods["weather"] = function (lat, long, limit, callback) {
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

                callback(weather);
            }
        });
    }

    methods["destinations"] = function (lat, long, limit, callback) {
        origin = "DFW";

        var params = {
            origin: origin,
            topdestinations: limit
        };
        
        request({
            url: sabre_dest_url,
            json: true,
            qs: params,
            headers: {
                'Authorization': sabre_auth,
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
                callback(destinations);
            }
        });
    }

    function prices(origin, dest, callback) {
        var dest = req.params["dest"];

        var params = {
            origin: origin,
            destination: dest,
            lengthofstay: "1,2,3,4,5"
        };
        
        request({
            url: sabre_price_url,
            json: true,
            qs: params,
            headers: {
                'Authorization': sabre_auth,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                callback(body);
            }
        });
    }

    function getCity(latLong, callback) {
        var params = {
            latlng: latLong,
            sensor: false,
            key: google_api_key,
            result_type: 'locality'
        };
        
        request({
            url: geocode_url,
            json: true,
            qs: params
        }, function (error, response, body) {
            io.sockets.emit('test', response);
            if (!error && response.statusCode === 200 && body.status == "OK") {
                callback(body.results[0].address_components[0].long_name);
            } else {
                callback("Dallas");
            }
        });
    }

    app.listen(80, function(){
        logMessage('CORS-enabled web server listening on port 80');
    });

    http.listen(8081, function() {
        logMessage('Dashboard websocket listening on *:8081');
    });

    io.on('connection', function(socket) {
        logMessage('Dashboard user connected');

        socket.on('users', function(msg) {
            client.query("SELECT COUNT (id) FROM users;", function(err, result) {
                socket.emit('users', result.rows[0].count);
            });
        });

        socket.on('getCity', function(latLong) {
            getCity(latLong, function(data) {console.log(data);});
        });

    });

    function logQuery(id, query, provider) {
        var logString = query + " accessed by user " + id;
        logMessage(logString);
        client.query({
            text: "INSERT INTO queries (fb_id, query, provider) VALUES ($1, $2, $3)",
            values: [id, query, provider]
        }, function(err, result) {
            if(err) {
                return console.error("Query logging for user " + id + " failed");
            }
        });
    }

    function logMessage(string) {
        console.log(string);
        io.sockets.emit('log', string);
    }
});

