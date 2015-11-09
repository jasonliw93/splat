// catch simple errors
"use strict";

// declare splat-app namespace if it doesn't already exist
var splat = splat || {};

// note View-name (Header) matches name of template file Header.html
splat.Header = Backbone.View.extend({
    initialize: function() {
    },
    events:{
        "change #orderForm" : "sortOrder",
        "mouseover #orderdrop.active" : "showOrderForm",
        "mouseout #orderdrop.active" : "hideOrderForm",
        "click #orderdrop" : "showOrderForm",
    },
    showOrderForm: function(){
        this.$("#orderdrop").addClass('open');
    },
    hideOrderForm: function(){
        this.$("#orderdrop").removeClass('open');
    },
    sortOrder: function(e){
        e.stopPropagation();
        splat.order = e.target.value;  // set app-level order field
        Backbone.trigger('orderevent', e);
        this.hideOrderForm();
    },
    // render the View
    render: function() {
        // set the view element ($el) HTML content using its template
        this.$el.html(this.template());
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