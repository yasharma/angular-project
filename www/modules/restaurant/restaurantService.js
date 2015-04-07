'use strict';

/* Services */

var restaurantService = angular.module('restaurantService', []);

restaurantService.factory('restaurantSvr', ['localStorageService', 'Restangular', function (localStorageService, Restangular) {

    return {

        getRestaurants: function (params) {

            var resource = Restangular.all('restaurants/list');
            var self = this;

            return resource.getList(merge_objects({
                expand: 'restaurantPhotos',
                latitude: localStorageService.get('latitude'),
                longitude: localStorageService.get('longitude'),
                //sort: 'popular',
                page: 0
            }, params))
                .then(function (response) {
                    var restaurants = response.data[0].items;
                    //var restaurants = response.data[0].data;
                    for (var i = 0; i < restaurants.length; i++) {
                        var priceRange = "";
                        for (var k = 0; k <= restaurants[i].price_range; k++) {
                            priceRange = priceRange + "$";
                        }
                        restaurants[i].price_range_symbol = priceRange;
                        var trend_data = JSON.parse(restaurants[i].overview__trend_series);
                        var trend_array = [];
                        var percentile_array = [];

                        // Get the average trend value first
                        var sumTrend = 0;
                        var countTrend = 0;
                        for (var id in trend_data) {
                            var obj = trend_data[id];
                            for (var key2 in obj) {
                                sumTrend = sumTrend + obj[key2];
                                countTrend++;
                            }
                        }

                        var averageTrend = sumTrend / countTrend;

                        for (var id in trend_data) {
                            var obj = trend_data[id];
                            for (var key2 in obj) {
                                trend_array.push([key2, averageTrend - obj[key2]]);
                                percentile_array.push([key2, restaurants[i].overview__percentile - obj[key2]]);
                            }
                        }

                        var trend_array_length = trend_array.length;
                        // fill the rest with zeros
                        for (var ii = 0; ii < (12 - trend_array_length); ii++) {
                            trend_array.unshift([ii, 0]);
                        }

                        restaurants[i].trend_data = [
                            {
                                "key": "Trend",
                                "bar": true,
                                "values": trend_array
                            },
                            {
                                "key": "Percentile",
                                "values": percentile_array
                            }];

                        restaurants[i].rating = Math.round(restaurants[i].overview__percentile / 2) / 10;
                        restaurants[i].rating_rounded = Math.round(restaurants[i].overview__percentile / 20);


                        // for trend change circle
                        restaurants[i].trend_change = 0.0;
                        restaurants[i].trend_change_abs = 0.0;
                        if(trend_data && trend_data.length > 1){
                            var last1, last2;
                            for (var kkey1 in trend_data[trend_data.length-1]){
                                last1 = trend_data[trend_data.length-1][kkey1];
                            }
                            for (var kkey2 in trend_data[trend_data.length-2]){
                                last2 = trend_data[trend_data.length-2][kkey2];
                            }
                            restaurants[i].trend_change = Math.round((parseFloat(last1) - parseFloat(last2))*10) / 10;
                            restaurants[i].trend_change_abs = Math.abs(restaurants[i].trend_change);

                        }
                        restaurants[i].trend_change_color = '#bbb';
                        if(restaurants[i].trend_change > 0){
                            restaurants[i].trend_change_color = '#99ff99'; // green
                        } else if(restaurants[i].trend_change < 0){
                            restaurants[i].trend_change_color = '#ff9977'; // red
                        }

                    }

                    return {
                        items: restaurants,
                        _meta: response.data[0]._meta
                    };
                });
        },

        getRestaurant: function (restaurantId) {

            var resource = 'restaurants/' + restaurantId;
            var restaurant = Restangular.one(resource);

            return restaurant.get()
                .then(function (response) {
                    var restaurant = response.data;

                    var priceRange = "";
                    for (var k = 0; k <= restaurant.price_range; k++) {
                        priceRange = priceRange + "$";
                    }
                    restaurant.price_range_symbol = priceRange;

                    return restaurant;
                });
        },

        getPhotos: function (restaurantId) {

            var resource = 'restaurants/' + restaurantId + '/photos';
            var photos = Restangular.all(resource);

            return photos.getList()
                .then(function (response) {
                    return response.data[0].items;
                });
        },

        getOverviews: function (restaurantId) {

            var resource = 'restaurants/' + restaurantId + '/stats';
            var stat = Restangular.one(resource);

            return stat.get().then(function (response) {
                return response.data.items;
            });

        },

        getGraphs: function (restaurantId, duration, start, end) {
            // duration
            // field: 'percentile', 'trend'

            var resource = 'restaurants/' + restaurantId + '/graphs';

            var graphs = Restangular.one(resource);
            var params = {};
            if (duration){
                params.duration = duration;
            } else {
                params.start = start.toISOString().substring(0,10);
                params.end = end.toISOString().substring(0,10);
            }
            params.type = 'PERCENTILE-TREND-AND-SOURCE';
            return graphs.get(params).then(function (response) {
                var source = [];
                var percentile = [];
                var trend = [];
                angular.forEach(response.data.source, function (value, key) {
                    if (value && parseInt(value) > 0) {
                        source.push({
                            label: key,
                            data: parseInt(value)
                        });
                    }
                });
                angular.forEach(response.data.data, function (value, key) {
                    percentile.push([parseInt(key), value.percentile]);
                });
                angular.forEach(response.data.data, function (value, key) {
                    trend.push([parseInt(key), value.trend]);
                });
                return {
                    percentile: percentile,
                    trend: trend,
                    source: source,
                    stats: response.data.stats
                };
            });

        },

        getRestaurantCategories: function () {
            var resource = 'restaurants/category';

            var stat = Restangular.all(resource);
            return stat.getList().then(function (response) {
                return response.data[0].items;
            });
        },

        getRestaurantLocations: function (search) {
            var resource = 'restaurants/location';

            var stat = Restangular.all(resource);
            return stat.getList({
                search: search
            }).then(function (response) {
                return response.data[0].items;
            });
        },

        findRestaurant: function (search) {
            var resource = 'restaurants/find';

            var stat = Restangular.all(resource);
            return stat.getList({
                search: search
            }).then(function (response) {
                return response.data[0].items;
            });
        }
    };
}]);