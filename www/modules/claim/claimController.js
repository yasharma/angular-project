'use strict';

rxControllers.controller('claimCtrl', ['$scope', '$modal', '$routeParams', '$timeout', 'messageCenterService', 'claimSvr',
    'localStorageService',

    function ($scope, $modal, $routeParams, $timeout, messageCenterService, claimSvr, localStorageService) {

        initForm();
        var modalInstance = null;

        $scope.claimRestaurant = function () {

            claimSvr.claimRestaurant($scope.claimForm).then(function (response) {
                if (response.err && response.data) {
                    response.data.forEach(function (item) {
                        messageCenterService.add('danger', item.message, {timeout: 3000});
                    });
                    return;
                } else if (response.err) {
                    messageCenterService.add('danger', response.message, {timeout: 3000});
                    return;
                } else if (response.status < 400) {

//                    handle close modal better ways
                    $(".overlay-main").css("display", "none");
                    $(".modal-dialog").css("display", "none");

                    messageCenterService.add('success', 'Your request token has been sent to your email.We will send you the verification code via POST within 3 business days. Your request-token is ' + response.data.request_token);
                } else {
                    initForm();
                }
            });
        };

        $scope.verifyRestaurant = function () {

            claimSvr.verifyRestaurant($scope.activationForm).then(function (response) {
                if (response.err) {
                    response.data.forEach(function (item) {
                        messageCenterService.add('success', item.message, {timeout: 3000});
                    });
                    return;
                }

                if (response.status < 400) {
                    messageCenterService.add('success', 'Congratulations! you have owned restaurant dashboard. Enjoy, exploring all new and exciting features.');
                } else {
                    initForm();
                }
            });
        };

        function initForm() {
            console.log($routeParams);
            $scope.claimForm = {};
            $scope.activationForm = {};
            if (typeof $routeParams.request_token !== "undefined") {
                $scope.activationForm.request_token = $routeParams.request_token;
            }
            if (typeof $routeParams.validation_key !== "undefined") {
                $scope.activationForm.validation_key = $routeParams.validation_key;
            }
            $scope.claimForm.restaurant_id = $routeParams.restaurantId;
            $scope.claimForm.user_id = $scope.user.id;
        }

    }]);