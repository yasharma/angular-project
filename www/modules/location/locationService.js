'use strict';

/* Services */

var locationService = angular.module('locationService', []);

locationService.factory('locationSvr', ['localStorageService', 'Restangular', function (localStorageService, Restangular) {

    return {

        getLocation: function (restaurantId) {
            var resource = Restangular.one('restaurants/' + restaurantId);

            return resource.get({
                expand: 'locations'
            })
                .then(function (restaurant) {
                    return restaurant.data.locations[0];
                });
        }
    };
}]);