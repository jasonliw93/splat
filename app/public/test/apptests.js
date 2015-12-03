QUnit.jUnitReport = function(report) {
    console.log(report.xml); // send XML output report to console
}

test('Check model initialization parameters and default values', function() {

    //create a new instance of a User model 
    var user = new splat.User({
        username: "Noah",
        password: "Jonah"
    });
    // test that model has parameter attributes
    equal(user.get("username"), "Noah", "User title set correctly");
    equal(user.get("password"), "Jonah", "User director set correctly");

    // test that Movie model has correct default values upon instantiation
    var movie = new splat.Movie();
    equal(movie.get("poster"), "img/placeholder.png",
        "Movie default value set correctly");
});

test("Inspect jQuery.getJSON's usage of jQuery.ajax", function() {
    this.spy(jQuery, "ajax");
    var getJSONDone = jQuery.getJSON("/movies");
    ok(jQuery.ajax.calledOnce);
    equal(jQuery.ajax.getCall(0).args[0].url, "/movies");
    equal(jQuery.ajax.getCall(0).args[0].dataType, "json");
});

test("Fires a custom event when the state changes.", function() {
    var changeModelCallback = this.spy();
    var movie = new splat.Movie();
    movie.bind("change", changeModelCallback);
    movie.set({
        "title": "Interstellar"
    });
    ok(changeModelCallback.calledOnce,
        "A change event-callback was correctly triggered");
});
test("Test movie model/collection add/save, and callback functions.", function(assert) {
    assert.expect(4); // 4 assertions to be run
    var done1 = assert.async();
    var done2 = assert.async();
    var errorCallback = this.spy();
    var movie = new splat.Movie({
        "__v": 0,
        "dated": "2015-10-21T20:44:27.403Z",
        "director": "Sean Penn",
        "duration": 109,
        "freshTotal": 18,
        "freshVotes": 27,
        "poster": "img/placeholder.png",
        "rating": "R",
        "released": "1999",
        "synopsis": "great thriller",
        "title": "Zorba Games",
        "trailer": "http://archive.org",
        "genre": ["action"],
        "starring": ["Bruce Willis", "Amy Winemouse"]
    }); // model
    var movies = new splat.Movies(); // collection
    // verify Movies-collection URL
    equal(movies.url, "/movies",
        "correct URL set for instantiated Movies collection");
    // test "add" event callback when movie added to collection
    var addModelCallback = this.spy();
    movies.bind("add", addModelCallback);
    movies.add(movie);
    ok(addModelCallback.called,
        "add callback triggered by movies collection add()");
    // make sure user is logged out
    var user = new splat.User({
        username: "tester",
        password: "tester"
    });
    var auth = user.save(null, {
        type: 'put',
        success: function(model, resp) {
            assert.deepEqual(resp, {}, "Signout returns empty response object");
            done1();
        }
    });
    auth.done(function() {
        movie.save(null, {
            error: function(model, error) {
                assert.equal(error.status, 403,
                    "Saving without authentication returns 403 status");
                done2();
            }
        });
    });
});

test("Test movie-delete triggers an error event if unauthenticated.", function(assert) {
    var done1 = assert.async();
    var done2 = assert.async();
    var movie = new splat.Movie(); // model
    var movies = new splat.Movies(); // collection
    movies.add(movie);
    movie.set({
        "_id": "557761f092e40db92c3ccdae"
    });
    // make sure user is logged out
    var user = new splat.User({
        username: "tester",
        password: "tester"
    });
    var auth = user.save(null, {
        type: 'put',
        success: function(model, resp) {
            assert.deepEqual(resp, {}, "Signout returns empty response object");
            done1();
        }
    });
    auth.done(function() {
        // try to destroy an existing movie
        movie.destroy({
            error: function(model, resp) {
                assert.equal(resp.status, 403,
                    "Deleting without authentication returns 403 status code");
                done2();
            }
        });
    });
});

