angular
    .module("movieForm")
    .directive('uploadVideo', function () {
        return {
            restrict: 'A',
            link: function (scope, element, attr) {
                element.on('change', function (event) {
                    console.log(scope, element, attr, event);
                    if (!event.target.files.length) {
                        return;
                    }
                    if (event.target.files[0].size > 5 * 1024 * 1024) { //5mb limit
                        splat.utils.showNotice('Warning', 'Video is too large!', 'alert-warning');
                        return;
                    }
                    if (event.target.files[0].type !== "video/mp4") { //mp4 only
                        splat.utils.showNotice('Warning', 'Video must be an mp4!', 'alert-warning');
                        return;
                    }
                    if (!scope.vm.movie._id) {
                        splat.utils.showNotice('Warning', 'Please save the movie first', 'alert-warning');
                        return;
                    }
                    // upload video to server using ajax
                    var formdata = new FormData();
                    formdata.append("video", event.target.files[0]);
                    $.ajax({
                        url: "movies/" + scope.vm.movie._id + "/video",
                        type: "POST",
                        data: formdata,
                        processData: false,
                        contentType: false,
                        beforeSend: function (jqXHR) {
                            jqXHR.setRequestHeader("X-CSRF-Token", splat.token);
                        },
                        xhr: function () {  // custom xhr
                            var myXhr = $.ajaxSettings.xhr();
                            if (myXhr.upload) {
                                // replace input field with progress bar
                                $('input[name=trailer]').addClass('hidden');
                                $('.progress').removeClass('hidden');
                                myXhr.upload.addEventListener('progress', function (e) {
                                    // for handling the progress of the upload
                                    var percent = event.loaded / event.total * 100;
                                    // if the movie has been uploaded completely, 
                                    // progress notification will be hidden
                                    // and user will be notified 
                                    $('.progress-bar').css('width',
                                        percent + '%').attr('aria-valuenow', percent);
                                });
                            }
                            return myXhr;
                        },
                    }).done(function (res) {
                        // hide progress bar again and show input field
                        $('.progress').addClass('hidden');
                        $('input[name=trailer]').removeClass('hidden');
                        // set the trailer input and model
                        var videolink = location.origin + res;
                        $('input[name=trailer]').val(videolink);
                        scope.vm.movie.trailer = videolink;
                        splat.utils.showNotice('Note!', 'Video has been uploaded to server', 'alert-info');
                    }).fail(function (res) {
                        splat.utils.requestFailed(res);
                    });
                });


            }
        }
    });