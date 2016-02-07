'use strict';

/* Services */

var requestService = angular.module('requestService', []);

requestService.factory('requestSvr', ['localStorageService', 'Restangular', function (localStorageService, Restangular) {

    return {
        // send request for changing restaurant info
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
        },
        // get the last request for current user and restaurant, if it exists
        getCurrentRequest: function (restaurantId) {
            var resource = 'requests/current';
            var request = Restangular.one(resource);

            return request.get({restaurant_id: restaurantId})
                .then(function (response) {
                    return response.data;
                });
        },
        // get info about request form fields
        getRequestTitles: function () {
            var resource = 'requests/title';
            var request = Restangular.one(resource);
            return request.get().then(function (response) {
                return response.data.items;
            });
        }

    };
}]);