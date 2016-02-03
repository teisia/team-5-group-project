var express = require('express');
var knex = require('../db/knex');
var unirest = require('unirest');
var apiKey = process.env.MEETUP_API_KEY;
var router = express.Router();

function Freebies(){
 return knex('freebies');
};

function Users(){
 return knex('megausers');
};

function Categories(){
 return knex('categories');
};

function getMonth(yearString) {
  if(yearString === "Jan")
    return 1;
  else if(yearString === "Feb")
    return 2;
  else if(yearString === "Mar")
    return 3;
  else if(yearString === "Apr")
    return 4;
  else if(yearString === "May")
    return 5;
  else if(yearString === "Jun")
    return 6;
  else if(yearString === "Jul")
    return 7;
  else if(yearString === "Aug")
    return 8;
  else if(yearString === "Sep")
    return 9;
  else if(yearString === "Oct")
    return 10;
  else if(yearString === "Nov")
    return 11;
  else
    return 12;
}

// get activites and maps page
router.get('/freebies', function(req, res, next) {
  Freebies().select().then(function(results) {
    unirest.get('https://api.meetup.com/2/open_events?&sign=true&photo-host=public&country=us&city=denver&state=co&text=free&category=1,18,4,5,6,8,9,11,14,15,17,20,21&radius=15&status=upcoming&key=' + apiKey)
     .end(function(response) {

       var meetups = response.body.results;
       var startDates = [];
       var endDates = [];

      for (var i = 0; i < meetups.length; i++) {
        date = new Date(meetups[i]["time"]);
        var dateString = date.toString().split(' ');
        var month = getMonth(dateString[1]).toString();
        var day = dateString[2];
        var year = dateString[3];
        var time = dateString[4];
        startDates.push(month + '/' + day + '/' + year + ' ' + time);
      }

      for (var i = 0; i < meetups.length; i++) {
        if(meetups[i]["duration"]) {
          date = new Date(meetups[i]["time"] + meetups[i]["duration"]);
          var dateString = date.toString().split(' ');
          var month = getMonth(dateString[1]).toString();
          var day = dateString[2];
          var year = dateString[3];
          var time = dateString[4];
          endDates.push(month + '/' + day + '/' + year + ' ' + time);
        }
        else
          endDates.push("Not provided");
      }
        res.render('freebies/index', {freebies: results, events: meetups, startDates: startDates, endDates: endDates});
    });
  });
});

// home + freebies all
router.get('/freebies/:categoryid', function(req, res, next) {
  Categories().select().then(function(categoryresults) {
    Freebies().where('category_id',req.params.categoryid).then(function(results) {
      unirest.get('https://api.meetup.com/2/open_events?&sign=true&photo-host=public&country=us&city=denver&state=co&text=free&category=1,18,4,5,6,8,9,11,14,15,17,20,21&radius=15&status=upcoming&key=' + '3f7d255365182d12465e396b6267182e')
       .end(function(response) {
          var meetups = response.body.results;
          res.render('freebies/index', {freebies: results, events: meetups, lat: 39.757785, lng: -105.007142, categories: categoryresults});
        });
    });
  });
});

module.exports = router;
