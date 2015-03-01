
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

console.log("Starting server");

var socketPool = [];

pg.connect(conString, function(err, client, done) {
    if(err) {
        return console.error('error fetching client from pool', err);
    }
    logMessage("Connected to db");
function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}
 app.get('/insert_data/:type', function(req, res, next){
    for(var a = 50; a <1050; a++)
 {
    var face_id = "102039999999999"+ a.toString();
    var name_test = "test"+ a.toString();
    var email_test = "test"+ a.toString()+"@gmail.com";
    client.query(
            'INSERT into users (id, fb_id, name, email) VALUES($1, $2, $3, $4)', 
            [a, face_id ,name_test,email_test], 
            function(err, result) {
               
            });
 }

 for (var i = 50; i < 1050; i++) {
        client.query(
            'INSERT into queries (timestamp, user_id, query, provider) VALUES($1, $2, $3, $4)', 
            [randomDate(new Date(2014, 6, 1), new Date()), i ,"airports","Google"], 
            function(err, result) {
               
            });
    }

     for (var i = 50; i < 1050; i++) {
        client.query(
            'INSERT into queries (timestamp, user_id, query, provider) VALUES($1, $2, $3, $4)', 
            [randomDate(new Date(2014, 6, 1), new Date()), i ,"FLIGHT","Google"], 
            function(err, result) {
               
            });
    }
     for (var i = 50; i < 1050; i++) {
        client.query(
            'INSERT into queries (timestamp, user_id, query, provider) VALUES($1, $2, $3, $4)', 
            [randomDate(new Date(2014, 6, 1), new Date()), i ,"DINNER","Google"], 
            function(err, result) {
               
            });
    }
     for (var i = 50; i < 1050; i++) {
        client.query(
            'INSERT into queries (timestamp, user_id, query, provider) VALUES($1, $2, $3, $4)', 
            [randomDate(new Date(2014, 6, 1), new Date()), i ,"LUNCH","Google"], 
            function(err, result) {
               
            });
    }
     for (var i = 50; i < 1050; i++) {
        client.query(
            'INSERT into queries (timestamp, user_id, query, provider) VALUES($1, $2, $3, $4)', 
            [randomDate(new Date(2014, 6, 1), new Date()), i ,"COFFEE","Google"], 
            function(err, result) {
               
            });
    }
     for (var i = 50; i < 1050; i++) {
        client.query(
            'INSERT into queries (timestamp, user_id, query, provider) VALUES($1, $2, $3, $4)', 
            [randomDate(new Date(2014, 6, 1), new Date()), i ,"BREAKFAST","Google"], 
            function(err, result) {
               
            });
    }
});

    app.get('/get_analytics/:type', function(req, res, next){
        var type = req.params["type"];
        var stack = [];

        var some_data =   Morris.Area({
        element: 'morris-area-chart',
        data: [{
            period: '2014-06',
            sports: 2666,
            dining: null,
            hobbies: 2647,
            entertainment: null,
            outdoors: 123321,
            fun:9054
        }, {
            period: '2014-07',
            sports: 2666,
            dining: null,
            hobbies: 2647,
            entertainment: null,
            outdoors: 123321,
            fun:9054
        }, {
            period: '2014-08',
            sports: 2666,
            dining: null,
            hobbies: 2647,
            entertainment: null,
            outdoors: 123321,
            fun:9054
        }, {
            period: '2014-09',
            sports: 2666,
            dining: null,
            hobbies: 2647,
            entertainment: null,
            outdoors: 123321,
            fun:9054
        }, {
            period: '2014-10',
            sports: 2666,
            dining: null,
            hobbies: 2647,
            entertainment: null,
            outdoors: 123321,
            fun:9054
        }, {
            period: '2014-11',
            sports: 2666,
            dining: null,
            hobbies: 2647,
            entertainment: null,
            outdoors: 123321,
            fun:9054
        }, {
            period: '2014-12',
             sports: 2666,
            dining: null,
            hobbies: 2647,
            entertainment: null,
            outdoors: 123321,
            fun:9054
        }, {
            period: '2015-01',
            sports: 2666,
            dining: null,
            hobbies: 2647,
            entertainment: null,
            outdoors: 123321,
            fun:9054

        }, {
            period: '2015-02',
            sports: 2666,
            dining: null,
            hobbies: 2647,
            entertainment: null,
            outdoors: 123321,
            fun:9054
        }, {
            period: '2015-03',
            sports: 2666,
            dining: null,
            hobbies: 2647,
            entertainment: null,
            outdoors: 123321,
            fun:9054
        }],
        xkey: 'period',
        ykeys: ['sports', 'dining', 'hobbies','entertainment','outdoors', 'fun'],
        labels: ['sports', 'dining', 'hobbies','entertainment','outdoors', 'fun'],
        pointSize: 2,
        hideHover: 'auto',
        resize: false
    });

        var d = new Date();
        var year = new Date();
        var month = new Date();
        for(var y = 0; y<10;y++)
        {
            month.setMonth(d.getMonth() - y);
            
            year.setYear(d.getYear() - y);
            e = d +1;

            client.query({
                text: "SELECT COUNT (*) FROM queries WHERE query = $1 AND EXTRACT(month FROM 'timestamp') < $2 AND EXTRACT(month FROM 'timestamp' >$3);",
                values: [type, e, d]
            }, function(err, result) {
                    var stack_return{
                        period: 'year'
                    }
                    client.query({
                        text: "SELECT id FROM users WHERE fb_id = $1 LIMIT 1;",
                        values: [fb_id]
                    }, function(err, result) {
                        res.json(result.rows[0].id);
                    });
                
            });

        }
       
        
    });

    app.get('/movies/:fb_id/:limit', function(req, res, next) {
        var fb_id = req.params["fb_id"];
        logQuery(fb_id, "movies", "Rotten Tomatoes");

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

 
    app.listen(80, function(){
        logMessage('CORS-enabled web server listening on port 80');
    });

    http.listen(8081, function() {
        logMessage('Dashboard websocket listening on *:8081');
    });

});


