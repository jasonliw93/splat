// Gruntfile.js
module.exports = function(grunt) {

  grunt.initConfig({

    // JS TASKS ================================================================
    // check all js files for errors
    jshint: {
      all: ['public/**/*.js'] 
    },

    // take all the js files and minify them into app.min.js
    uglify: {
      build: {
        files: {
          'public/app.min.js': 
          [
          'public/bower_components/angular/angular.js',
          'public/bower_components/angular-resource/angular-resource.js',
          'public/bower_components/angular-route/angular-route.js',
          'public/bower_components/jquery/dist/jquery.min.js',
          'public/bower_components/bootstrap/dist/js/bootstrap.min.js',
          'public/utils.js',
          'public/app.module.js',
          'public/app.config.js',
          'public/core/core.module.js',
          'public/core/trusted/trusted.filter.js',
          'public/core/movie/movie.module.js',
          'public/core/movie/movie.service.js',
          'public/core/review/review.module.js',
          'public/core/review/review.service.js',
          'public/core/user/user.module.js',
          'public/core/user/user.service.js',
          'public/components/header/header.module.js',
          'public/components/header/header.component.js',
          'public/components/register/register.module.js',
          'public/components/register/register.component.js',
          'public/components/login/login.module.js',
          'public/components/login/login.component.js',
          'public/components/movie-list/movie-list.module.js',
          'public/components/movie-list/movie-list.component.js',
          'public/components/movie-thumb/movie-thumb.module.js',
          'public/components/movie-thumb/movie-thumb.component.js',
          'public/components/movie-detail/movie-detail.module.js',
          'public/components/movie-detail/movie-detail.component.js',
          'public/components/movie-form/movie-form.module.js',
          'public/components/movie-form/movie-form.component.js',
          'public/components/movie-form/movie-form.directive.js',
          'public/components/movie-poster/movie-poster.module.js',
          'public/components/movie-poster/movie-poster.component.js',
          'public/components/movie-poster/movie-poster.directive.js',
          'public/components/review-list/review-list.module.js',
          'public/components/review-list/review-list.component.js',
          'public/components/review-swatch/review-swatch.module.js',
          'public/components/review-swatch/review-swatch.component.js'
          ]
        }
      }
    },

    // CSS TASKS ===============================================================
    cssmin: {
      build: {
        files: {
          'public/css/style.min.css': 
          [
          'public/bower_components/bootstrap/dist/css/bootstrap.css',
          'public/bower_components/bootstrap/dist/css/bootstrap-theme.css',
          'public/css/style.css'
          ]
        }
      }
    },

    // COOL TASKS ==============================================================
    // watch css and js files and process the above tasks
    watch: {
      css: {
        files: ['public/**/*.css', '!public/css/style.min.css'],
        tasks: ['cssmin']
      },
      js: {
        files: ['public/**/*.js', '!public/app.min.js'],
        tasks: ['uglify']
      }
    },

    // watch our node server for changes
    nodemon: {
      dev: {
        script: 'app.js'
      }
    },

    // run watch and nodemon at the same time
    concurrent: {
      options: {
        logConcurrentOutput: true
      },
      tasks: [
        'nodemon', 
        'watch'
      ]
    }   

  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-nodemon');
  grunt.loadNpmTasks('grunt-concurrent');

  grunt.registerTask('default', 
    [
    //'less', 
    'cssmin', 
    //'jshint', 
    'uglify', 
    'concurrent',
    ]);

};