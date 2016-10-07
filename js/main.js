// MovieRatings

/**
Define API Key to gain access to the movie database
*/
var user = {
  username: 'rdhelms',
  password: 'Natella7712', //Need to have password here to work
  apiKey: 'c9ef0bc9da53c3ef0e7990875f210ab9',
  session: null,
  validSession: false
};

function createSession() {
  var settings = {
    "url": "https://api.themoviedb.org/3/authentication/token/new?api_key=" + encodeURIComponent(user.apiKey),
    "method": "GET"
  };
  $.ajax(settings).done(function (response) {
    console.log(response);
    user.requestToken = response.request_token;
    var settings = {
      "url": "https://api.themoviedb.org/3/authentication/token/validate_with_login?request_token=" + user.requestToken + "&password=" + user.password + "&username=" + user.username + "&api_key=" + user.apiKey,
      "method": "GET",
    };
    $.ajax(settings).done(function (response) {
      console.log(response);
      user.requestToken = response.request_token;
      var settings = {
        "url": "https://api.themoviedb.org/3/authentication/session/new?request_token=" + user.requestToken + "&api_key=" + user.apiKey,
        "method": "GET",
      };
      $.ajax(settings).done(function (response) {
        console.log(response);
        user.session = response.session_id;
        validSession = true;
      });
    });
  });
}

/**
 Create a constructor that will build our movie details previews
*/
function MovieDetails(movieObject) {
  // console.log(movieObject);
  this.info = {
    movieId: movieObject.id,
    title: movieObject.title,
    overview: movieObject.overview,
    rating: movieObject.vote_average,
    poster: 'https://image.tmdb.org/t/p/w185_and_h278_bestv2' + movieObject.poster_path
  };
  this.showFull = function() {
    var source = $('#single-movie-template').html();
    var template = Handlebars.compile(source);
    var context = {
      moviePoster: this.info.poster,
      movieTitle: this.info.title,
      yourRating: 5,
      // overview: this.info.overview,
      averageRating: this.info.rating
    };
    var html = template(context);
    $('.topTwentyBox').html('');
    $(html).prependTo('.topTwentyBox').fadeIn();
    $('.poster').replaceWith('<img class="poster" src=' + this.info.poster + '>');
  };
  this.addToList = function() {
    if (movieObject.poster_path !== null) {
      var $current = $('<div class="topTwenty" data-id=' + this.info.movieId + '></div>').appendTo('.topTwentyBox');
      $('<img src=' + this.info.poster + '>').appendTo($current);
      $('<p>' + this.info.title + '</p>').appendTo($current);
    } else {
      var $current = $('<div class="topTwenty" data-id=' + this.info.movieId + '>No Image</div>').appendTo('.topTwentyBox');
      $('<p>' + this.info.title + '</p>').appendTo($current);
    }
  };
}

/**
 Create a function to search for a specific movie
 */
function showMovie(movieId) {
  var settings = {
    "url": "https://api.themoviedb.org/3/movie/"+ encodeURIComponent(movieId) +"?api_key="+ user.apiKey,
    "method": "GET",
  };
  $.ajax(settings).done(function(response) {
    var current = new MovieDetails(response);
    current.showFull();
  });
}

/**
 Create a function to send the base search request, sending the results to the movie details constructor
 */
function movieSearch(searchString) {
  var settings = {
    "url": "https://api.themoviedb.org/3/search/movie?query=" + encodeURIComponent(searchString) + "&api_key=" + user.apiKey,
    "method": "GET",
  };
  $.ajax(settings).done(function(response) {
    console.log(response);
    $('.topTwentyBox').html('');
    response.results.forEach(function(movie) {
        var newMovie = new MovieDetails(movie);
        newMovie.addToList();
    });
  });
}

/**
 Create a function to search for related movies, sending the results to the movie details constructor
 */
function relatedSearch(movieId) {
  var settings = {
    "url": "https://api.themoviedb.org/3/movie/"+ encodeURIComponent(movieId) +"/similar?api_key="+ user.apiKey,
    "method": "GET",
  };
  $.ajax(settings).done(function(response) {
    console.log(response);
    $('main').html('');
    response.results.reverse().forEach(function(movie) {
        new MovieDetails(movie);
    });
  });
}

/**
* Rate the specified movie
*/
function rateMovie(movieId, rating) {
  var settings = {
    "url": "https://api.themoviedb.org/3/movie/" + movieId + "/rating?session_id=" + user.session + "&api_key=" + user.apiKey,
    "method": "POST",
    "headers": {
      "content-type": "application/json;charset=utf-8"
    },
    "processData": false,
    "data": "{\n  \"value\": " + rating + "\n}"
  };
  $.ajax(settings).done(function (response) {
    console.log(response);
  });
}

function deleteRating(movieId) {
  var settings= {
    "url": "https://api.themoviedb.org/3/movie/" + movieId + "/rating?session_id=" + user.session + "&api_key=" + user.apiKey,
    "method": "DELETE",
    "headers": {
      "content-type": "application/json;charset=utf-8"
    },
    "data": "{}"
  };
  $.ajax(settings).done(function (response) {
    console.log(response);
  });
}

$('form').submit(function(e) {
  e.preventDefault();
  var searchString = $('#movieSearch').val();
  movieSearch(searchString);
  $('#movieSearch').val('');
});

$('.topTwentyBox').on({
  mouseenter: function(){
    $(this).css({
      transition: 'all 0.2s ease',
      transform: 'scale(1.2)'
    });
  },
  mouseleave: function(){
    $(this).css('transform', 'scale(1.0)');
  },
  click: function() {
    var movieId = $(this).attr('data-id');
    showMovie(movieId);
  }
}, '.topTwenty');

$('.topTwentyBox').css('justify-content','flex-start').html('');
createSession();
