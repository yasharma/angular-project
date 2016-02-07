'use strict';

/* Services */

var reviewService = angular.module('reviewService', []);

reviewService.factory('reviewSvr', ['localStorageService', 'Restangular', function (localStorageService, Restangular) {

    return {
        getRestaurantReviews: function (restaurantId, params) {
            var resource = Restangular.all('restaurants/' + restaurantId + '/reviews');

            return resource.withHttpConfig({cache: false}).getList(params)
                .then(function (reviews) {
                    console.log('reviewService line no 16 :: reviewService sending reviews');
                    return {
                        items: reviews.data[0].items,
                        _meta: reviews.data[0]._meta
                    };
                });
        },
        // post a new restaurant review
        postRestaurantReview: function (params) {
            var resource = Restangular.all('reviews');

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