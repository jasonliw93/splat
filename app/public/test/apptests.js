QUnit.jUnitReport = function(report) {
    console.log(report.xml);   // send XML output report to console
}

 test('Check model initialization parameters and default values', function() {

  //create a new instance of a User model 
  var user = new splat.User({username: "Noah", password: "Jonah"});
  // test that model has parameter attributes
  equal(user.get("username"), "Noah", "User title set correctly");
  equal(user.get("password"), "Jonah", "User director set correctly");

  // test that Movie model has correct default values upon instantiation
  var movie = new splat.Movie();
  equal(movie.get("poster"), "img/placeholder.png",
	"Movie default value set correctly");
 });

 test( "Inspect jQuery.getJSON's usage of jQuery.ajax", function() {
    this.spy( jQuery, "ajax" );
    var getJSONDone = jQuery.getJSON( "/movies" );
    ok( jQuery.ajax.calledOnce );
    equal( jQuery.ajax.getCall(0).args[0].url, "/movies" );
    equal( jQuery.ajax.getCall(0).args[0].dataType, "json" );
  });

 test("Fires a custom event when the state changes.", function() {
    var changeModelCallback = this.spy();
    var movie = new splat.Movie();
    movie.bind( "change", changeModelCallback );
    movie.set( { "title": "Interstellar" } );
    ok( changeModelCallback.calledOnce,
	"A change event-callback was correctly triggered" );
  });

 test("Test movie model/collection add/save, and callback functions.", function(assert) {
    assert.expect(4);   // 4 assertions to be run
    var done1 = assert.async();
    var done2 = assert.async();
    var errorCallback = this.spy();
    var movie = new splat.Movie({"__v":0,"dated":"2015-10-21T20:44:27.403Z",
	"director":"Sean Penn","duration":109,"freshTotal":18,"freshVotes":27,
	"poster":"img/uploads/5627f969b8236b2b7c0a37b6.jpeg?1448200894795",
	"rating":"R","released":"1999","synopsis":"great thriller",
	"title":"Zorba Games","trailer":"http://archive.org",
	"userId":"54635fe6a1342684065f6959", "genre":["action"],
	"starring":["Bruce Willis", "Amy Winemouse"]});  // model
    var movies = new splat.Movies();  // collection
    // verify Movies-collection URL
    equal( movies.url, "/movies",
		"correct URL set for instantiated Movies collection" );
    // test "add" event callback when movie added to collection
    var addModelCallback = this.spy();
    movies.bind( "add", addModelCallback );
    movies.add(movie);
    ok( addModelCallback.called,
		 "add callback triggered by movies collection add()" );
    // make sure user is logged out
    var user = new splat.User({username:"a", password:"a"});
    var auth = user.save(null, {
        type: 'put',
	    success: function (model, resp) {
	    assert.deepEqual( resp, {}, "Signout returns empty response object" );
    	    done1();
	}
    });
    auth.done(function() { 
	movie.save(null, {
	    error: function (model, error) {
	        assert.equal( error.status, 403,
		    "Saving without authentication returns 403 status");
	        done2();
	    }
       });
    });
  });
    
 test("Test movie-delete triggers an error event if unauthenticated.", function(assert) {
    var done1 = assert.async();
    var done2 = assert.async();
    var movie = new splat.Movie();  // model
    var movies = new splat.Movies();  // collection
    movies.add(movie);
    movie.set({"_id": "557761f092e40db92c3ccdae"});
    // make sure user is logged out
    var user = new splat.User({username:"a", password:"a"});
    var auth = user.save(null, {
        type: 'put',
	success: function (model, resp) {
	    assert.deepEqual( resp, {}, "Signout returns empty response object" );
    	    done1();

	}
    });
    auth.done(function() { 
        // try to destroy an existing movie
        movie.destroy({
	    error: function (model, resp) {
	        assert.equal( resp.status, 403,
		    "Deleting without authentication returns 403 status code" );
	        done2();
	    }
        });
    });
  });

