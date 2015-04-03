'use strict';

// for reference
// templates are dynamic, and must be used with ng-include, not with directives

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

                        return response.map(function (item) {
                            if ("no results found" !== item.formatted) {
                                var formatted = item.formatted.split(' - ');
                                item.searchText = formatted[0];
                                var tags = formatted[1].split(':');
                                item.tag = tags[0];
                                item.tagValue = tags[1];
                            }
                            return item;
                        });
                    });
            }
        },
        scope: {
            setRestaurant: '&',
            placeholder: '@'
        }
    };
}

//angular.module('directive')
//    .directive('navTop' , navTop)
//    .directive('navLeft' , navLeft);
//
//function navTop() {
//    return {
//        restrict: 'E',
//        templateUrl: 'modules/partials/header.html',
//        replace: true
//    };
//}
//
//function navLeft() {
//    return {
//        restrict: 'E',
//        templateUrl: 'modules/partials/sidebar.html',
//        replace: true
//    };
//}