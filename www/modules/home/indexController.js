'use strict';

angular.module('indexController', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider
            .when('/index', {
                templateUrl: 'modules/home/index.html',
                controller: 'indexCtrl'
            })
            .when('/restaurant/:restaurantId', {
                templateUrl: 'modules/restaurant/detail.html',
                controller: 'detailCtrl'
            });
    }])

    .controller('indexCtrl', ['$scope', '$http', 'localStorageService', '$location', 'restaurantSvr', 'geoLocation',
        function ($scope, $http, localStorageService, $location, restaurantSvr, geoLocation) {

            initTemplate();
            $scope.restaurantList = {
                params: {
                    sort: 'popular'
                }
            };

            if (!localStorageService.get('latitude') || !localStorageService.get('longitude')) {
                geoLocation.getLocation()
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

                $scope.sidebar = 'modules/partials/sidebar.html';
                $scope.header = 'modules/partials/header.html';
                $scope.footer = 'modules/partials/footer.html';
            }

            $scope.trend = [
                {
                    "key": "Trend",
                    "values": [[1025409600000, 0], [1028088000000, 6.3382185140371], [1030766400000, 5.9507873460847], [1033358400000, 11.569146943813], [1036040400000, 5.4767332317425], [1038632400000, 0.50794682203014], [1041310800000, 5.5310285460542], [1043989200000, 5.7838296963382], [1046408400000, 7.3249341615649], [1049086800000, 6.7078630712489], [1330491600000, 13.388148670744]]
                }];

            $scope.options = {
                animate: {
                    duration: 1000,
                    enabled: true
                },
                barColor: '#428bca',//'rgb(31, 119, 180)',
                //trackColor:'#2C3E50',
                size: 60,
                scaleColor: false,
                lineWidth: 5,
                lineCap: 'circle'
            };

        }
    ])

    .controller('detailCtrl', ['$scope', '$timeout', '$upload', 'localStorageService', '$location', '$routeParams', 'restaurantSvr', 'geoLocation', 'reviewSvr', 'overviewSvr', 'locationSvr', 'photoSvr', '$anchorScroll', '$modal',
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
            getReviews();


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

            $scope.reviewForm = {};
            $scope.reviewForm.restaurant_id = routeParams.restaurantId;

            $scope.submitReview = function () {
                console.log($scope.reviewForm);
                reviewSvr.postRestaurantReview($scope.reviewForm).then(function (response) {
                    console.log(response);
                });
                return false;
            }

            $scope.exampleData = [
                {
                    key: "Trip Advisor",
                    y: 25
                },
                {
                    key: "Eatability",
                    y: 20
                },
                {
                    key: "Urbanspoon",
                    y: 15
                },
                {
                    key: "Yelp",
                    y:35
                }
            ];

            $scope.xFunction = function(){
                return function(d) {
                    return d.key;
                };
            }
            $scope.yFunction = function(){
                return function(d) {
                    return d.y;
                };
            }

            var colorArray = ["#65b5c2","#4da7c1","#3993bb","#2e7bad","#23649e"];
            $scope.colorFunction = function() {
                return function(d, i) {
                    return colorArray[i];
                };
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
                        {name: 'review-widget.html', url: 'modules/partials/review-widget.html'},
                    ];
                $scope.sidebar = 'modules/partials/sidebar.html';
                $scope.header = 'modules/partials/header.html';
                $scope.footer = 'modules/partials/footer.html';
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
    .controller('navigationController', ['$scope', '$http', 'restaurantSvr', function ($scope, $http, restaurantSvr) {

        $scope.navSearch = function (val) {
            return restaurantSvr.findRestaurant(val)
                .then(function (response) {
                    return response.map(function (item) {
                        return item;
                    });
                });
        };


    }])
    .controller('mapCtrl', ['$scope', 'locationSvr', '$modal','$routeParams','$log',
        function ($scope, locationSvr, $modal,routeParams,$log) {
            $scope.getMap = function () {

                locationSvr.getLocation(routeParams.restaurantId).then(function (location) {
                    $scope.map = {
                        center: {
                            latitude: location.lat,
                            longitude: location.long
                        },
                        zoom: 17,
                        formattedAddress: location.formatted_address
                    }

                    var modalInstance = $modal.open({
                        templateUrl: "modules/partials/map.html",
                        scope: $scope
                    });

                    modalInstance.opened.then(function(){
                        $scope.showMap = true;
                        $(".overlay-main").css("display","block");
                    });

                    modalInstance.result.then(function (selectedItem) {
                        $scope.selected = selectedItem;
                    }, function () {
                        $(".overlay-main").css("display","none");
                    });
                });
            }
        }]);





