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

            $scope.restaurantList = {
                params: {
                    sort: 'popular'
                }
            };
            initTemplate();

            if($routeParams.search){

                $scope.restaurantList.params = merge_objects($scope.restaurantList.params,
                    {
                        'formatted-address': $routeParams.formattedAddress,
                        'price_range': $routeParams.priceRange,
                        'category': '' //sending category empty for now @todo remove
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

    .controller('navigationController', ['$scope', '$http', '$location', '$rootScope', 'restaurantSvr',
        'localStorageService', function ($scope, $http, $location, $rootScope, restaurantSvr, localStorageService) {


        $scope.user = localStorageService.get('user');

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
            localStorageService.remove('user');
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

                    $scope.options = {scrollwheel: false};
                    $scope.coordsUpdates = 0;
                    $scope.dynamicMoveCtr = 0;
                    $scope.marker = {
                        id: 0,
                        coords: {
                            latitude: $scope.map.center.latitude,
                            longitude:$scope.map.center.longitude
                        }
                    };
                    $scope.$watchCollection("marker.coords", function (newVal, oldVal) {
                        if (_.isEqual(newVal, oldVal))
                            return;
                        $scope.coordsUpdates++;
                    });

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








