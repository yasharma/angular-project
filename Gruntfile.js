module.exports = function (grunt) {
    require("matchdep").filterDev("grunt-*").forEach(grunt.loadNpmTasks);
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        copy: {
            sideshow: {
                files: [{
                    expand: true,
                    src: ['**'],
                    cwd: 'bower_components/sideshow/distr/fonts/sideshow-icons/',
                    dest: 'www/css/sideshow-icons/'
                }]
            }
        },
        cssmin: {
            sitecss: {
                options: {
                    banner: '/* My minified css file */'
                },
                files: {
                    'www/css/site.min.css': [
                        'bower_components/nvd3/nv.d3.css',
                        'bower_components/angular-busy/angular-busy.css',
                        'bower_components/angular-bootstrap-lightbox-no-bar/dist/angular-bootstrap-lightbox-no-bar.css',
                        'bower_components/angular-growl/build/angular-growl.min.css',
                        'bower_components/sideshow/distr/stylesheets/sideshow.min.css',
                        'bower_components/sideshow/distr/fonts/sideshow-fontface.min.css',
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

            angular: {
                options: {
                    compress: false,
                    report: 'gzip',
                    //drop_console: true,
                    beautify: true

                    //sourceMap: true,
                    //sourceMapName: 'www/js/app.min.js.map'
                },
                src: ['bower_components/angular/angular.js'],
                dest: 'www/js/angular.min.js'
            },

            applib: {
                options: {
                    compress: false,
                    mangle: false,
                    preserveComments: 'all',
                    beautify: true

                    //drop_console: true,
                    //beautify: true

                    //sourceMap: true,
                    //sourceMapName: 'www/js/app.min.js.map'
                },
                src: [
                    'bower_components/jquery/dist/jquery.js',
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
                    'bower_components/flot/jquery.flot.time.js',
                    'bower_components/angular-flot/angular-flot.js',
                    'bower_components/message-center/message-center.js',
                    'bower_components/ng-file-upload/angular-file-upload-shim.js',
                    'bower_components/ng-file-upload/angular-file-upload.min.js',
                    'bower_components/angular-animate/angular-animate.js',
                    'bower_components/angular-busy/angular-busy.js',
                    'bower_components/angular-bootstrap-lightbox-no-bar/dist/angular-bootstrap-lightbox-no-bar.js',
                    'bower_components/angular-growl/build/angular-growl.min.js',
                    'bower_components/sideshow/distr/dependencies/jazz.min.js',
                    'bower_components/sideshow/distr/dependencies/pagedown.min.js',
                    'bower_components/sideshow/distr/sideshow.js',

                    'components/version/version.js',
                    'components/version/version-directive.js',
                    'components/version/interpolate-filter.js',
                    'components/geolocation.js',
                    'components/config.js',
                    'components/google.maps.js',
                    'lib/extern/angular-local-storage.js',
                    'lib/extern/Highcharts/js/highcharts.js',
                    'lib/extern/jquery.flot.spline.js',
                    'lib/extern/jquery.flot.tooltip.js',
                    'lib/extern/jquery-flot-dashes.js',
                    'lib/extern/angular-dropdown-multiselect-master/angular-dropdown-multiselect.js'
                ],
                dest: 'www/js/lib.js'
            },
            applibmin: {
                options: {
                    compress: false,
                    report: 'min',
                    sourceMap: true,
                    sourceMapName: 'www/js/lib.min.js.map',
                    mangle: false
                },
                src: ['www/js/lib-annotated.js'],
                dest: 'www/js/lib.min.js'
            },
            appmin: {
                options: {
                    compress: false,
                    report: 'min',
                    sourceMap: true,
                    sourceMapName: 'www/js/app.min.js.map'
                },
                src: [

                    'www/modules/home/indexController.js',
                    'www/modules/restaurant/restaurantController.js',
                    'www/modules/Graph/GraphController.js',
                    'www/modules/review/reviewController.js',
                    'www/modules/login/loginController.js',
                    'www/modules/photo/photoController.js',
                    'www/modules/compare/compareController.js',
                    'www/modules/widgets/widgetsController.js',
                    'www/modules/claim/claimController.js',
                    'www/modules/request/requestController.js',
                    'www/modules/profile/profileController.js',
                    'www/modules/directives/directive.js',
                    'www/modules/directives/directive-elements.js',
                    'www/modules/claim/claimService.js',
                    'www/modules/restaurant/restaurantService.js',
                    'www/modules/review/reviewService.js',
                    'www/modules/overview/overviewService.js',
                    'www/modules/location/locationService.js',
                    'www/modules/photo/photoService.js',
                    'www/modules/login/loginService.js',
                    'www/modules/request/requestService.js',
                    'www/modules/user/userService.js',
                    'www/modules/tutorial/tutorial.js',
                    'js/app.plugin.js',
                    'js/app.js',
                    'app.js'

                ],
                dest: 'www/js/app.min.js'
            }
        },
        ngAnnotate: {
            applib: {
                src: ['www/js/lib.js'],
                dest: 'www/js/lib-annotated.js'
            }
        },
        watch: {
            options: {
                dateFormat: function (time) {
                    grunt.log.writeln('The watch finished in ' + time + 'ms at' + (new Date()).toString());
                    grunt.log.writeln('Waiting for more changes...');
                }
            },
            angular: {
                files: ['<%= uglify.angular.src %>'],
                tasks: ['uglify:angular']
            },
            applib: {
                files: ['<%= uglify.applib.src %>'],
                tasks: ['uglify:applib']
            },
            applibmin: {
                files: ['<%= uglify.applibmin.src %>'],
                tasks: ['uglify:applibmin']
            },
            appmin: {
                files: ['<%= uglify.appmin.src %>'],
                tasks: ['uglify:appmin']
            },
            ngAnnotate: {
                files: ['<%= ngAnnotate.applib.src %>'],
                tasks: ['ngAnnotate:applib']
            },
            css: {
                files: ['css/*.css'],
                tasks: ['cssmin']
            },
            less: {
                files: ['less/*.less'],
                tasks: ['less']
            },
            gruntfile: {
                files: ['Gruntfile.js'],
                tasks: ['uglify:applib', 'uglify:applibmin', 'uglify:appmin', 'cssmin', 'less']
            }
        },
        less: {
            production: {
                options: {
                    paths: ["less"],
                    cleancss: true
                },
                files: {
                    "css/bootstrap.css": "less/bootstrap.less",
                    "css/app.css": "less/app.less"
                }
            }
        }
    });
    // Default task.
    grunt.registerTask('default', ['uglify', 'cssmin', 'less', 'copy']);
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-ng-annotate');

};