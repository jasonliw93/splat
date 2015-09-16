'use strict';

var app =  app || {};   // our app's namespace

app.HelloWorldModel = Backbone.Model.extend({
      defaults: {
        name: 'World'
      }
});
