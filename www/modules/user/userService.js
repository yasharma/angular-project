'use strict';

/* User Services */
var userService = angular.module('userService', []);

userService.factory('userSvr', ['Restangular', 'restaurantSvr', function (Restangular, restaurantSvr) {

    return {
        // gets user's favorite restaurants
        getFavorites: function () {
            return Restangular.one('users/favourites').withHttpConfig({
                cache: false
            }).get().then(function (response) {
                var restaurants = response.data.items;
                return restaurantSvr.expandRestaurantList(restaurants);
            });
        },
        addFavorite: function (userId, restaurantId){
            var favorites = Restangular.all('favourites');
            var data_encoded = $.param({user_id: userId, restaurant_id: restaurantId});
            return favorites.post(data_encoded, {}, {'Content-Type': 'application/x-www-form-urlencoded'}).
                then(function (response) {
                    return response;
                });
        },
        removeFavorite: function (restaurantId){
            var favorite = Restangular.all('favourites/restaurant/' + restaurantId);
            return favorite.remove()
                .then(function (response) {
                    return response;
                });
        }
    };
}]);

