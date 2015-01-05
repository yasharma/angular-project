'use strict';

var myApp = angular.module('myApp', ['ngRoute','config','LocalStorageModule','directive','restangular',
    'geoLocation','overviewService','restaurantService','reviewService','locationService','photoService',
    //'AngularChart',
    'GoogleMaps','angularFileUpload','ui.bootstrap','nvd3ChartDirectives','easypiechart','highcharts-ng',
    'angular-flot','Controllers','Services'
]);

// Declare app level module which depends on views, and components
myApp.config(['$routeProvider', function ($routeProvider) {
        $routeProvider.otherwise({redirectTo: '/index'});
}]);

myApp.config(["RestangularProvider",function(RestangularProvider){
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



myApp.run(['$rootScope', '$location', '$window', 'AuthenticationService',function($rootScope, $location, $window, AuthenticationService) {
    $rootScope.$on("$routeChangeStart", function(event, nextRoute, currentRoute) {
        //redirect only if both isLogged is false and no token is set
        if (nextRoute != null && nextRoute.access != null && nextRoute.access.requiredLogin
            && !AuthenticationService.isLogged && !$window.sessionStorage.token) {

            $location.path("/login");
        }
    });
}]);

myApp.config(['$httpProvider', function ($httpProvider) {

    var interceptor = ['$q', '$window', '$location', '$injector', function($q, $window, $location, $injector) {

        return {
            request: function (config) {
                config.headers = config.headers || {};
                if ($window.sessionStorage.token) {
                    //@todo set Autorization string as per server settings
                    //config.headers.Authorization = 'Bearer' + $window.sessionStorage.token;
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
                console.log(rejection);
                // Dynamically get the service since they can't be injected into config
                var AuthenticationService = $injector.get('AuthenticationService');

                if (rejection != null && rejection.status === 401 && ($window.sessionStorage.token || AuthenticationService.isLogged)) {
                    delete $window.sessionStorage.token;
                    AuthenticationService.isLogged = false;
                    $location.path("/login");
                }

                return $q.reject(rejection);
            }
        };
    }];

    $httpProvider.interceptors.push(interceptor);
}]);