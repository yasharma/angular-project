'use strict';

/* Services */

var restaurantService = angular.module('restaurantService', []);

restaurantService.factory('restaurantSvr', ['localStorageService', 'Restangular', function (localStorageService, Restangular) {

    return {
        // get list of restaurants based on search params
        getRestaurants: function (params) {

            var resource = Restangular.all('restaurants/list');
            var self = this;

            return resource.getList(merge_objects({
                expand: 'restaurantPhotos',
                //latitude: localStorageService.get('latitude'),
                //longitude: localStorageService.get('longitude'),
                //sort: 'popular',
                page: 1
            }, params))
                .then(function (response) {
                    return {
                        items: self.expandRestaurantList(response.data[0].items),
                        _meta: response.data[0]._meta
                    };

                });
        },

        // calculate additional restaurant parameters
        expandRestaurantList: function (restaurants){

            //var restaurants = response.data[0].data;
            for (var i = 0; i < restaurants.length; i++) {
                // price range in $$$$ format
                var priceRange = "";
                for (var k = 0; k <= restaurants[i].price_range; k++) {
                    priceRange = priceRange + "$";
                }
                restaurants[i].price_range_symbol = priceRange;
                // parse trend and rating data and return it in Flot graph format
                var trend_data = JSON.parse(restaurants[i].overviews__trend_series);

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
                        percentile_array.push([key2, restaurants[i].overviews__percentile - obj[key2]]);
                    }
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

                // calculate rating (1-5 format)
                restaurants[i].rating = Math.round(restaurants[i].overviews__percentile / 2) / 10;
                restaurants[i].rating_rounded = Math.round(restaurants[i].overviews__percentile / 20);
                restaurants[i].overviews__percentile_rounded = Math.round(restaurants[i].overviews__percentile * 10) / 10;

                // for trend change circle
                restaurants[i].trend_change = 0.0;
                restaurants[i].trend_change_abs = 0.0;
                // latest trend
                restaurants[i].latest_trend = 0.0;
                // unpack key-value format into arrays
                if(trend_data && trend_data.length > 0){
                    var last1, last2;
                    for (var kkey1 in trend_data[trend_data.length-1]){
                        last1 = trend_data[trend_data.length-1][kkey1];
                    }
                    if(trend_data.length > 1){
                        for (var kkey2 in trend_data[trend_data.length-2]){
                            last2 = trend_data[trend_data.length-2][kkey2];
                        }
                        restaurants[i].trend_change = Math.round((parseFloat(last1) - parseFloat(last2)) * 10) / 10;
                        restaurants[i].trend_change_abs = Math.abs(restaurants[i].trend_change);
                    }
                    restaurants[i].latest_trend = Math.round(parseFloat(last1) * 10) / 10;
                }
            }
            return restaurants;
        },

        // get info for single restaurant
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
        // get restaurant photos
        getPhotos: function (restaurantId) {

            var resource = 'restaurants/' + restaurantId + '/photos';
            var photos = Restangular.all(resource);

            return photos.getList()
                .then(function (response) {
                    return response.data[0].items;
                });
        },
        // get restaurant stats
        getOverviews: function (restaurantId) {

            var resource = 'restaurants/' + restaurantId + '/stats';
            var stat = Restangular.one(resource);

            return stat.get().then(function (response) {
                return response.data.items;
            });

        },
        // get restaurant graph data
        // params: either duration, if specified (year / month, etc), or custom start, end (ISO dates)
        getGraphs: function (restaurantId, duration, start, end) {
            // duration
            // field: 'percentile', 'trend'

            var resource = 'restaurants/' + restaurantId + '/graphs';

            var graphs = Restangular.one(resource);
            var params = {};
            if (duration){
                // if duration is specified, ignore start / end
                params.duration = duration;
            } else {
                params.start = start.toISOString().substring(0,10);
                params.end = end.toISOString().substring(0,10);
            }
            params.type = 'PERCENTILE-TREND-AND-SOURCE';
            // get the data
            return graphs.get(params).then(function (response) {
                // init return arrays
                var source = [];
                var percentile = [];
                var trend = [];
                var ratingBySource = []; // for scatter plot
                angular.forEach(response.data.source, function (value, key) {
                    var label = key;
                    // fill sources array
                    if (value && parseInt(value) > 0) {
                        source.push({
                            label: label,
                            data: parseInt(value)
                        });
                    }
                    // fill ratingBySource array
                    var data = [];
                    angular.forEach(response.data.comments, function (comment) {
                        if(comment.source == label) {
                            data.push([parseInt(comment.date), comment.rating]);
                        }
                    });
                    if (data.length) {
                        ratingBySource.push({
                            source: label,
                            data: data
                        });
                    }
                });
                angular.forEach(response.data.data, function (value, key) {
                    percentile.push([parseInt(key), Math.round(value.percentile / 2) / 10]);
                });
                angular.forEach(response.data.data, function (value, key) {
                    trend.push([parseInt(key), Math.round(value.trend / 2) / 10]);
                });
                return {
                    percentile: percentile, // array of [date, rating] tuples
                    trend: trend,  // array of [date, trend] tuples
                    source: source, // array of {source, numRatings} objects
                    stats: response.data.stats,
                    data: response.data.data,
                    ratingBySource: ratingBySource,
                    comments: response.data.comments
                };
            });

        },
        // get all categories / cuisines
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