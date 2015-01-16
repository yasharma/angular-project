'use strict';

rxControllers.controller('photoCtrl', ['$scope', '$routeParams', 'photoSvr', 'messageCenterService', '$upload',
    function ($scope, routeParams, photoSvr, messageCenterService, $upload) {

        var restaurantId = routeParams.restaurantId;
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

        $scope.deletePhoto = function ($index) {
            var photoId = $scope.photos[$index].id;
            photoSvr.deleteRestaurantPhotos(photoId).then(function (response) {
//                @todo handle response
            });
        }

        $scope.$watch('restaurantPhotos', function () {
            $scope.type = "warning";
            //$scope.onFileSelect = function ($files) {
            for (var i = 0; i < $scope.restaurantPhotos.length; i++) {
                var file = $scope.restaurantPhotos[i];
                $scope.upload = $upload.upload({
                    //@todo change access-token
                    url: 'http://api.iresturant.com/v1/photos/upload?access-token=f899139df5e1059396431415e770c6dd',
                    // upload.php script, node.js route, or servlet url
                    method: 'POST',
                    //headers: {'Authorization': 'xxx'}, // only for html5
                    //withCredentials: true,
                    data: {myObj: $scope.myModelObj, restaurant_id: routeParams.restaurantId, user_id: 1},
                    file: file, // single file or a list of files. list is only for html5
                    //fileName: 'doc.jpg' or ['1.jpg', '2.jpg', ...] // to modify the name of the file(s)
                    fileFormDataName: 'data'
                }).progress(function (evt) {
                    $scope.type = "info";
                    $scope.dynamic = parseInt(100.0 * evt.loaded / evt.total);
                }).success(function (data, status, headers, config) {
                    $scope.type = "success";
                }).error(function () {
                    $scope.type = "danger";
                });
            }
        });

    }]);