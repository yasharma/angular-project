'use strict';

angular.module('indexController', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider
            .when('/index', {
                templateUrl: 'index/index.html',
                controller: 'indexCtrl'
            })
            .when('/detail/:restaurantId', {
                templateUrl: 'index/detail.html',
                controller: 'detailCtrl'
            });
    }])

    .controller('indexCtrl', ['$scope', '$http', 'localStorageService', '$location', 'restaurantSvr', 'geolocation',
        function ($scope, $http, localStorageService, $location, restaurantSvr, geolocation) {

            initTemplate();
            $scope.restaurantList = {
                params: {
                    sort: 'popular'
                }
            };

            if (!localStorageService.get('latitude') || !localStorageService.get('longitude')) {
                geolocation.getLocation()
                    .then(function (data) {
                        localStorageService.add('latitude', data.coords.latitude);
                        localStorageService.add('longitude', data.coords.longitude);
                        getPopularList();
                    })
                getPopularList();
            }
            else {
                getPopularList();
            }


            $scope.popularListPageChanged = function () {
                var nextPage = $scope.popularListCurrentPage;
                getPopularList({
                    page: nextPage
                });
            };

            restaurantSvr.getRestaurantCategories().then(function (response) {
                $scope.categories = response;
            });

            $scope.prices = [
                {'value': '$', "numericValue": 1},
                {'value': '$$', "numericValue": 2},
                {'value': '$$$', "numericValue": 3},
                {'value': '$$$$', "numericValue": 4},
                {'value': '$$$$$', "numericValue": 5}
            ];

            $scope.getLocation = function (val) {
                return $http.get('http://maps.googleapis.com/maps/api/geocode/json', {
                    params: {
                        address: val,
                        sensor: false
                    }
                }).then(function (response) {
                    return response.data.results.map(function (item) {
                        return {
                            'formatted_address': item.formatted_address,
                            'location': item.geometry.location
                        };
                    });
                });
            };

            $scope.onSelect = function ($item, $model, $label) {
                $scope.$item = $item;
                $scope.$model = $model;
                $scope.$label = $label;
                alert($model);
            };


            $scope.set = function () {
                $scope.restaurantList.params = merge_objects($scope.restaurantList.params,
                    {
                        'sort': $scope.sort
                    });
                getPopularList();
            };

            $scope.search = function () {
                $scope.restaurantList.params = merge_objects($scope.restaurantList.params,
                    {
                        'formatted-address': $scope.search.formattedAddress,
                        'price_range': $scope.search.price,
                        'category': $scope.search.category
                    });

                getPopularList();

            }

            function getPopularList(params) {
                if (typeof(params) !== "undefined") {
                    params = merge_objects($scope.restaurantList.params, params);
                }
                else {
                    params = $scope.restaurantList.params;
                }
                restaurantSvr.getRestaurants(params).then(function (response) {
                    $scope.restaurants = response.items;
                    $scope.maxSize = 6;
                    $scope.popularListItemPerPage = 8;
                    $scope.popularListTotalItems = response._meta.totalCount;
                    $scope.popularListCurrentPage = response._meta.currentPage + 1;
                });
            }

            function initTemplate() {
                $scope.templates =
                    [{
                        name: 'menu.html', url: 'index/menu.html'
                    }];
                $scope.navigation = 'index/navigation.html';
                $scope.footer = 'index/footer.html';
            }
        }
    ])

    .controller('detailCtrl', ['$scope', '$timeout', '$upload', 'localStorageService', '$location', '$routeParams', 'restaurantSvr', 'geolocation', 'reviewSvr', 'overviewSvr', 'locationSvr', 'photoSvr',
        function ($scope, $timeout, $upload, localStorageService, $location, routeParams, restaurantSvr, geolocation, reviewSvr, overviewSvr, locationSvr, photoSvr) {

            initTemplate();

            if (!localStorageService.get('latitude') || !localStorageService.get('longitude')) {
                geolocation.getLocation()
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
            getReviews();


            $scope.showPhone = function () {
                alert($scope.restaurant.phone);
            }

            $scope.getMap = function () {

                locationSvr.getLocation(routeParams.restaurantId).then(function (location) {
                    $scope.map = {
                        center: {
                            latitude: location.lat,
                            longitude: location.long
                        },
                        zoom: 14
                    }
                    $scope.mapIsReady = true;
                });

            }

            $scope.map = {
                center: {
                    latitude: 45,
                    longitude: 45
                },
                zoom: 5
            }
            $scope.mapIsReady = false;

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

            $scope.reviewForm = {};
            $scope.reviewForm.restaurant_id = routeParams.restaurantId;

            $scope.submitReview = function () {
                console.log($scope.reviewForm);
                reviewSvr.postRestaurantReview($scope.reviewForm).then(function (response) {
                    console.log(response);
                });
                return false;
            }

            function getReviews(params) {
                reviewSvr.getRestaurantReviews(routeParams.restaurantId, params).then(function (reviews) {
                    $scope.reviews = reviews.items;
                    $scope.maxSize = 6;
                    $scope.reviewListItemPerPage = 8;
                    $scope.reviewListTotalItems = reviews._meta.totalCount;
                    $scope.reviewListCurrentPage = reviews._meta.currentPage + 1;
                });
            }

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
                        {name: 'menu.html', url: 'index/menu.html'},
                        {name: 'review-widget.html', url: 'index/review-widget.html'},
                    ];
                $scope.navigation = 'index/navigation.html';
                $scope.footer = 'index/footer.html';
            }

            function getGraphData(restaurantId) {
                var data = overviewSvr.getGraph(restaurantId).then(function (graph) {
                    $scope.lineChartYData = [{
                        "name": "Restaurant Overview",
                        "data": graph
                    }];
                    $scope.lineChartXData = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                })
            }
        }
    ])
    .controller('navigationController', ['$scope', '$http', 'restaurantSvr', function ($scope, $http, restaurantSvr) {

        $scope.navSearch = function (val) {
            return restaurantSvr.findRestaurant(val)
                .then(function (response) {
                    return response.map(function (item) {
                        return item;
                    });
                });
        };


    }]);





