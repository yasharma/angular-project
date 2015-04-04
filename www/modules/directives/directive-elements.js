'use strict';

angular.module('directive', ['restaurantService'])
    .directive('searchBox', ['restaurantSvr', searchBox]);

function searchBox(restaurantSvr) {
    return {
        restrict: 'E',
        templateUrl: 'modules/partials/search-box.html',
        replace: true,
        link: function (scope) {
            scope.navSearch = function (val) {
                return restaurantSvr.findRestaurant(val)
                    .then(function (response) {
                        if (!response.length) {
                            response.push({formatted: "no results found"});
                        }
                        var filterOutKeys = {};
                        angular.forEach(scope.filterOut, function(restaurant){
                            filterOutKeys[restaurant.id] = true;
                        });

                        return response.map(function (item) {
                            if ("no results found" !== item.formatted) {
                                var formatted = item.formatted.split(' - ');
                                item.searchText = formatted[0];
                                var tags = formatted[1].split(':');
                                item.tag = tags[0];
                                item.tagValue = tags[1];
                            }
                            return item;
                        }).filter(function(item){
                            return ! filterOutKeys[item.data.id];
                        });
                    });
            }
        },
        scope: {
            setRestaurant: '&', // action that's called on restaurant selection
            placeholder: '@',
            filterOut: '=' // list of restaurant ids to hide in results
        }
    };
}