test("Test movie create-delete succeeds in authenticated session.", function(assert) {
    assert.expect(4);
    var done1 = assert.async();
    var done2 = assert.async();
    var done3 = assert.async();
    var done4 = assert.async();
    var movie = new splat.Movie({
        "__v": 0,
        "dated": "2015-10-21T20:44:27.403Z",
        "director": "Sean Penn",
        "duration": 109,
        "freshTotal": 18,
        "freshVotes": 27,
        "poster": "img/placeholder.png",
        "rating": "R",
        "released": "1999",
        "synopsis": "great thriller",
        "title": "Zorba Games",
        "trailer": "http://archive.org",
        "genre": ["action"],
        "starring": ["Bruce Willis", "Amy Winemouse"]
    }); // model
    movie.urlRoot = '/movies';
    // authenticate user with valid credentials
    var user = new splat.User({
        username: "tester",
        password: "tester",
        login: 1
    });
    var auth = user.save(null, {
        type: 'put',
        success: function(model, resp) {
            assert.equal(resp.username, "tester",
                "Successful login with valid credentials");
            done1();
        }
    });
    var saveMovie = $.Deferred();
    auth.done(function() {
        // create new movie model in DB
        movie.save(null, {
            wait: true,
            success: function(model, resp) {
                assert.notEqual(resp._id, undefined,
                    "Saving new model succeeds when authenticated");
                saveMovie.resolve();
                done2();
            }
        });
    });
    // when authentication and saving async calls have completed
    var deleteMovie = $.Deferred();
    $.when(auth, saveMovie).then(function() {
        // attempt to delete newly-saved movie
        movie.destroy({
            success: function(model, resp) {
                assert.equal(resp.responseText, "movie deleted",
                    "Deleting returns 200 status code");
                deleteMovie.resolve();
                done3();
            }
        });
    });
    // attempt to delete a movie twice
    $.when(deleteMovie).then(function() {
        movie.destroy({
            error: function(model, resp) {
                assert.equal(resp.status, 404,
                    "Deleting deleted movie returns 404 status code");
                done4();
            }
        });
    });


});


test("Test movie-save succeeds if session is authenticated.", function(assert) {
    assert.expect(2);
    var done1 = assert.async();
    var done2 = assert.async();
    var done3 = assert.async();
    var done4 = assert.async();
    var done5 = assert.async();
    var movie = new splat.Movie({
        "__v": 0,
        "dated": "2015-10-21T20:44:27.403Z",
        "director": "Sean Penn",
        "duration": 109,
        "freshTotal": 18,
        "freshVotes": 27,
        "poster": "img/placeholder.png",
        "rating": "R",
        "released": "1999",
        "synopsis": "great thriller",
        "title": "Zorba Games",
        "trailer": "http://archive.org",
        "genre": ["action"],
        "starring": ["Bruce Willis", "Amy Winemouse"]
    }); // model
    movie.urlRoot = '/movies';
    var movie2 = new splat.Movie(); // model
    movie2.urlRoot = '/movies';
    // authenticate user with valid credentials
    var user = new splat.User({
        username: "tester",
        password: "tester",
        login: 1
    });
    var auth = user.save(null, {
        type: 'put',
        success: function(model, resp) {
            done1();
        }
    });

    var saveMovie = $.Deferred();
    // create movie
    auth.done(function() {
        movie.save(null, {
            wait: true,
            success: function(model, resp) {
                // set id for fetch to compare movie instance later
                movie2.set("_id", movie.id);
                saveMovie.resolve();
                done2();
            }
        });
    });
    // update the movie
    var updateMovie = $.Deferred();
    $.when(saveMovie).then(function() {
        // attempt to delete newly-saved movie
        movie.save({
            "title": "QUnit!"
        }, {
            success: function(model, resp) {
                assert.equal(resp.title, "QUnit!",
                    "Saving model update succeeds when logged in");
                updateMovie.resolve();
                done3();
            }
        });
    });
    // compare with new instance of movie to double check
    var compareMovie = $.Deferred();
    $.when(updateMovie).then(function() {
        // attempt to delete newly-saved movie
        // fetch existing movie model
        movie2.fetch({
            success: function(model, resp) {
                assert.equal(resp.title, "QUnit!",
                    "Successful updated model on server");
                compareMovie.resolve();
                done4();
            }
        });
    });
    // delete movie
    $.when(compareMovie).then(function() {
        // attempt to delete newly-saved movie
        movie.destroy({
            success: function(model, resp) {
                done5();
            }
        });
    });

});

