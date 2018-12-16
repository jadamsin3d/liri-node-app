require("dotenv").config();

var Spotify = require('node-spotify-api');
var inquirer = require('inquirer');
var keys = require('./keys.js');
var axios = require('axios');
var request = require('request');
var fs = require('fs');

var spotify = new Spotify(keys.spotify);


function TrackName(artistName, songName, trackLink, albumName) {
    this.artistName = artistName;
    this.songName = songName;
    this.trackLink = trackLink;
    this.albumName = albumName;
    this.print = function () {
        console.log("Artist Name: ", artistName);
        console.log("Song Name: ", songName);
        console.log("Track Preview: ", trackLink);
        console.log("Album Name: ", albumName);
    }
}

function MovieInfo(title, year, imdbRating, tomatoesRating, countryProduced, language, plot, actors) {
    this.title = title;
    this.year = year;
    this.imdbRating = imdbRating;
    this.tomatoesRating = tomatoesRating;
    this.countryProduced = countryProduced;
    this.language = language;
    this.plot = plot;
    this.actors = actors;
    this.print = function () {
        console.log("Title: ", title);
        console.log("Year: ", year);
        console.log("IMDB Rating: ", imdbRating);
        console.log("Rotten Tomatoes Rating: ", tomatoesRating);
        console.log("Country(ies) Produced in: ", countryProduced);
        console.log("Languages Supported: ", language);
        console.log("Plot: ", plot);
        console.log("Actors: ", actors);
    }
}

let answer = "";

let userInput = process.argv.slice(2).join(" ");

if (userInput === "spotify-this-song") {
    SpotifyThisSong();
}

else if (userInput === "concert-this") {
    ConcertThis();
}

else if (userInput === "movie-this") {
    MovieThis();
}

else if (userInput === "do-what-it-says") {
    DoWhatItSays();
}

else {
    console.log("Please enter one of the valid commands 'spotify-this-song', 'concert-this', 'movie-this', or 'do-what-it-says'");
}

function SpotifyThisSong() {
    inquirer
        .prompt([
            {
                type: "input",
                message: "What song would you like to hear?",
                name: "songName"
            }
        ]).then(function (input) {
            answer = input.songName;
            SongLookUp();
        });
}

function SongLookUp() {
    spotify
        .search({ type: 'track', query: answer })
        .then(function (response) {
            song = response.tracks.items[0].artists[0].name;
            artist = response.tracks.items[0].name;
            trackURL = response.tracks.items[0].external_urls.spotify;
            album = response.tracks.items[0].album.name;
            songdata = new TrackName(song, artist, trackURL, album);
            songdata.print();
        })
        .catch(function (err) {
            console.log(err);
        });
}

function ConcertThis() {
    inquirer
        .prompt([
            {
                type: "input",
                message: "What band/artist would you like to see?",
                name: "bandName"
            }
        ]).then(function (input) {
            answer = input.bandName.split(" ").join("+");
            console.log(answer);
            BandLookUp();
        });
}

function BandLookUp() {
    let bandURL = "https://rest.bandsintown.com/artists/" + answer + "/events?app_id=codingbootcamp";

    request(bandURL, function (error, response, body) {
        console.log(JSON.parse(body));
    });
}

function MovieThis() {
    inquirer
        .prompt([
            {
                type: "input",
                message: "What movie would you like to know about?",
                name: "movieName"
            }
        ]).then(function (input) {
            answer = input.movieName.split(" ").join("+");
            MovieLookUp();
        });
}

function MovieLookUp() {
    let movieURL = "http://www.omdbapi.com/?t=" + answer + "&y=&plot=short&apikey=trilogy"

    request(movieURL, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            let movieArray = JSON.parse(body);
            title = movieArray.Title;
            year = movieArray.Year;
            imdbRating = movieArray.Ratings[0].Value;
            tomatoesRating = movieArray.Ratings[1].Value;
            countryProduced = movieArray.Country;
            language = movieArray.Language;
            plot = movieArray.Plot;
            actors = movieArray.Actors;
            moviedata = new MovieInfo(title, year, imdbRating, tomatoesRating, countryProduced, language, plot, actors);
            moviedata.print();
        }
    })
}

function DoWhatItSays() {
    fs.readFile("random.txt", "utf8", function (error, data) {
        if (error) {
            return console.log(error);
        }
        var dataArr = data.split(","); 
        answer = dataArr[1];

        if(dataArr[0] === "spotify-this-song") {
            SongLookUp();
        }
        else if(dataArr[0] === "concert-this") {
                BandLookUp();
            }
        else if(dataArr[0] === "movie-this") {
                MovieLookUp();
        }
        else {
            console.log("Not a valid option, please check the txt file.")
        }
    })
}