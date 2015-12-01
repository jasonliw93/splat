 test("Test movie create-delete succeeds in authenticated session.", function(assert) {
    assert.expect( 3 );
    var done1 = assert.async();
    var done2 = assert.async();
    var done3 = assert.async();
    var movie = new splat.Movie({"__v":0,"dated":"2015-10-21T20:44:27.403Z",
	"director":"Sean Punn","duration":109,"freshTotal":18,"freshVotes":27,
	"poster":"img/uploads/5627f969b8236b2b7c0a37b6.jpeg?1448200894795",
	"rating":"R","released":"1999","synopsis":"great thriller",
	"title":"Zbrba Gomez","trailer":"http://archive.org",
	"userid":"54635fe6a1342684065f6959", "genre":["action"],
	"starring":["Bruce Willis,Amy Winemouse"]});  // model
    movie.urlRoot = '/movies';
    // authenticate user with valid credentials
    var user = new splat.User({username:"a", password:"a", login: 1});
    var auth = user.save(null, {
        type: 'put',
        success: function (model, resp) {
            assert.equal( resp.username, "a",
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
