'use strict';

/* Services */

var requestService = angular.module('requestService', []);

requestService.factory('requestSvr', ['localStorageService', 'Restangular', function (localStorageService, Restangular) {

    return {

        postRestaurantInfoRequest: function (params) {
            var resource = Restangular.all('requests');

            var data_encoded = $.param(params);
            return resource.post(data_encoded, {}, {'Content-Type': 'application/x-www-form-urlencoded'}).
                then(function (response) {
                    return response;
                },
                function (response) {
                    response.err = true;
                    return response;
                });
        }

    };
}]);