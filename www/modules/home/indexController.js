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

    .controller('indexCtrl', ['$scope', '$rootScope', '$http', 'localStorageService', '$location',
        'restaurantSvr', 'geoLocation', '$routeParams','$anchorScroll', 'searchData', function (
            $scope, $rootScope, $http, localStorageService, $location, restaurantSvr, geoLocation,
            $routeParams, $anchorScroll, searchData) {

            $scope.init = function () {
                $scope.user = localStorageService.get('user');

                $scope.restaurantList = {
                    params: {
                        sort: 'popular',
                        'price_range-greater-than-or-equal-to': 0,
                        'price_range-less-than-or-equal-to': 4,
                        'distance-less-than-or-equal-to': 1
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
                $scope.trendFilterValue = 0;
                $scope.distanceFilterValue = 1;

                $scope.priceFilterOptions = [
                    {label: '$', value: 0},
                    {label: '$$', value: 1},
                    {label: '$$$', value: 2},
                    {label: '$$$$', value: 3},
                    {label: '$$$$$', value: 4}
                ];
                $scope.ratingFilterOptions = [
                    {label: 'All ratings', value: 0},
                    {label: 'Less than 60%', value: 1},
                    {label: 'Greater than 60%', value: 60},
                    {label: 'Greater than 70%', value: 70},
                    {label: 'Greater than 80%', value: 80},
                    {label: 'Greater than 90%', value: 90}
                ];
                $scope.distanceFilterOptions = [
                    {label: 'Any distance', value: 0},
                    {label: 'Less than 1 KM', value: 1},
                    {label: 'Less than 2 KM', value: 2},
                    {label: 'Less than 5 KM', value: 5},
                    {label: 'Less than 10 KM', value: 10},
                    {label: 'Greater than 10 KM', value: -10}
                ];
                $scope.trendFilterOptions = [
                    {label: 'All', value: 0},
                    {label: 'Less than 60%', value: 1},
                    {label: 'Greater than 60%', value: 60},
                    {label: 'Greater than 70%', value: 70},
                    {label: 'Greater than 80%', value: 80},
                    {label: 'Greater than 90%', value: 90}
                ];

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

                //$scope.trend = [
                //    {
                //        "key": "Trend",
                //        "values": [[1025409600000, 0], [1028088000000, 6.3382185140371], [1030766400000, 5.9507873460847], [1033358400000, 11.569146943813], [1036040400000, 5.4767332317425], [1038632400000, 0.50794682203014], [1041310800000, 5.5310285460542], [1043989200000, 5.7838296963382], [1046408400000, 7.3249341615649], [1049086800000, 6.7078630712489], [1330491600000, 13.388148670744]]
                //    }];

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

                $scope.setAutoLocation(true);

            };

            $scope.setAutoLocation = function (nearMe) { // turns 'Near Me' feature on or off
                $scope.nearMe = nearMe;
                if(nearMe === true) {
                    if (!localStorageService.get('latitude') || !localStorageService.get('longitude')) {
                        geoLocation.getLocation()
                            .then(function (data) {
                                localStorageService.add('latitude', data.coords.latitude);
                                localStorageService.add('longitude', data.coords.longitude);
                                getPopularList(null, true);
                            });
                    }else{
                        getPopularList(null, true);
                    }
                }else{
                    localStorageService.remove('latitude');
                    localStorageService.remove('longitude');
                    getPopularList(null, false);
                }
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

            function getPopularList(params, initial) {
                if (params) {
                    params = merge_objects($scope.restaurantList.params, params);
                }
                else {
                    params = $scope.restaurantList.params;
                }
                // initially:
                // while there are 0 responses and distance-less-than filter is active, increase distance and repeat
                $scope.cgBusyPromise = restaurantSvr.getRestaurants(params);
                $scope.cgBusyPromise.then(function (response) {
                    if(response.items.length == 0 && $scope.distanceFilterValue != 0 && initial){
                        // none found:
                        // find next distance option and set it
                        for (var i = 1; i < $scope.distanceFilterOptions.length - 1 ; i++) {
                            if (i == $scope.distanceFilterOptions.length - 2){
                                // set to any distance
                                $scope.distanceFilterValue = 0;
                                $scope.setDistanceFilter($scope.distanceFilterValue);
                                break;
                            } else if($scope.distanceFilterOptions[i].value == $scope.distanceFilterValue){
                                // set next distance
                                $scope.distanceFilterValue = $scope.distanceFilterOptions[i+1].value;
                                $scope.setDistanceFilter($scope.distanceFilterValue);
                                break;
                            }
                        }
                        getPopularList(params, initial);
                    }else { // success
                        $scope.restaurants = response.items;
                        $scope.maxSize = 6;
                        $scope.popularListItemPerPage = 8;
                        $scope.popularListTotalItems = response._meta.totalCount;
                        $scope.popularListCurrentPage = response._meta.currentPage;
                        $scope.numPages = response._meta.pageCount;
                    }
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

            $scope.setTrendFilter = function (value) {
                if (value == 0) { // all ratings
                    delete $scope.restaurantList.params['trend-greater-than-or-equal-to'];
                    delete $scope.restaurantList.params['trend-less-than-or-equal-to'];
                } else if (value == 1) { // < 60%
                    delete $scope.restaurantList.params['trend-greater-than-or-equal-to'];
                    $scope.restaurantList.params['trend-less-than-or-equal-to'] = 60
                } else {
                    delete $scope.restaurantList.params['trend-less-than-or-equal-to'];
                    $scope.restaurantList.params['trend-greater-than-or-equal-to'] = value
                }
            };

            $scope.setDistanceFilter = function (value) {
                if (value == 0) { // all distances
                    delete $scope.restaurantList.params['distance-greater-than-or-equal-to'];
                    delete $scope.restaurantList.params['distance-less-than-or-equal-to'];
                } else if (value < 0) { // greater than n KM
                    delete $scope.restaurantList.params['distance-less-than-or-equal-to'];
                    $scope.restaurantList.params['distance-greater-than-or-equal-to'] = -value
                } else { // less than n KM
                    delete $scope.restaurantList.params['distance-greater-than-or-equal-to'];
                    $scope.restaurantList.params['distance-less-than-or-equal-to'] = value
                }
            };

            // get nav search results
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

            // navigate to detail view
            $scope.setRestaurant = function (restaurants){
                if(Object.keys(restaurants).length) {
                    $location.path('/restaurant/' + restaurants.data.id);
                    $scope.searchRestaurant ='';
                }
            };

            // logout
            $scope.clearToken = function(){
                localStorageService.remove('token');
                localStorageService.remove('user');
                delete $scope.user;
                $rootScope.isLogged = false;
                $location.path("/index");
            };

            $scope.toggleFiltersMobile = function(){
                $scope.showFiltersMobile = ! $scope.showFiltersMobile;
                $scope.scrollTop();
            };

            $scope.scrollTop = $anchorScroll;

            $scope.init();

        }
    ])

    // merged with indexCtrl
    //.controller('navigationController', ['$scope', '$http', '$location', '$rootScope', 'restaurantSvr',
    //    'localStorageService', function ($scope, $http, $location, $rootScope, restaurantSvr, localStorageService) {
    //
    //}])

    .controller('searchCtrl', ['$scope', '$http','$location', '$routeParams','restaurantSvr', 'searchData',function ($scope, $http,
        $location, $routeParams, restaurantSvr, searchData) {

        $scope.restaurantList = { };
        $scope.search = {};

        restaurantSvr.getRestaurantCategories().then(function (response) {
            $scope.categories = response;
        });

        $scope.prices = [
            {'value': '$', "numericValue": 0},
            {'value': '$$', "numericValue": 1},
            {'value': '$$$', "numericValue": 2},
            {'value': '$$$$', "numericValue": 3},
            {'value': '$$$$$', "numericValue": 4}
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

        if ($routeParams.search) {
            $scope.search = searchData.get();
        }

        $scope.searchRestaurant = function () {

            searchData.set($scope.search);

            $location.url('/index?search=true&formattedAddress=' + $scope.search.formattedAddress +
                '&priceRange=' + $scope.search.price +
                '&category=' + $scope.search.category);
        }

        }])

    .controller('mapCtrl', ['$scope', 'locationSvr', '$modal', '$routeParams', '$log','localStorageService',
        function ($scope, locationSvr, $modal, routeParams, $log, localStorageService) {

            var latitude = localStorageService.get('latitude');
            var longitude = localStorageService.get('longitude');

            //var latitude = -33.8945364;     // for testing only
            //var longitude = 151.26898979999999;
            $scope.originAddress ='';
            $scope.map = {};
            var geocoder = new google.maps.Geocoder();

            $scope.getMap = function () {

                locationSvr.getLocation(routeParams.restaurantId).then(function (location) {
                    $scope.map = {
                        center: {
                            latitude: location.lat,
                            longitude: location.long
                        },
                        zoom: 17,
                        formattedAddress: location.formatted_address,
                        control: {}
                    };

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

                    // directions object
                    var origin =
                        $scope.directions = {
                            origin: latitude + ',' + longitude,
                            destination: $scope.map.center.latitude +',' + $scope.map.center.longitude,
                            showList: true
                        };

                    $scope.travelModes = [{ label : "Driving", value: "DRIVING" },{ label : "Walking", value : "WALKING"},
                        {label : "Bicycling", value:"BICYCLING"},{ label: "Transit", value:"TRANSIT"}];

//                    Set Driving to the options box
                    $scope.travelMode =  $scope.travelModes[0].value;


                    // Get Destination Address
                    var latlng = new google.maps.LatLng(latitude,longitude);

                    geocoder.geocode({'latLng': latlng}, function(results, status) {
                        if (status == google.maps.GeocoderStatus.OK) {
                            if (results[1]) {
                                $scope.originAddress = results[1].formatted_address;
                                $scope.getDirections($scope.travelMode);
                            } else {
                                console.log('No location found');
                            }
                        } else {
                            console.log('Geocoder failed due to: ' + status);
                        }
                    });


                });

            };

            // get directions using google maps api
            $scope.getDirections = function (travelMode) {


                // instantiate google map objects for directions
                var directionsDisplay = new google.maps.DirectionsRenderer();
                var directionsService = new google.maps.DirectionsService();


                var request = {
                    origin: $scope.directions.origin,
                    destination: $scope.directions.destination,
                    travelMode: google.maps.DirectionsTravelMode[travelMode]
                };

                directionsService.route(request, function (response, status) {
                    if (status === google.maps.DirectionsStatus.OK) {
                        directionsDisplay.setDirections(response);
                        directionsDisplay.setMap($scope.map.control.getGMap());
                        // Empty the directionsList div
                        var node = document.getElementById('directionsList');
                        while (node.hasChildNodes()) {
                            node.removeChild(node.firstChild);
                        }
                        // Fill the div
                        directionsDisplay.setPanel(document.getElementById('directionsList'));
                        $scope.directions.showList = true;
                    } else {
                        alert('Google route unsuccessful');
                    }
                });
            };

            $scope.getMap();



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








