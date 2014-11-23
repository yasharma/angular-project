'use strict';

rxControllers.controller('reviewCtrl', ['$scope', 'localStorageService', '$routeParams', 'reviewSvr',  '$modal',
    function ($scope, localStorageService, routeParams, reviewSvr, $modal) {

        $scope.reviewForm = {};
        $scope.reviewForm.restaurant_id = routeParams.restaurantId;
        $scope.percent = 0;
        $scope.max = 10;
        var modalInstance = null;

        $scope.submitReview = function () {
            //console.log($scope.reviewForm);
            reviewSvr.postRestaurantReview($scope.reviewForm).then(function (response) {
                getReviews();
                if(response.status < 400){
                    modalInstance.close('');
                    $(".overlay-main").css("display", "none");
                }
            });
            return false;
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