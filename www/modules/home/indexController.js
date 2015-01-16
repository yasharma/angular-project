'use strict';

var rxControllers = angular.module('Controllers', ['ngRoute']);

rxControllers.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
        .when('/index', {
            templateUrl: 'modules/home/views/index.html',
            controller: 'indexCtrl'
        })
        .when('/dashboard/:restaurantId', {
            templateUrl: 'modules/restaurant/views/owner.html',
            controller: 'detailCtrl',
            access: { requiredLogin: true }
        })
        .when('/manage/photos/:restaurantId', {
            templateUrl: 'modules/photo/views/index.html',
            controller: 'photoCtrl',
            access: { requiredLogin: true }
        })
        .when('/request/change/:restaurantId', {
            templateUrl: 'modules/request/views/index.html',
            controller: 'requestCtrl',
            access: { requiredLogin: true }
        })
        .when('/restaurant/:restaurantId', {
            templateUrl: 'modules/restaurant/views/detail.html',
            controller: 'detailCtrl'
        })
        .when('/login', {
            templateUrl: 'modules/login/views/loginFull.html',
            controller: 'loginCtrl'
        })
        .when('/login/signup', {
            templateUrl: 'modules/login/views/signUp.html',
            controller: 'loginCtrl'
        });
}])

    .controller('indexCtrl', ['$scope', '$http', 'localStorageService', '$location', 'restaurantSvr', 'geoLocation',
        function ($scope, $http, localStorageService, $location, restaurantSvr, geoLocation) {

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

    .controller('navigationController', ['$scope', '$http', '$location', '$rootScope', 'restaurantSvr','localStorageService', function ($scope, $http, $location, $rootScope, restaurantSvr, localStorageService) {

        $scope.navSearch = function (val) {
            return restaurantSvr.findRestaurant(val)
                .then(function (response) {
                    if(!response.length){
                        response.push({formatted : "no results found"});
                    }

                    return response.map(function (item) {
                        if( "no results found" !== item.formatted) {
                            var formatted = item.formatted.split(' - ');
                            item.searchText = formatted[0];
                            var tags = formatted[1].split(':');
                            item.tag = tags[0];
                            item.tagValue = tags[1];
                        }
                        return item;
                    });
                });
        };

        $scope.setRestaurant = function (restaurants){
            if(Object.keys(restaurants).length) {
                $location.path('/restaurant/' + restaurants.data.id);
                $scope.searchRestaurant ='';
            }
        }

        $scope.clearToken = function(){
            localStorageService.remove('token');
            $rootScope.isLogged = false;
            $location.path("/index");
        }

    }])
    .controller('listCtrl', ['$scope', '$http', 'localStorageService', '$location', 'restaurantSvr', 'geoLocation', 'sharedData',
        function ($scope, $http, localStorageService, $location, restaurantSvr, geoLocation, sharedData) {

            var restaurants = $scope.restaurants = [];

            $scope.$watch(function () { return sharedData.getItem(); }, function (newValue) {
                $scope.restaurants.length = 0;
                if(undefined === newValue.data.overview__percentile) newValue.data.overview__percentile = "100";
                if (newValue) $scope.restaurants.push(newValue.data);
            });

            initTemplate();

            //@todo make api calls to get the trend data
            $scope.trend = [
                {
                    "key": "Trend",
                    "values": [
                        [1025409600000, 0],
                        [1028088000000, 6.3382185140371],
                        [1030766400000, 5.9507873460847],
                        [1033358400000, 11.569146943813],
                        [1036040400000, 5.4767332317425],
                        [1038632400000, 0.50794682203014],
                        [1041310800000, 5.5310285460542],
                        [1043989200000, 5.7838296963382],
                        [1046408400000, 7.3249341615649],
                        [1049086800000, 6.7078630712489],
                        [1330491600000, 13.388148670744]
                    ]
                }
            ];
            //@todo refactor with options used in indexCtrl
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

            function initTemplate() {

                $scope.sidebar = 'modules/partials/sidebar.html';
                $scope.header = 'modules/partials/header.html';
                $scope.footer = 'modules/partials/footer.html';
            }


        }
    ])
    .controller('mapCtrl', ['$scope', 'locationSvr', '$modal', '$routeParams', '$log',
        function ($scope, locationSvr, $modal, routeParams, $log) {
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
                        templateUrl: "modules/restaurant/views/map.html",
                        scope: $scope
                    });

                    modalInstance.opened.then(function () {
                        $scope.showMap = true;
                        $(".overlay-main").css("display", "block");
                    });

                    modalInstance.result.then(function (selectedItem) {
                        $scope.selected = selectedItem;
                    }, function () {
                        $(".overlay-main").css("display", "none");
                    });
                });
            }
        }]);





