'use strict';

/* Services */

var restaurantService = angular.module('restaurantService', []);

restaurantService.factory('restaurantSvr', ['localStorageService', 'Restangular', function (localStorageService, Restangular) {

    return {

        getRestaurants: function (params) {

            var resource = Restangular.all('restaurants/list');
            var self = this;

            return resource.getList(merge_objects({
                latitude: localStorageService.get('latitude'),
                longitude: localStorageService.get('longitude'),
                //sort: 'popular',
                page : 1
            },params))
                .then(function (response) {
                    var restaurants = response.data[0].items;
                    //var restaurants = response.data[0].data;
                    for (var i = 0; i < restaurants.length; i++) {
                        var priceRange = "";
                        for (var k = 0; k < restaurants[i].price_range; k++) {
                            priceRange = priceRange + "$";
                        }
                        restaurants[i].price_range_symbol = priceRange;
                        //self.getOverviews(restaurants[i].id,restaurants[i]).then();
                    }

                    return  {
                        items : restaurants,
                        _meta : response.data[0]._meta
                    };
                });
        },

        getRestaurant: function (restaurantId) {

            var resource = 'restaurants/' + restaurantId;
            var restaurant = Restangular.one(resource);

            return restaurant.get()
                .then(function (response) {
                    return response.data;
                });
        },

        getOverviews: function (restaurantId,obj) {

            var resource = 'restaurants/' + restaurantId + '/stats';

            var stat = Restangular.one(resource);
            return stat.get().then(function (response) {
                obj.stats = response.data.items;
                return response.data.items;
            });

        },

        getRestaurantCategories : function(){
            var resource = 'restaurants/category';

            var stat = Restangular.all(resource);
            return stat.getList().then(function (response) {
               return response.data[0].items;
            });
        },

        getRestaurantLocations : function(search){
            var resource = 'restaurants/location';

            var stat = Restangular.all(resource);
            return stat.getList({
                search : search
            }).then(function (response) {
                return response.data[0].items;
            });
        },

        findRestaurant: function(search){
            var resource = 'restaurants/find';

            var stat = Restangular.all(resource);
            return stat.getList({
                search : search
            }).then(function (response) {
                return response.data[0].items;
            });
        }
    };
}]);