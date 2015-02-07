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
                    messageCenterService.add('success', 'Your access code has been sent to your email.', {timeout : 3000});
                    $timeout(closeModel, 3000);
                }else{
                    initForm ();
                }
            });
        }

        $scope.verifyRestaurant = function () {

            claimSvr.verifyRestaurant($scope.claimForm).then(function (response) {
                if(response.err){
                    response.data.forEach(function(item){
                        messageCenterService.add('danger', item.message, {timeout : 3000});
                    });
                    return;
                }

                if(response.status < 400){
                    //@TODO success
                }else{
                    initForm ();
                }
            });
        }

        function closeModel (){
            modalInstance.close('');
            $(".overlay-main").css("display", "none");
            initForm ();
        }

        function initForm (){
            $scope.claimForm = {};
            $scope.claimForm.restaurant_id = $routeParams.restaurantId;
            $scope.claimForm.user_id = user.id;
        }

    }]);