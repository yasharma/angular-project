'use strict';

rxControllers.controller('profileCtrl', ['$scope', '$routeParams', 'requestSvr',
    'messageCenterService', 'localStorageService', 'userSvr', '$interval',
    function ($scope, $routeParams, requestSvr, messageCenterService, localStorageService, userSvr, $interval) {

        // tabs to expand
        $scope.showTabs = {
            restaurant: false,
            profile: false
        };

        $scope.showRestaurantTabs = {
            info: false,
            social: false,
            source: false,
            misc: false,
            billing: false
        };

        // get form field info
        requestSvr.getRequestTitles().then(function (response) {
            $scope.fieldList = response;
            // convert fields to a dictionary, to be able to look up values
            $scope.fields = {};
            angular.forEach($scope.fieldList, function(field) {
                $scope.fields[field.tag + '-' + field.name] = field;
            });
        });

        // expand tab named in url route
        if($routeParams.tab){
            $scope.showTabs[$routeParams.tab] = true;

        } else if ($routeParams.restaurant_tab){
            $scope.showTabs.restaurant = true;
            $scope.showRestaurantTabs[$routeParams.restaurant_tab] = true;
        }

    }]);