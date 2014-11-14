'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
    'ngRoute',
    'indexController',
    'config',
    'LocalStorageModule',
    'directive',
    'restangular',
    'geoLocation',
    'overviewService',
    'restaurantService',
    'reviewService',
    'locationService',
    'photoService',
    //'AngularChart',
    //'GoogleMaps',
    'angularFileUpload',
    'ui.bootstrap',
    'nvd3ChartDirectives',
    'easypiechart'
]).
    config(['$routeProvider', function ($routeProvider) {
        $routeProvider.otherwise({redirectTo: '/index'});
    }])
    .config(["RestangularProvider",function(RestangularProvider){
        RestangularProvider.setRestangularFields({
            id: "id"
        });
        RestangularProvider.setBaseUrl('http://api.iresturant.com/v1/');
        //RestangularProvider.setBaseUrl('http://api.ireview.dev/v1/');
        RestangularProvider.setDefaultRequestParams({
            "access-token" :"f899139df5e1059396431415e770c6dd",
            "per-page" : 8
        });
        RestangularProvider.setDefaultHttpFields({
            withCredentials: false,
            cache: true
        });
        RestangularProvider.setFullResponse(true);
        RestangularProvider.addResponseInterceptor(function(data, operation, what, url, response, deferred) {
            if(operation === 'getList'){
                data = [{
                    items : data.items,
                    _meta : data._meta
                }];
            }
            return data;
        });


    }]);



