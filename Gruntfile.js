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
                        'css/bootstrap.css',
                        'css/font.css',
                        'css/font-awesome.min.css',
                        'css/animate.css',
                        'css/icon.css',
                        'css/app.css',
                        'css/style.css'
                    ]
                },
                webfont: {
                    icons: {
                        src: 'font-awesome/fonts/*',
                        dest: 'www/fonts'
                    }
                }
            }
        },
        uglify: {
            options: {
                compress: false,
                report: 'gzip',
                drop_console: true

                //sourceMap: true,
                //sourceMapName: 'www/js/app.min.js.map'
            },

            angular: {
                src: ['bower_components/angular/angular.js'],
                dest: 'www/js/angular.min.js'
            },

            applib: {
                src: [
                    'bower_components/jquery/dist/jquery.min.js',
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

                    'bower_components/d3/d3.js',
                    'bower_components/nvd3/nv.d3.js',
                    'bower_components/angularjs-nvd3-directives/dist/angularjs-nvd3-directives.js',
                    'bower_components/jquery.easy-pie-chart/dist/angular.easypiechart.js',
                    'bower_components/slimscroll/jquery.slimscroll.js',
                    'bower_components/highcharts-ng/dist/highcharts-ng.js',
                    'bower_components/flot/jquery.flot.js',
                    'bower_components/flot/jquery.flot.resize.js',
                    'bower_components/flot/jquery.flot.canvas.js',
                    'bower_components/flot/jquery.flot.pie.js',
                    'bower_components/flot/jquery.flot.image.js',
                    'bower_components/flot/jquery.flot.fillbetween.js',
                    'bower_components/angular-flot/angular-flot.js',

                    'components/version/version.js',
                    'components/version/version-directive.js',
                    'components/version/interpolate-filter.js',
                    'lib/extern/angular-local-storage.js',
                    'lib/extern/Highcharts/js/highcharts.js',
                    'lib/extern/jquery.flot.spline.js',
                    'lib/extern/jquery.flot.tooltip.min.js'
                ],
                dest: 'www/js/lib.min.js'
            },
            appmin: {
                src: [
                    'models/geolocation.js',
                    'models/config.js',
                    'models/google.maps.js',
                    'www/modules/home/indexController.js',
                    'www/modules/directives/directive.js',
                    'www/modules/restaurant/restaurantService.js',
                    'www/modules/review/reviewService.js',
                    'www/modules/overview/overviewService.js',
                    'www/modules/location/locationService.js',
                    'www/modules/photo/photoService.js',

                    'js/app.plugin.js',
                    'js/app.js',
                    'app.js'

                ],
                dest: 'www/js/app.min.js'
            }
        },
        watch: {
            options: {
                dateFormat: function (time) {
                    grunt.log.writeln('The watch finished in ' + time + 'ms at' + (new Date()).toString());
                    grunt.log.writeln('Waiting for more changes...');
                }
            },
            scripts: {
                files: ['www/modules/**/*.js','Gruntfile.js','app.js','models/*.js'],
                tasks: ['uglify']

            },
            css: {
                files: ['css/*.css'],
                tasks: ['cssmin']
            },
            less: {
                files: ['less/*.less'],
                tasks: ['less']
            }
        },
        less: {
            /*development: {
             options: {
             paths: ["less"]
             },
             files: {
             "css/bootstrap.css": "less/bootstrap.less"
             }
             },*/
            production: {
                options: {
                    paths: ["less"],
                    cleancss: true
                    /*modifyVars: {
                     imgPath: '"http://mycdn.com/path/to/images"',
                     bgColor: 'red'
                     }*/
                },
                files: {
                    "css/bootstrap.css": "less/bootstrap.less",
                    "css/app.css": "less/app.less"
                }
            }
        }
    });
    // Default task.
    grunt.registerTask('default', ['uglify', 'cssmin', 'less']);
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-less');
};