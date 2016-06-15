// catch simple errors
"use strict";

// declare splat-app namespace, if it doesn't already exist
var splat = splat || {};

splat.utils = {
    showNotice: function(noticeType, noticeText, cssStyle) {
        $('#notification-panel').removeClass("alert-danger alert-warning alert-success alert-info");
        $('#notification-panel').addClass("alert " + cssStyle);
        $('#notification-panel').html('<strong>' + noticeType + '</strong> ' + noticeText);
        $('#notification-panel').stop(true, true).show().fadeOut(5000);
    },

    // hides the notice
    hideNotice: function() {
        $('#notification-panel').stop(true, true).hide();
    },

    authenticate : function(username){
        $('#signupdrop').css("display", 'none');
        $('.signinput').css("display", "none");
        $('#signupForm')[0].reset(); // clear signup form
        $('#greet').html(username); // ugly!
        $('#signoutUser').html('<b>' + username + '</b>');
        $('.btn.signinSubmit').css("display", "none");
        $('.btn.signoutSubmit').css("display", "block");
        $('#addMovie').show(); // auth'd users can add movies
    },

    // alerts the user if the request between the server has failed in the console
    requestFailed: function(response) {
        console.log(response);
        this.showNotice('Error', response.data, 'alert-danger');
    },
    displayValidationErrors: function(messages) {
        for (var key in messages) {
            if (messages.hasOwnProperty(key)) {
                this.addValidationError(key, messages[key]);
            }
        }
        this.showNotice('Error!', 'Fix validation errors and try again',
            'alert-danger');
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
};