module.exports = function (grunt) {
    require("matchdep").filterDev("grunt-*").forEach(grunt.loadNpmTasks);
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        cssmin: {
            sitecss: {
                options: {
                    banner: '/* My minified css file */'
                },
                files: {
                    'www/css/site.min.css': [
                        'css/less/blue.css',
                        'bs3/css/bootstrap.min.css',
                        'css/bootstrap-reset.css',
                        'font-awesome/css/font-awesome.css',
                        'css/style.css',
                        'css/style-responsive.css'
                    ]
                },
                webfont:{
                    icons:{
                        src: 'font-awesome/fonts/*',
                        dest: 'www/fonts'
                    }
                }
            }
        },
        uglify: {
            options: {
                compress: false
            },
            applib: {
                src: [
                    'bower_components/jquery/dist/jquery.min.js',
                    'bower_components/angular/angular.js',
                    'bower_components/ng-file-upload/angular-file-upload-shim.min.js',
                    'bower_components/ng-file-upload/angular-file-upload.min.js',
                    'bower_components/angular-route/angular-route.js',
                    'bower_components/angular-bootstrap/ui-bootstrap.min.js',
                    'bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js',
                    'bower_components/lodash/dist/lodash.min.js',
                    'bower_components/lodash/dist/lodash.underscore.min.js',
                    'bower_components/restangular/dist/restangular.js',
                    'bower_components/angular-resource/angular-resource.js',
                    'bower_components/bootstrap/dist/js/bootstrap.min.js',
                    'bower_components/lodash/dist/lodash.min.js',
                    'bower_components/bluebird/js/browser/bluebird.js',
                    'bower_components/angular-google-maps/dist/angular-google-maps.min.js',
                    'components/version/version.js',
                    'components/version/version-directive.js',
                    'components/version/interpolate-filter.js',
                    'lib/extern/angular-local-storage.js',
                    'lib/extern/Highcharts/js/highcharts.js',
                    'lib/extern/angular-chart.js',
                    'models/geolocation.js',
                    'models/config.js',
                    'www/modules/home/indexController.js',
                    'www/modules/directives/directive.js',
                    'www/modules/restaurant/restaurantService.js',
                    'www/modules/review/reviewService.js',
                    'www/modules/overview/overviewService.js',
                    'www/modules/location/locationService.js',
                    'www/modules/photo/photoService.js',
                    'js/jquery.dcjqaccordion.2.7.js',
                    'js/jquery.scrollTo.min.js',
                    'js/jQuery-slimScroll-1.3.0/jquery.slimscroll.js',
                    'js/jquery.nicescroll.js',
                    'js/scripts.js',
                    'app.js'

                ],
                dest: 'www/js/app.min.js'
            }
        }
    });
    // Default task.
    grunt.registerTask('default', ['uglify', 'cssmin']);
};