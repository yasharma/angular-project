'use strict';

rxControllers.controller('reviewCtrl', ['$scope', 'localStorageService', '$routeParams', 'reviewSvr',  '$modal',
    function ($scope, localStorageService, routeParams, reviewSvr, $modal) {

        $scope.reviewForm = {};
        $scope.reviewForm.restaurant_id = routeParams.restaurantId;

        $scope.submitReview = function () {
            console.log($scope.reviewForm);
            reviewSvr.postRestaurantReview($scope.reviewForm).then(function (response) {
                console.log(response);
            });
            return false;
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