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
                        'bower_components/nvd3/nv.d3.css',
                        'js/slider/slider.css',
                        'css/app.v1.css',
                        'css/style.css'
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
                    //'lib/extern/Highcharts/js/highcharts.js',
                    //'lib/extern/angular-chart.js',
                    'models/geolocation.js',
                    'models/config.js',
                    'www/modules/home/indexController.js',
                    'www/modules/directives/directive.js',
                    'www/modules/restaurant/restaurantService.js',
                    'www/modules/review/reviewService.js',
                    'www/modules/overview/overviewService.js',
                    'www/modules/location/locationService.js',
                    'www/modules/photo/photoService.js',
                    //'js/charts/sparkline/jquery.sparkline.min.js',
                    //'js/charts/easypiechart/jquery.easy-pie-chart.js',
                    'bower_components/d3/d3.js',
                    'bower_components/nvd3/nv.d3.js',
                    'bower_components/angularjs-nvd3-directives/dist/angularjs-nvd3-directives.js',
                    'bower_components/jquery.easy-pie-chart/dist/angular.easypiechart.js',
                    'js/slider/bootstrap-slider.js',
                    //'js/app.plugin.js',
                    'app.js'


                ],
                dest: 'www/js/app.min.js'
            }
        }
    });
    // Default task.
    grunt.registerTask('default', ['uglify', 'cssmin']);
};