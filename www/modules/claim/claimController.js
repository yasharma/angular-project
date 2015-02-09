'use strict';

rxControllers.controller('claimCtrl', ['$scope', '$modal', '$routeParams', '$timeout', 'messageCenterService', 'claimSvr',
    'localStorageService',

    function ($scope, $modal, $routeParams, $timeout, messageCenterService, claimSvr, localStorageService) {

        var user = localStorageService.get('user');
        initForm();
        var modalInstance = null;

        $scope.claimRestaurant = function () {

            claimSvr.claimRestaurant($scope.claimForm).then(function (response) {
                if(response.err){
                    response.data.forEach(function(item){
                        messageCenterService.add('danger', item.message, {timeout : 3000});
                    });
                    return;
                }

                if(response.status < 400){

//                    handle close modal better ways
                    $(".overlay-main").css("display", "none");
                    $(".modal-dialog").css("display", "none");

                    messageCenterService.add('success', 'Your access code has been sent to your email. Your request-token is ' + response.request_token);
                }else{
                    initForm ();
                }
            });
        }

        $scope.verifyRestaurant = function () {

            claimSvr.verifyRestaurant($scope.activationForm).then(function (response) {
                if(response.err){
                    response.data.forEach(function(item){
                        messageCenterService.add('danger', item.message, {timeout : 3000});
                    });
                    return;
                }

                if(response.status < 400){
                    messageCenterService.add('success', 'Congratulations! you have owned restaurant dashboard. Enjoy, exploring all new and exciting features.');
                }else{
                    initForm ();
                }
            });
        }

        function initForm (){
            $scope.claimForm = {};
            $scope.activationForm = {};
            $scope.claimForm.restaurant_id = $routeParams.restaurantId;
            $scope.claimForm.user_id = user.id;
        }

    }]);