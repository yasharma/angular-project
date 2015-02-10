'use strict';

rxControllers.controller('photoCtrl', ['$scope', '$routeParams', 'photoSvr', 'messageCenterService',
    function ($scope, $routeParams, photoSvr, messageCenterService) {

        var restaurantId = $routeParams.restaurantId;
        $scope.dynamic = '';
        $scope.type = '';

        getPhotos();

        function getPhotos(params) {
            if (typeof(params) === "undefined") {
                params = {page: 1};
            }

            photoSvr.getRestaurantPhotos(restaurantId, params).then(function (photos) {
                $scope.photos = photos.items;
                $scope.maxSize = 6;
                $scope.photosListItemPerPage = 8;
                $scope.photosListTotalItems = photos._meta.totalCount;
                $scope.photosListCurrentPage = photos._meta.currentPage + 1;
            });
        }

        $scope.photosListPageChanged = function () {
            var nextPage = $scope.photosListCurrentPage;
            getPhotos({
                page: nextPage
            });
        };

        $scope.deletePhoto = function (photo) {
            var index = $scope.photos.indexOf(photo);
            $scope.photos[index].request =  true;

            photoSvr.deleteRestaurantPhotos(photo).then(function (response) {
                if (index > -1) $scope.photos.splice(index, 1);
            });
        }

        $scope.$watch('restaurantPhotos', function () {
            $scope.type = "warning";
            //$scope.onFileSelect = function ($files) {
            for (var i = 0; i < $scope.restaurantPhotos.length; i++) {
                var file = $scope.restaurantPhotos[i];

//                @TODO take user_id from localstorage in branch rc-56
                var formData = {"data" : file, "restaurant_id" : restaurantId, "user_id": 1};


                photoSvr.uploadRestaurantPhoto(formData).then(function (response) {
                    $scope.dynamic = 100;
                    $scope.type = "success";
                }, function(response){
                    $scope.type = "danger";
                });

            }
        });

    }]);