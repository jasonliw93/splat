// catch simple errors
"use strict";

// declare splat-app namespace, if it doesn't already exist
var splat = splat || {};

splat.utils = {
    // shows a fade in notice
    watcher : _.extend({}, Backbone.Events),
    showNotice: function(noticeType, noticeText, cssStyle) {
        $('#notification-panel').removeClass("alert-danger alert-warning alert-success alert-info");
        $('#notification-panel').addClass("alert " + cssStyle);
        $('#notification-panel').html('<strong>' + noticeType + '</strong> ' + noticeText);
        $('#notification-panel').stop(true,true).show().fadeOut(5000);
    },
    
    // hides the notice
    hideNotice: function() {
        $('#notification-panel').stop(true,true).hide();
    },
    
    // alerts the user if the request between the server has failed in the console
    requestFailed: function(response) {
        console.log(response);
        alert(response.responseText);
    },
    
    // validation error notices
    addValidationError: function(field, message) {
        // use jQuery to address input field by its name attribute
        var formGroup = $('.form-group').find('input[name=' + field + '], textarea[name=' + field + ']').parent().parent();
        formGroup.addClass('has-error');
        $('.help-block', formGroup).html(message);
    },
    
    // removes the error notices
    removeValidationError: function(field) {
        var formGroup = $('.form-group').find('input[name=' + field + '], textarea[name=' + field + ']').parent().parent();
        formGroup.removeClass('has-error');
        $('.help-block', formGroup).html('');
    },
    templateHelpers : {
        getReviewImage: function(freshVotes, freshTotal){            
            if (freshVotes/freshTotal >= 0.5) { 
                return '/img/fresh_lg.png';
            }else{
                return '/img/rotten_lg.png';
            }
        },
        getReviewText: function(freshVotes, freshTotal){            
            return (freshVotes/freshTotal*100).toFixed(1) + '% (' + freshTotal+ ')';
        },
        formatArray: function(array){
            return array.join(', ');
        },
        getTrailer: function(id, trailer){
            if (trailer){
                return trailer;
            }else{
                return 'movies/' + id + '/video';
            }
        }
    },
    // Asynchronously load templates located in separate .html files using
    // jQuery "deferred" mechanism, an implementation of Promises.  Note we
    // depend on template file names matching corresponding View file names,
    // e.g. Home.html and home.js which defines Backbone View "Home".
    /*
     * @param {[String]} views:  filenames of templates to be loaded
     * @param {function} callback:  callback function invoked when file is loaded
     */
    loadTemplates: function(views, callback) {

        // Array of deferred actions to keep track of template load status
        var deferreds = [];

        // Process each template-file in views array
        /*
         * @param {[integer]} index:  position of view template within views array
         * @param {[String]} view:  root name (w/o .html) of view template file
         */
        var self = this;
        $.each(views, function(index, view) {
            // If an associated Backbone view is defined, set its template function
            if (splat[view]) {

                // Push task of retrieving template file into deferred array.
                // Task performs "get" request to load the template, then passes
                // resulting template data to anonymous function to process it.
                /*
                 * @param {String} data:  HTML from template file as String
                 */
                deferreds.push($.get('tpl/' + view + '.html', function(data) {
                    // Set template function on associated Backbone view.
                    splat[view].prototype.template = function(x){
                        return _.template(data)(_.extend(x, self.templateHelpers));
                    }
                }));

                // No Backbone view file is defined; cannot set template function.
            } else {
                console.log(view + " not found");
            }
        });

        // When all deferred template-loads have completed,
        // invoke callback function.
        $.when.apply(null, deferreds).done(callback);
    }
};