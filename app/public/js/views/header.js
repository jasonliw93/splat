// catch simple errors
"use strict";

// declare splat-app namespace if it doesn't already exist
var splat = splat || {};

// note View-name (Header) matches name of template file Header.html
splat.Header = Backbone.View.extend({
    initialize: function() {
    },
    events:{
        "change .dropdown-menu input[type=radio]" : "dropdownChange",
        "mouseover .dropdown.active" : "showDropdown",
        "mouseout .dropdown.active" : "hideDropdown",
        "click .dropdown" : "showDropdown",
    },
    showDropdown: function(e){
        this.$(".dropdown").addClass('open');
    },
    hideDropdown: function(e){
        this.$(".dropdown").removeClass('open');
    },
    dropdownChange: function(e){
        splat.utils.watcher.trigger('ordering', e.target.value);
        this.$(".dropdown").removeClass('open');
        splat.app.navigate('#movies', {
            replace: true,
            trigger: true
        });
    },
    // render the View
    render: function() {
        // set the view element ($el) HTML content using its template
        this.$el.html(this.template());
        /*
        var self = this;
        
        this.$(".dropdown").hover(
          function() {
            if (self.active === 'Browse Movies'){
                $( this ).addClass( "open" );
            }
          }, function() {
            $( this ).removeClass( "open" );
          });
        
        */
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