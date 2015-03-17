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
    .factory('searchData', function () {

       var search = { };

        return {
            get: function () {
                return search;
            },
            set: function (searchParams) {
                search = searchParams;
            }
        };
    })

    .controller('indexCtrl', ['$scope', '$http', 'localStorageService', '$location', 'restaurantSvr', 'geoLocation',
        '$routeParams','searchData', function ($scope, $http, localStorageService, $location, restaurantSvr, geoLocation,
         $routeParams, searchData) {

            $scope.init = function () {
                $scope.restaurantList = {
                    params: {
                        sort: 'popular',
                        'price_range-greater-than-or-equal-to': 0,
                        'price_range-less-than-or-equal-to': 4
                    }
                };
                initTemplate();
                $scope.listedCategories = {
                    'Indian': false,
                    'Indonesian Restaurant': false,
                    'Thai': false,
                    'Italian': false,
                    'Cafe': false,
                    'Modern Australian': false,
                    'African': false,
                    'Vegetarian': false
                };
                $scope.allCategoriesSelected = true;
                $scope.ratingFilterValue = 0;
                $scope.distanceFilterValue = 0;

                getAllCategories();

                if($routeParams.search){

                    $scope.restaurantList.params = merge_objects($scope.restaurantList.params,
                        {
                            'formatted-address': $routeParams.formattedAddress,
                            'price_range': $routeParams.priceRange
                            //'category': '' //sending category empty for now @todo remove
//                        'category': $routeParams.category
                        });

                    getPopularList();
                }
                if (!localStorageService.get('latitude') || !localStorageService.get('longitude')) {
                    geoLocation.getLocation()
                        .then(function (data) {
                            localStorageService.add('latitude', data.coords.latitude);
                            localStorageService.add('longitude', data.coords.longitude);
                            getPopularList();
                        });
                    getPopularList();
                }
                else {
                    getPopularList();
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



                $scope.$watch('restaurantList.params', function () {
                    getPopularList();
                }, true); // true = watch nested objects too

                $scope.$watch('listedCategories', function () {
                    var categoryIn = null;
                    angular.forEach($scope.listedCategories, function (val, key) {
                        if (val === true) {
                            if (categoryIn === null) {
                                categoryIn = key
                            } else {
                                categoryIn += ',' + key;
                            }
                        }
                    });
                    $scope.restaurantList.params['category-in'] = categoryIn;
                    if (categoryIn == null) {
                        delete $scope.restaurantList.params['category-in']; // if none, show all
                    }
                }, true); // true = watch nested objects too

            };

            $scope.popularListPageChanged = function () {
                var nextPage = $scope.popularListCurrentPage;
                getPopularList({
                    page: nextPage
                });
            };

            //$scope.onSelect = function ($item, $model, $label) {
            //    $scope.$item = $item;
            //    $scope.$model = $model;
            //    $scope.$label = $label;
            //    alert($model);
            //};


            //$scope.set = function () {
            //    $scope.restaurantList.params = merge_objects($scope.restaurantList.params,
            //        {
            //            'sort': $scope.sort
            //        });
            //    getPopularList();
            //};

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

            $scope.selectAllCategories = function (value) {
                angular.forEach($scope.listedCategories, function (val, key) {
                    $scope.listedCategories[key] = false;
                });
            };

            function getAllCategories() {
                restaurantSvr.getRestaurantCategories().then(function (response) {
                    $scope.allCategories = response;
                });
            }

            $scope.addCategory = function (category) {
                $scope.listedCategories[category] = true;
                $scope.newCategory = null;
            };

            $scope.setRatingFilter = function (value) {
                if (value == 0) { // all ratings
                    delete $scope.restaurantList.params['percentile-greater-than-or-equal-to'];
                    delete $scope.restaurantList.params['percentile-less-than-or-equal-to'];
                } else if (value == 1) { // < 60%
                    delete $scope.restaurantList.params['percentile-greater-than-or-equal-to'];
                    $scope.restaurantList.params['percentile-less-than-or-equal-to'] = 60
                } else {
                    delete $scope.restaurantList.params['percentile-less-than-or-equal-to'];
                    $scope.restaurantList.params['percentile-greater-than-or-equal-to'] = value
                }
            };

            $scope.setDistanceFilter = function (value) {
                if (value == 0) { // all ratings
                    delete $scope.restaurantList.params['distance-greater-than-or-equal-to'];
                    delete $scope.restaurantList.params['distance-less-than-or-equal-to'];
                } else if (value < 0) { // < 60%
                    delete $scope.restaurantList.params['distance-less-than-or-equal-to'];
                    $scope.restaurantList.params['distance-greater-than-or-equal-to'] = -value
                } else {
                    delete $scope.restaurantList.params['distance-greater-than-or-equal-to'];
                    $scope.restaurantList.params['distance-less-than-or-equal-to'] = value
                }
            };

            $scope.init();

        }
    ])

    .controller('navigationController', ['$scope', '$http', '$location', '$rootScope', 'restaurantSvr',
        'localStorageService', function ($scope, $http, $location, $rootScope, restaurantSvr, localStorageService) {

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

    .controller('searchCtrl', ['$scope', '$http','$location', '$routeParams','restaurantSvr', 'searchData',function ($scope, $http,
        $location, $routeParams, restaurantSvr, searchData) {

        $scope.restaurantList = { };
        $scope.search= {};

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

        if($routeParams.search){
            $scope.search = searchData.get();
        }

        $scope.searchRestaurant = function () {

            searchData.set($scope.search);

            $location.url('/index?search=true&formattedAddress='+ $scope.search.formattedAddress+
                '&priceRange='+ $scope.search.price+
                    '&category='+ $scope.search.category);
        }
    }])

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
        }])

    .controller('menuCtrl', ['$scope', '$routeParams',
        function ($scope, routeParams) {
            $scope.restaurantId = routeParams.restaurantId;


            if(undefined !== $scope.restaurantId &&  $scope.restaurantId){
                $scope.menus = [{
                    name : 'Manage Photos',
                    link : '#/manage/photos/' + $scope.restaurantId,
                    icon : 'i-docs'
                },
                    {
                        name : 'Dashboard',
                        link : '#/dashboard/' + $scope.restaurantId,
                        icon : 'i-statistics'
                    },
                    {
                        name : 'Request Change',
                        link : '#/request/change/' + $scope.restaurantId,
                        icon : 'i-pencil'
                    }
                ];
            }
        }]);








