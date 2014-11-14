'use strict';

/* Services */

var overviewService = angular.module('overviewService', []);

overviewService.factory('overviewSvr', ['localStorageService', 'Restangular', function (localStorageService, Restangular) {

    return {

        getGraph: function (restaurantId) {

            var resource = 'overviews/' + restaurantId + '/graph';
            var graphs = Restangular.all(resource);

            return graphs.getList()
                .then(function (response) {
                    response = response.data[0].items;
                    var graphArr;
                    graphArr = [];
                    for (var i = 0; i < response.length; i++) {
                        graphArr[i] = response[i].percentile;
                    }

                    return graphArr;
                });
        }
    };
}]);