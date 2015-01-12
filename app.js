'use strict';

var myApp = angular.module('myApp', ['ngRoute','config','LocalStorageModule','directive','restangular',
    'geoLocation','overviewService','restaurantService','reviewService','locationService','photoService',
    //'AngularChart',
    'GoogleMaps','angularFileUpload','ui.bootstrap','nvd3ChartDirectives','easypiechart','highcharts-ng',
    'angular-flot','Controllers','Services', 'MessageCenterModule'
]);

// Declare app level module which depends on views, and components
myApp.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.otherwise({redirectTo: '/index'});
}]);

myApp.config(["RestangularProvider", function(RestangularProvider){
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

myApp.factory('AuthenticationService', function() {
    var auth = {
        isLogged: false
    }

    return auth;
});



myApp.run(['$rootScope', '$location', 'localStorageService', 'AuthenticationService',function($rootScope, $location, localStorageService, AuthenticationService) {
    $rootScope.$on("$routeChangeStart", function(event, nextRoute, currentRoute) {
        //redirect only if both isLogged is false and no token is set
        if (nextRoute != null && nextRoute.access != null && nextRoute.access.requiredLogin
            && !AuthenticationService.isLogged && !localStorageService.get('token')) {
            AuthenticationService.isLogged = 0;
            alert('no logged');
            $location.path("/login");
        }
    });
}]);

myApp.config(['$httpProvider', 'RestangularProvider', function ($httpProvider, RestangularProvider) {

    var interceptor = ['$q','$location', '$injector', '$rootScope', 'localStorageService', 'AuthenticationService', function($q, $location, $injector, $rootScope, localStorageService, AuthenticationService) {

        return {
            request: function (config) {
                config.headers = config.headers || {};
                var token = localStorageService.get('token');
                if (token) {
                    RestangularProvider.setDefaultRequestParams({
                        "access-token" :token,
                        "per-page" : 8
                    });
                    AuthenticationService.isLogged =1;
                    $rootScope.isLogged = 1;
                }
                return config;
            },

            requestError: function(rejection) {
                return $q.reject(rejection);
            },

            response: function (response) {
                return response || $q.when(response);
            },

            // Revoke client authentication if 401 is received

            responseError: function(rejection) {
                // Dynamically get the service since they can't be injected into config
                var AuthenticationService = $injector.get('AuthenticationService');
                var token = localStorageService.get('token');

                if (rejection != null && rejection.status === 401 && (token || AuthenticationService.isLogged)) {
                    localStorageService.remove('token');
                    AuthenticationService.isLogged = false;
                    $rootScope.isLogged = false;
                    $location.path("/login");
                }

                return $q.reject(rejection);
            }
        };
    }];

    $httpProvider.interceptors.push(interceptor);
}]);