test("Test movie create-delete succeeds in authenticated session.", function(assert) {
    assert.expect( 3 );
    var done1 = assert.async();
    var done2 = assert.async();
    var done3 = assert.async();
    var movie = new splat.Movie({"__v":0,"dated":"2015-10-21T20:44:27.403Z",
    "director":"Sean Penn","duration":109,"freshTotal":18,"freshVotes":27,
    "poster":"img/uploads/5627f969b8236b2b7c0a37b6.jpeg?1448200894795",
    "rating":"R","released":"1999","synopsis":"great thriller",
    "title":"Zorba Games","trailer":"http://archive.org",
    "userId":"5652125cf568e642205f7502", "genre":["action"],
    "starring":["Bruce Willis", "Amy Winemouse"]});  // model
    movie.urlRoot = '/movies';
    // authenticate user with valid credentials
    var user = new splat.User({username:"jason", password:"12345", login: 1});
    var auth = user.save(null, {
        type: 'put',
        success: function (model, resp) {
            assert.equal( resp.username, "jason",
        "Successful login with valid credentials" );
            done1();
        }
    });
    var saveMovie = $.Deferred();
    auth.done(function() { 
    // create new movie model in DB
        movie.save(null, {
        wait: true,
            success: function (model, resp) {
        assert.notEqual( resp._id, undefined,
                    "Saving new model succeeds when authenticated" );
        saveMovie.resolve();
        done2();
            }
        });
    });

    // when authentication and saving async calls have completed
    $.when(auth, saveMovie).then(function() {
        // attempt to delete newly-saved movie
        movie.destroy({
        success: function (model, resp) {
            assert.equal( resp.responseText, "movie deleted",
            "Deleting returns 200 status code" );
            done3();
        }
        });
    });
  });

 test("Test movie-save succeeds if session is authenticated.", function(assert) {
    assert.expect( 5 );
    var done1 = assert.async();
    var done2 = assert.async();
    var done3 = assert.async();
    var done4 = assert.async();
    var done5 = assert.async();
    var movie = new splat.Movie({"__v":0,"dated":"2015-10-21T20:44:27.403Z",
    "director":"Sean Penn","duration":109,"freshTotal":18,"freshVotes":27,
    "poster":"img/uploads/5627f969b8236b2b7c0a37b6.jpeg?1448200894795",
    "rating":"R","released":"1999","synopsis":"great thriller",
    "title":"Zorba Games","trailer":"http://archive.org",
    "userId":"5652125cf568e642205f7502", "genre":["action"],
    "starring":["Bruce Willis", "Amy Winemouse"]});  // model
    movie.urlRoot = '/movies';
    // authenticate user with valid credentials
    var user = new splat.User({username:"jason", password:"12345", login: 1});
    var auth = user.save(null, {
        type: 'put',
        success: function (model, resp) {
            assert.equal( resp.username, "jason",
        "Successful login with valid credentials" );
            done1();
        }
    });
    var saveMovie = $.Deferred();
    auth.done(function() { 
    // create new movie model in DB
        movie.save(null, {
        wait: true,
            success: function (model, resp) {
        assert.notEqual( resp._id, undefined,
                    "Saving new model succeeds when authenticated" );
        saveMovie.resolve();
        done2();
            }
        });
    });
    var movie2 = new splat.Movie();  // model
    // when authentication and saving async calls have completed
    var fetchMovie = $.Deferred();
    $.when(auth, saveMovie).then(function() {
        // attempt to delete newly-saved movie
        movie2.set("_id", movie.id);
        movie2.urlRoot = '/movies';
        // fetch existing movie model
        var movieFetch = movie2.fetch({
            success: function(movie2, resp) {
                assert.equal(movie2.id, movie.id,
                "Successful movie fetch" );
                fetchMovie.resolve();
                done3();
            }
        });
    });

    var updateMovie = $.Deferred();
    $.when(fetchMovie).then(function() {
        // attempt to delete newly-saved movie
        movie2.save({"title": "QUnit!"}, {
            success: function (model, resp) {
                assert.equal( resp.title, "QUnit!",
                    "Saving model update succeeds when logged in" );
                updateMovie.resolve();
                done4();
            }
        });
    });
    $.when(updateMovie).then(function() {
        // attempt to delete newly-saved movie
        movie2.destroy({
            success: function (model, resp) {
                assert.equal( resp.responseText, "movie deleted",
                "Deleting returns 200 status code" );
                done5();
            }
        });
    });


  });

