'use strict';

var app = app || {};  // our app's namespace

app.HelloWorldView = Backbone.View.extend({

    // "el" is the top-level HTML element of the view, within which
    // the view's content will be rendered.  By default, it is an
    // anonymous HTML div element.  Alternatively, the view instantiator
    // can set the value of el, or the view can set its own el (generally
    // avoided, since that makes the view too tightly coupled to its use).
    // Here we use the default "div" el.

    // Template with placeholder for name "X" to be greeted, as in: "Hello X".
    // Later, we'll see how to read in templates from separate files.
    template: _.template("<h2>Hello <%= name %></h2>"),

    // "initialize" function is invoked when the view is instantiated.
    initialize: function(){
        // nothing to initialize for this view
    },

    // "$el" is a jQuery-object wrapper around "el", which enables you
    // to use jQuery methods like "html()" to set the content of elements.
    render: function(){
        // set the view element ($el) HTML content using its template
        this.$el.html(this.template(this.model.toJSON()));
        return this;    // support method chaining
    }
});
