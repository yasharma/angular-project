'use strict';

rxControllers.controller('reviewCtrl', ['$scope', 'localStorageService', '$routeParams', 'reviewSvr','$modal', 'messageCenterService', '$timeout',
    function ($scope, localStorageService, routeParams, reviewSvr, $modal, messageCenterService, $timeout) {

        $scope.reviewForm = {};
        $scope.reviewForm.restaurant_id = routeParams.restaurantId;
        $scope.percent = 0;
        $scope.max = 10;
        var modalInstance = null;

        $scope.submitReview = function () {
            if(!$scope.reviewForm.rating){
                messageCenterService.add('danger', 'Please choose a rating.', {timeout : 3000});
                return;
            }

            reviewSvr.postRestaurantReview($scope.reviewForm).then(function (response) {
                if(response.err){
                    response.data.forEach(function(item){
                        messageCenterService.add('danger', item.message, {timeout : 3000});
                    });
                    return;
                }
                getReviews();
                if(response.status < 400){
                    messageCenterService.add('success', 'Your review has been posted successfully.', {timeout : 3000});
                    $timeout(closeModel, 3000);
                }
            });
            return false;
        }

        function closeModel (){
            modalInstance.close('');
            $(".overlay-main").css("display", "none");
            clearForm ();
        }

        function clearForm (){
            $scope.reviewForm = {};
            $scope.reviewForm.restaurant_id = routeParams.restaurantId;
        }


        $scope.hoveringOver = function(value) {
            $scope.percent = 100 * (value / $scope.max);
        };

        $scope.addNewReview = function(){

            modalInstance = $modal.open({
                templateUrl: "modules/review/views/form.html",
                scope: $scope
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


        getReviews();


        function getReviews(params) {
            reviewSvr.getRestaurantReviews(routeParams.restaurantId, params).then(function (reviews) {
                $scope.reviews = reviews.items;
                $scope.maxSize = 6;
                $scope.reviewListItemPerPage = 8;
                $scope.reviewListTotalItems = reviews._meta.totalCount;
                $scope.reviewListCurrentPage = reviews._meta.currentPage + 1;
            });
        }

    }]);