test("Test review-create-delete if session is authenticated.", function(assert) {
    assert.expect(3);
    var done1 = assert.async();
    var done2 = assert.async();
    var done3 = assert.async();
    var done4 = assert.async();
    var done5 = assert.async();
    var movie = new splat.Movie({
        "__v": 0,
        "dated": "2015-10-21T20:44:27.403Z",
        "director": "Sean Penn",
        "duration": 109,
        "freshTotal": 18,
        "freshVotes": 27,
        "poster": "img/placeholder.png",
        "rating": "R",
        "released": "1999",
        "synopsis": "great thriller",
        "title": "Zorba Games",
        "trailer": "http://archive.org",
        "genre": ["action"],
        "starring": ["Bruce Willis", "Amy Winemouse"]
    }); // model
    movie.urlRoot = '/movies';
    var review = new splat.Review({
        "freshness": 0,
        "reviewName": "1",
        "reviewAffil": "1",
        "reviewText": "1",
        "__v": 0
    });
    // authenticate user with valid credentials
    var user = new splat.User({
        username: "tester",
        password: "tester",
        login: 1
    });
    var auth = user.save(null, {
        type: 'put',
        success: function(model, resp) {
            done1();
        }
    });
    // create movie
    var saveMovie = $.Deferred();
    auth.done(function() {
        movie.save(null, {
            wait: true,
            success: function(model, resp) {
                // set id for fetch to compare movie instance later
                review.urlRoot = '/movies/' + movie.id + '/reviews'
                saveMovie.resolve();
                done2();
            }
        });
    });
    // create review
    var saveReview = $.Deferred();
    $.when(saveMovie).then(function() {
        review.save(null, {
            success: function(model, resp) {
                assert.notEqual(resp._id, undefined,
                    "Saving new review succeeds when authenticated");

                assert.equal(resp.movieId, movie.id,
                    "associate new review to movie id successful");
                saveReview.resolve();
                done3();
            }
        });
    });
    // delete movie
    var deleteMovie = $.Deferred();
    $.when(saveReview).then(function() {
        movie.destroy({
            success: function(model, resp) {
                deleteMovie.resolve();
                done4();
            }
        });
    });
    // check if review is deleted
    $.when(deleteMovie).then(function() {
        review.fetch({
            error: function(model, error) {
                assert.equal(error.status, 404,
                    "review fetch after movie delete returns 403 status");
                deleteMovie.resolve();
                done5();
            }
        });
    });
});


test("Test review-create if session is not authenticated.", function(assert) {
    assert.expect(1);
    var done1 = assert.async();
    var done2 = assert.async();
    var done3 = assert.async();
    var done4 = assert.async();
    var done5 = assert.async();
    var movie = new splat.Movie({
        "__v": 0,
        "dated": "2015-10-21T20:44:27.403Z",
        "director": "Sean Penn",
        "duration": 109,
        "freshTotal": 18,
        "freshVotes": 27,
        "poster": "img/placeholder.png",
        "rating": "R",
        "released": "1999",
        "synopsis": "great thriller",
        "title": "Zorba Games",
        "trailer": "http://archive.org",
        "genre": ["action"],
        "starring": ["Bruce Willis", "Amy Winemouse"]
    }); // model
    movie.urlRoot = '/movies';
    var review = new splat.Review({
        "freshness": 0,
        "reviewName": "1",
        "reviewAffil": "1",
        "reviewText": "1",
        "__v": 0
    });
    // authenticate user with valid credentials
    var user = new splat.User({
        username: "tester",
        password: "tester",
        login: 1
    });
    var auth = user.save(null, {
        type: 'put',
        success: function(model, resp) {
            done1();
        }
    });
    // create movie
    var saveMovie = $.Deferred();
    auth.done(function() {
        movie.save(null, {
            wait: true,
            success: function(model, resp) {
                // set id for fetch to compare movie instance later
                review.urlRoot = '/movies/' + movie.id + '/reviews'
                saveMovie.resolve();
                done2();
            }
        });
    });
    var saveReview = $.Deferred();
    $.when(saveMovie).then(function() {
        // make sure user is logged out
        user = new splat.User({
            username: "tester",
            password: "tester"
        });
        auth = user.save(null, {
            type: 'put',
            success: function(model, resp) {
                done3();
            }
        });
        auth.done(function() {
            // try to destroy an existing movie
            review.save(null, {
                error: function(model, error) {
                    assert.equal(error.status, 403,
                        "Saving review without authentication returns 403 status");
                    saveReview.resolve();
                    done4();
                }
            });
        });
    });
    // delete movie
    $.when(saveReview).then(function() {
        // attempt to delete newly-saved movie
        user = new splat.User({
            username: "tester",
            password: "tester",
            login: 1
        });
        auth = user.save(null, {
            type: 'put',
            success: function(model, resp) {
                movie.destroy({
                    success: function(model, resp) {
                        done5();
                    }
                });
            }
        });
    });

});

