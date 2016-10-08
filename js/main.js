// MovieRatings

/**
Define API Key to gain access to the movie database
*/
var user = {
  username: 'rdhelms',
  password: 'Natella7712', //Need to have password here to work
  apiKey: 'c9ef0bc9da53c3ef0e7990875f210ab9',
  session: null,
  validSession: false,
  id: null
};

var currentMovieRating = undefined;

// Create authorized session in order to rate movies
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
        getAccount();
      });
    });
  });
}

//Global variables to be able to access rating information
var rating = 10;
var ratingStars = [];
var leftEmpty = 'assets/L-half-empty-01-01.png';
var rightEmpty = 'assets/R-half-empty-01.png';
var leftFull = 'assets/L-half-solid-01.png';
var rightFull = 'assets/R-half-solid-01.png';

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
    currentRating: undefined,
    poster: 'https://image.tmdb.org/t/p/w185_and_h278_bestv2' + movieObject.poster_path
  };
  this.showFull = function() {
    var source = $('#single-movie-template').html();
    var template = Handlebars.compile(source);
    var context = {
      moviePoster: this.info.poster,
      movieTitle: this.info.title,
      yourRating: 5,
      averageRating: this.info.rating,
      overview: this.info.overview
    };
    var html = template(context);
    $('.topTwentyBox').html('');
    $(html).prependTo('.topTwentyBox').fadeIn();
    $('.poster').replaceWith('<img class="poster" src=' + this.info.poster + '>');
    var $stars = $('<div>').attr('class','stars').css({
      height: '40px',
      width: '60%',
      marginTop: '20px',
      display: 'flex'
    });
    for (var index = 0; index < 10; index++) {
      var $starLeft = $('<img>').attr({
          'src': leftEmpty,
          'class': 'leftStar star',
          'data-id': this.info.movieId,
          'star-id': index
        }).css({
          height: '100%',
          width: '10%',
      }).appendTo($stars);
      ratingStars.push($starLeft);
      index++;
      var $starRight = $('<img>').attr({
          'src': rightEmpty,
          'class': 'rightStar star',
          'data-id': this.info.movieId,
          'star-id': index
        }).css({
          height: '100%',
          width: '10%',
      }).appendTo($stars);
      ratingStars.push($starRight);
    }
    $('.movieInfo').append($stars);
    // Add box to show current rating
    $('<p>').attr({
      class: 'currentRating',
      'data-id': this.info.movieId
    }).css({
      border: '1px solid black',
      margin: '20px 0',
      padding: '10px'
    }).appendTo($('.movieInfo'));

    if (this.info.currentRating !== undefined) {
      $('.currentRating').html("Current Rating: " + this.info.currentRating);
      for (var index = 0; index < this.info.currentRating; index++) {
        if (index%2 == 0) {
          $stars.find('.star[star-id=' + index + ']').attr('src',leftFull);
        } else {
          $stars.find('.star[star-id=' + index + ']').attr('src', rightFull);
        }
      }
    } else {
      $('.currentRating').html("Not Yet Rated");
    }

    // Box to display average ratings for that movie.
    $('.ratings').css('background', 'none');
    $('.ratings p').first().html('Average Rating: ');

    // Add delete rating button
    $('<button>').attr({
      class: 'deleteRating',
      'data-id': this.info.movieId
    }).css({
      margin: '20px 0',
      padding: '10px'
    }).html('Delete Rating').appendTo($('.movieInfo'));
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
 Get account information, especially user id
 */
function getAccount() {
  var settings = {
    "url": "https://api.themoviedb.org/3/account?session_id=" + user.session + "&api_key=" + user.apiKey,
    "method": "GET",
  };
  $.ajax(settings).done(function (response) {
    user.id = response.id;
    console.log(user.id);
  });
}

/**
 Get user's previously rated movies
 */
function getUserRated() {
  var settings = {
    "url": "https://api.themoviedb.org/3/account/6425926/rated/movies?sort_by=created_at.asc&session_id=c88664ee22714c1f48f80fc5f05743a40ff6ed67&api_key=c9ef0bc9da53c3ef0e7990875f210ab9",
    "method": "GET",
  }
  $.ajax(settings).done(function (response) {
    response.results.forEach(function(movie) {
        var newMovie = new MovieDetails(movie);
        newMovie.addToList();
    });
  });
}

/**
 Get user's rating for a specific movie
 */
function getCurrentRating(movieClicked, movieId) {
  var settings = {
    "url": "https://api.themoviedb.org/3/movie/" + movieId + "/account_states?api_key=" + user.apiKey + "&session_id=" + user.session,
    "method": "GET",
  }
  $.ajax(settings).done(function (response) {
    movieClicked.info.currentRating = response.rated.value;
    currentMovieRating = response.rated.value;
    console.log(movieClicked.info.currentRating);
    movieClicked.showFull();
  });
}


/**
 Create a function to search for a specific movie
 */
function getMovie(movieId) {
  var settings = {
    "url": "https://api.themoviedb.org/3/movie/"+ encodeURIComponent(movieId) +"?api_key="+ user.apiKey,
    "method": "GET",
  };
  $.ajax(settings).done(function(response) {
    var movieClicked = new MovieDetails(response);
    getCurrentRating(movieClicked, movieId);
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
 Get the top rated movies
 */
 function getTopRated() {
    var settings = {
      "url": "https://api.themoviedb.org/3/movie/top_rated?api_key=" + user.apiKey,
      "method": "GET",
    }
    $.ajax(settings).done(function (response) {
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
* Rate the specified movie with the given rating
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

// When the user clicks the delete Rating button, remove the rating from the database
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

// When user submits a search, send the request for the relevant movies
$('form').submit(function(e) {
  e.preventDefault();
  var searchString = $('#movieSearch').val();
  movieSearch(searchString);
  $('#movieSearch').val('');
});

// When the movies are hovered over, scale them larger. When they are clicked, show the full movie view.
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
    getMovie(movieId);
  }
}, '.topTwenty');

// When the rating stars are hovered over, fill the proper stars. When it's clicked, update the rating of that movie.
var currentRating = 0;
var currentMovie = 0;
$('main').on({
  mouseenter: function() {
    for (var index = 0; index < 10; index++) {
      if (index%2 == 0) {
        $(this).siblings('.star[star-id=' + index + ']').addBack().attr('src',leftEmpty);
      } else {
        $(this).siblings('.star[star-id=' + index + ']').addBack().attr('src', rightEmpty);
      }
    }
    currentRating = $(this).attr('star-id');
    currentMovie = $(this).attr('data-id');
    for (var index = 0; index <= currentRating; index++) {
      if (index%2 == 0) {
        $(this).siblings('.star[star-id=' + index + ']').addBack().attr('src',leftFull);
      } else {
        $(this).siblings('.star[star-id=' + index + ']').addBack().attr('src', rightFull);
      }
    }
  },
  mouseleave: function() {
    currentRating = $(this).attr('star-id');
    currentMovie = $(this).attr('data-id');
    if (currentMovieRating === undefined) {
      for (var index = 0; index < 10; index++) {
        if (index%2 == 0) {
          $('.stars').find('.star[star-id=' + index + ']').attr('src',leftEmpty);
        } else {
          $('.stars').find('.star[star-id=' + index + ']').attr('src', rightEmpty);
        }
      }
    } else {
      for (var index = 0; index < 10; index++) {
        if (index < currentMovieRating) {
          if (index%2 == 0) {
            $('.stars').find('.star[star-id=' + index + ']').attr('src',leftFull);
          } else {
            $('.stars').find('.star[star-id=' + index + ']').attr('src', rightFull);
          }
        } else {
          if (index%2 == 0) {
            $('.stars').find('.star[star-id=' + index + ']').attr('src',leftEmpty);
          } else {
            $('.stars').find('.star[star-id=' + index + ']').attr('src', rightEmpty);
          }
        }
      }
    }
  },
  click: function() {
    currentMovieRating = parseInt(currentRating) + 1;
    // divide by two for 5-star rating
    // rating = (current + 1)/2;
    rateMovie(currentMovie, parseInt(currentRating) + 1);
    $('.currentRating').text("Current Rating: " + (parseInt(currentRating) + 1));
  }
}, '.star');

// When the delete rating button is clicked, delete the user's rating for that movie.
$('main').on({
  click: function() {
    currentMovieRating = 0;
    for (var index = 0; index < 10; index++) {
      if (index%2 == 0) {
        $('.stars').find('.star[star-id=' + index + ']').attr('src',leftEmpty);
      } else {
        $('.stars').find('.star[star-id=' + index + ']').attr('src', rightEmpty);
      }
    }
    var movieId = $(this).attr('data-id');
    $('.currentRating').text("Rating Removed");
    deleteRating(movieId);
  }
}, '.deleteRating');


// When the top twenty button is clicked, view the 20 top rated movies.
$('.viewTopTwenty').click(function() {
  $('.topTwentyBox').html('');
  getTopRated();
});

// Create the button to view your own rated movies.
$('<button>').attr({
  class: 'viewYourRated'
}).css({
  padding: '10px'
}).html("Movies You've Rated").appendTo($('.right'));

//When the viewYourRated button is clicked, show the user's rated movies.
$('.viewYourRated').click(function() {
  $('.topTwentyBox').html('');
  getUserRated();
})

// Initialize by clearing the main area and filling it with the top rated movies.
createSession();
$('.topTwentyBox').html('');
getTopRated();
