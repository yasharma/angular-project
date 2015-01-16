'use strict';

rxControllers.controller('requestCtrl', ['$scope', '$routeParams', 'requestSvr', 'messageCenterService',
    function ($scope, routeParams, requestSvr, messageCenterService) {

        var restaurantId = routeParams.restaurantId;
        $scope.request = {};

        $scope.submitRequest = function () {

            $scope.request.restaurant_id = restaurantId;

            requestSvr.postRestaurantInfoRequest($scope.request).then(function (response) {
                if(response.status < 400){
                    messageCenterService.add('success', 'Your request has been sent for processing.', {timeout : 3000});
                }
            });
            return false;
        }

    }]);