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
        },

        getCurrentRequest: function (restaurantId) {
            var resource = 'requests/current';
            var request = Restangular.one(resource);

            return request.get({restaurant_id: restaurantId})
                .then(function (response) {
                    return response.data;
                });
        },

        getRequestTitles: function () {
            var resource = 'requests/title';
            var request = Restangular.one(resource);
            return request.get().then(function (response) {
                return response.data.items;
            });
        }

    };
}]);