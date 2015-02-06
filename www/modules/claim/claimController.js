'use strict';

rxControllers.controller('claimCtrl', ['$scope', '$modal', '$routeParams', '$timeout', 'messageCenterService', 'claimSvr',
    'localStorageService',

    function ($scope, $modal, $routeParams, $timeout, messageCenterService, claimSvr, localStorageService) {

        $scope.claimForm = {};
        $scope.claimForm.restaurant_id = $routeParams.restaurantId;
        $scope.percent = 0;
        $scope.max = 5;
        var modalInstance = null;

        var user = localStorageService.get('user');
        $scope.claimForm.user_id = user.id;

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
                    clearForm ();
                }
            });
        }

        function closeModel (){
            modalInstance.close('');
            $(".overlay-main").css("display", "none");
            clearForm ();
        }

        function clearForm (){
            $scope.claimForm = {};
            $scope.claimForm.restaurant_id = $routeParams.restaurantId;
            $scope.claimForm.user_id = user.id;
        }



        $scope.claim = function(){

            modalInstance = $modal.open({
                templateUrl: "modules/claim/views/form.html",
                scope: $scope,
                windowClass: "claim-modal-window",
                controller: "claimCtrl"
            });

            modalInstance.opened.then(function () {
                $scope.showModal = true;
                $(".overlay-main").css("display", "block");
            });

            modalInstance.result.then(function (selectedItem) {
                $scope.selected = selectedItem;
            }, function () {
                $(".overlay-main").css("display", "none");
            });

        }

    }]);