'use strict';

rxControllers.controller('requestCtrl', ['$scope', '$routeParams', 'requestSvr', 'messageCenterService', 'localStorageService',
    function ($scope, routeParams, requestSvr, messageCenterService, localStorageService) {
        $scope.restaurantId = routeParams.restaurantId;
        $scope.request = {};

        $scope.submitRequest = function () {

            $scope.request.restaurant_id = $scope.restaurantId;

            requestSvr.postRestaurantInfoRequest($scope.request).then(function (response) {
                if(response.status < 400){
                    messageCenterService.add('success', 'Your request has been sent for processing.', {timeout : 3000});
                }
            });
            return false;
        };

    }]);