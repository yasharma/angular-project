'use strict';

rxControllers.controller('detailCtrl', ['$scope', '$timeout', '$upload', 'localStorageService', '$location', '$routeParams', 'restaurantSvr', 'geoLocation', 'reviewSvr', 'overviewSvr', 'locationSvr', 'photoSvr', '$anchorScroll', '$modal',
    function ($scope, $timeout, $upload, localStorageService, $location, routeParams, restaurantSvr, geoLocation, reviewSvr, overviewSvr, locationSvr, photoSvr, $anchorScroll, $modal) {

        initTemplate();
        $anchorScroll();

        if (!localStorageService.get('latitude') || !localStorageService.get('longitude')) {
            geoLocation.getLocation()
                .then(function (data) {
                    localStorageService.add('latitude', data.coords.latitude);
                    localStorageService.add('longitude', data.coords.longitude);
                    getRestaurant();
                })
            getRestaurant();
        }
        else {
            getRestaurant();
        }

        $scope.reviewListPageChanged = function () {
            var nextPage = $scope.reviewListCurrentPage;
            getReviews({
                page: nextPage
            });
        };

        $scope.changeLength = function (review) {
            review.textLength = 99999;
        }


        chartData();


        $scope.showPhone = function () {
            alert($scope.restaurant.phone);
        }


        $scope.getPhotos = function () {
            photoSvr.getRestaurantPhotos(routeParams.restaurantId).then(function (photos) {
                $scope.photos = photos.items;
            });
        }

        $scope.onFileSelect = function ($files) {
            //$files: an array of files selected, each file has name, size, and type.
            for (var i = 0; i < $files.length; i++) {
                var file = $files[i];
                $scope.upload = $upload.upload({
                    url: 'http://api.iresturant.com/v1/photos/upload?access-token=f899139df5e1059396431415e770c6dd', //upload.php script, node.js route, or servlet url
                    method: 'POST',
                    //headers: {'header-key': 'header-value'},
                    //withCredentials: true,
                    data: {myObj: $scope.myModelObj, restaurant_id: routeParams.restaurantId, user_id: 1},
                    file: file, // or list of files ($files) for html5 only
                    //fileName: 'doc.jpg' or ['1.jpg', '2.jpg', ...] // to modify the name of the file(s)
                    // customize file formData name ('Content-Disposition'), server side file variable name.
                    fileFormDataName: 'data' //or a list of names for multiple files (html5). Default is 'file'
                    // customize how data is added to formData. See #40#issuecomment-28612000 for sample code
                    //formDataAppender: function(formData, key, val){}
                }).progress(function (evt) {
                    console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
                }).success(function (data, status, headers, config) {
                    // file is uploaded successfully
                    console.log(data);
                });
                //.error(...)
                //.then(success, error, progress);
                // access or attach event listeners to the underlying XMLHttpRequest.
                //.xhr(function(xhr){xhr.upload.addEventListener(...)})
            }
            /* alternative way of uploading, send the file binary with the file's content-type.
             Could be used to upload files to CouchDB, imgur, etc... html5 FileReader is needed.
             It could also be used to monitor the progress of a normal http post/put request with large data*/
            // $scope.upload = $upload.http({...})  see 88#issuecomment-31366487 for sample code.
        };



        function getRestaurant() {
            var restaurantId = routeParams.restaurantId;
            restaurantSvr.getRestaurant(restaurantId).then(function (restaurant) {
                $scope.restaurant = restaurant;
            });

            restaurantSvr.getOverviews(restaurantId, $scope);
        }

        function chartData() {
            getGraphData(routeParams.restaurantId);
        }

        function initTemplate() {
            $scope.templates =
                [
                    {name: 'review-widget.html', url: 'modules/partials/review-widget.html'},
                ];
            $scope.sidebar = 'modules/partials/sidebar.html';
            $scope.header = 'modules/partials/header.html';
            $scope.footer = 'modules/partials/footer.html';
            $scope.reviewBox = 'modules/review/views/index.html';
        }

        function getGraphData(restaurantId) {
            overviewSvr.getGraph(restaurantId).then(function (graph) {
                $scope.lineChartYData = [{
                    "name": "Restaurant Overview",
                    "data": graph
                }];
                $scope.lineChartXData = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            })
        }
    }
])