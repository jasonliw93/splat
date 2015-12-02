// catch simple errors
"use strict";

// declare splat-app namespace if it doesn't already exist
var splat = splat || {};

// note View-name (Header) matches name of template file Header.html
splat.Header = Backbone.View.extend({
    initialize: function() {
        this.listenTo(Backbone, 'signedUp', this.signedUp);
        this.listenTo(Backbone, 'signedIn', this.signedIn);
        this.listenTo(Backbone, 'signedOut', this.signedOut);
    },
    events: {
        "change #orderForm": "sortOrder",
        "mouseenter #orderdrop.active": "showOrderForm",
        "mouseleave #orderdrop.active": "hideOrderForm",
        "click #ordering": "showOrderForm",
    },
    // helper for signedUp, signedIn to update UI on successful authentication
    authenticatedUI: function(response) {
        this.$('#greet').html(response.username); // ugly!
        this.$('#signoutUser').html('<b>' + response.username + '</b>');
        this.$('.btn.signinSubmit').css("display", "none");
        this.$('.btn.signoutSubmit').css("display", "block");
        this.$('#addMovie').show(); // auth'd users can add movies
    },

    // update UI on successful signup authentication
    signedUp: function(response) {
        this.$('#signupdrop').removeClass('open');
        this.$('.signinput').css("display", "none");
        this.$('#signupForm')[0].reset(); // clear signup form
        this.authenticatedUI(response);
    },

    // update UI on successful signin authentication
    signedIn: function(response) {
        this.$('#signindrop').removeClass('open');
        this.$('[class*="signin"]').css("display", "none");
        this.$('#signinForm')[0].reset(); // clear signin form
        this.authenticatedUI(response);
    },

    // update UI on authentication signout
    signedOut: function() {
        this.$('#greet').html('Sign In');
        this.$('#signoutUser').html('');
        this.$('.btn.signoutSubmit').css("display", "none");
        this.$('.btn.signinSubmit').css("display", "block");
        this.$('[class*="signin"]').css("display", "block");
        this.$('#signindrop').removeClass('open');
        this.$('#addMovie').hide(); // non-auth'd users can't add movies
    },

    showOrderForm: function() {
        this.$("#orderdrop").addClass('open');
    },

    hideOrderForm: function() {
        this.$("#orderdrop").removeClass('open');
    },

    sortOrder: function(e) {
        e.stopPropagation();
        splat.order = e.target.value; // set app-level order field
        Backbone.trigger('orderevent', e);
        this.hideOrderForm(e);
    },
    // render the View
    render: function() {
        // set the view element ($el) HTML content using its template
        this.$el.html(this.template());
        // create new User model for signup
        var newuser = new splat.User();

        this.signupform = new splat.Signup({
            model: newuser
        });
        this.$('#signupDiv').append(this.signupform.render().el);

        this.signinform = new splat.Signin({
            model: newuser
        });
        this.$('#signinDiv').append(this.signinform.render().el);
        if (splat.auth) {
            this.signedIn({
                'userid': splat.userid,
                'username': splat.username
            });
        }
        return this; // support method chaining
    },
    // makes the menu item given by menuItem active
    selectMenuItem: function(menuItem) {
        //removes any active classes under <nav><li>
        $('.nav li').removeClass('active');
        //actives any tags associated to menuItem
        $('.nav a:contains(' + menuItem + ')').parent().addClass('active');
        //this.active = menuItem;
    },
});