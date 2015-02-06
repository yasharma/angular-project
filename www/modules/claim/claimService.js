'use strict';

/* Services */

var claimService = angular.module('claimService', []);

claimService.factory('claimSvr', ['Restangular', function (Restangular) {

    return {

        claimRestaurant: function (params) {
            var resource = Restangular.all('claims');

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