test("Test movie schema validation in authenticated session.", function(assert) {
    assert.expect(1);
    var done1 = assert.async();
    var done2 = assert.async();
    var movie = new splat.Movie({
        "__v": 0,
        "dated": "2015-10-21T20:44:27.403Z",
        "director": "Sean Penn",
        "duration": 109,
        "freshTotal": 18,
        "freshVotes": 27,
        "poster": "img/placeholder.png",
        "rating": "R",
        "released": "1999",
        "synopsis": "great thriller",
        "title": "Zorba Games",
        "trailer": "http://archive.org",
        "genre": ["action"]
    }); // model
    movie.urlRoot = '/movies';
    // authenticate user with valid credentials
    var user = new splat.User({
        username: "tester",
        password: "tester",
        login: 1
    });
    var auth = user.save(null, {
        type: 'put',
        success: function(model, resp) {
            done1();
        }
    });
    auth.done(function() {
        // create new movie model in DB
        movie.save(null, {
            wait: true,
            error: function(model, error) {
                ok(true, "Save not worked and returns error");
                done2();
            }
        });

    });
});

test("Test movie dup constaints in authenticated session.", function(assert) {
    assert.expect(1);
    var done1 = assert.async();
    var done2 = assert.async();
    var done3 = assert.async();
    var done4 = assert.async();
    var movie = new splat.Movie({
        "__v": 0,
        "dated": "2015-10-21T20:44:27.403Z",
        "director": "Sean Penn",
        "duration": 109,
        "freshTotal": 18,
        "freshVotes": 27,
        "poster": "img/placeholder.png",
        "rating": "R",
        "released": "1999",
        "synopsis": "great thriller",
        "title": "Zorba Games",
        "trailer": "http://archive.org",
        "genre": ["action"],
        "starring": ["Bruce Willis", "Amy Winemouse"]
    }); // model
    var dupMovie = new splat.Movie({
        "__v": 0,
        "dated": "2015-10-21T20:44:27.403Z",
        "director": "Sean Penn",
        "duration": 109,
        "freshTotal": 18,
        "freshVotes": 27,
        "poster": "img/placeholder.png",
        "rating": "R",
        "released": "1999",
        "synopsis": "great thriller",
        "title": "Zorba Games",
        "trailer": "http://archive.org",
        "genre": ["action"],
        "starring": ["Bruce Willis", "Amy Winemouse"]
    }); // dup model
    movie.urlRoot = '/movies';
    dupMovie.urlRoot = '/movies';
    // authenticate user with valid credentials
    var user = new splat.User({
        username: "tester",
        password: "tester",
        login: 1
    });
    var auth = user.save(null, {
        type: 'put',
        success: function(model, resp) {
            done1();
        }
    });
    var saveMovie = $.Deferred();
    auth.done(function() {
        // create new movie model in DB
        movie.save(null, {
            wait: true,
            success: function(model, error) {
                saveMovie.resolve();
                done2();
            }
        });
    });
    var saveDupMovie = $.Deferred();
    $.when(saveMovie).then(function() {
        // attempt to delete newly-saved movie
        dupMovie.save(null, {
            wait: true,
            error: function(model, error) {
                assert.equal(error.status, 403,
                    "Saving duplicate returns 403 status");
                saveDupMovie.resolve();
                done3();
            }
        });
    });
    // check if review is deleted
    $.when(saveDupMovie).then(function() {
        movie.destroy({
            success: function(model, resp) {
                done4();
            }
        });
    });
});