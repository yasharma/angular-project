'use strict';

/* Login Services */
var loginService = angular.module('Services', []);

loginService.factory('loginSvr', ['Restangular', function (Restangular) {

    return {

        authenticate: function (params) {

            if(!params || undefined == params) params = {};

            var resource = Restangular.all('authentications/login');
            var formData = $.param(params);

            return resource.post(formData, null, { "Content-Type": "application/x-www-form-urlencoded"})
                .then(function (response) {
                    return {
                        items : response.data.items[0],
                        meta : response.data._meta
                        };
                }, function(response){
                    return {
                        err : 1,
                        status: response.status,
                        statusText: response.statusText
                    };
                });
        }
    };
}]);



