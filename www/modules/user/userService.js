'use strict';

/* User Services */
var userService = angular.module('userService', []);

userService.factory('userSvr', ['Restangular', 'restaurantSvr', '$http', function (Restangular, restaurantSvr, $http) {

    return {
        // gets user's owned restaurants
        getOwnedRestaurants: function () {
            return Restangular.one('users/me').get({expand: 'owned_restaurants'}).then(function (response) {
                var restaurants = response.data.owned_restaurants || [];
                return restaurantSvr.expandRestaurantList(restaurants);
            });
        },
        // gets user's favorite restaurants
        getFavorites: function () {
            return Restangular.one('users/favourites').withHttpConfig({
                cache: false
            }).get({expand: 'restaurantPhotos'}).then(function (response) {
                var restaurants = response.data.items;
                return restaurantSvr.expandRestaurantList(restaurants);
            });
        },
        // add restaurant to user's favorites
        addFavorite: function (userId, restaurantId) {
            var favorites = Restangular.all('favourites');
            var data_encoded = $.param({user_id: userId, restaurant_id: restaurantId});
            return favorites.post(data_encoded, {}, {'Content-Type': 'application/x-www-form-urlencoded'}).
                then(function (response) {
                    return response.data;
                });
        },
        // remove restaurant from user's favorites
        removeFavorite: function (favouriteId) {
            var favorite = Restangular.all('favourites/' + favouriteId);
            return favorite.remove()
                .then(function (response) {
                    return response;
                });
        },
        getLocation: function (ip) {
            return Restangular.one('users/location').withHttpConfig({
                cache: true
            }).get({ip: ip}).then(function (response) {
                return response.data.items;
            });
        },
        getIp: function () {
            return $http({
                method: 'GET',
                url: 'http://jsonip.com',
                cache: true
            }).then(function successCallback(response) {
                return response.data.ip;
            }, function errorCallback(response) {
                console.log("Error");
                console.log(response);
            });
        }
    };
}]);

