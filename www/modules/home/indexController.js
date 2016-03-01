'use strict';

var rxControllers = angular.module('Controllers', ['ngRoute']);

rxControllers.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
        // index route - shows owned restaurants for restaurant owners, or search for other users
        .when('/index', {
            templateUrl: 'modules/home/views/index.html',
            controller: 'indexCtrl',
            reloadOnSearch: false,
            access: {requiredLogin: false}
        })
        // index/favorites, index/listall (checked manually on index controller init)
        // index/listall explicitly shows search page for restaurant owners
        .when('/index/:view', {
            templateUrl: 'modules/home/views/index.html',
            controller: 'indexCtrl',
            reloadOnSearch: false,
            access: {requiredLogin: false}
        })
        // todo remove template as well
        //.when('/dashboard/:restaurantId', {
        //    templateUrl: 'modules/restaurant/views/owner.html',
        //    controller: 'detailCtrl',
        //    access: { requiredLogin: true }
        //})
        .when('/manage/photos/:restaurantId', {
            templateUrl: 'modules/photo/views/index.html',
            controller: 'photoCtrl',
            access: {requiredLogin: true}
        })
        //.when('/request/change/:restaurantId', {
        //    templateUrl: 'modules/request/views/index.html',
        //    controller: 'requestCtrl',
        //    access: { requiredLogin: true }
        //})
        .when("/compare", {
            templateUrl: "modules/compare/views/index.html",
            controller: "compareCtrl",
            access: {
                requiredLogin: true
            }
        })
        .when("/widgets", {
            templateUrl: "modules/widgets/views/index.html",
            controller: "widgetsCtrl",
            access: {
                requiredLogin: true
            }
        })
        // restaurant details view
        .when('/restaurant/:restaurantId', {
            templateUrl: 'modules/restaurant/views/detail.html',
            controller: 'detailCtrl',
            access: {requiredLogin: false}
        })
        .when('/login', {
            templateUrl: 'modules/login/views/loginFull.html',
            controller: 'loginCtrl'
        })
        .when('/login/signup', {
            templateUrl: 'modules/login/views/signUp.html',
            controller: 'loginCtrl'
        })
        .when('/login/forgotpassword', {
            templateUrl: 'modules/login/views/forgotPassword.html',
            controller: 'loginCtrl'
        })
        .when('/login/resetpassword', {
            templateUrl: 'modules/login/views/resetPassword.html',
            controller: 'loginCtrl'
        })
        .when('/login/passwordchanged', {
            templateUrl: 'modules/login/views/passwordChanged.html'
        })
        .when('/settings/restaurant/:restaurantId/:restaurant_tab', {
            templateUrl: 'modules/profile/views/index.html',
            controller: 'profileCtrl'
        })
        .when('/settings/:tab', {
            templateUrl: 'modules/profile/views/index.html',
            controller: 'profileCtrl'
        });
}])


    .controller('filtersCtrl', ['$scope', '$rootScope', '$http', 'localStorageService', '$location',
        'restaurantSvr', 'geoLocation', '$routeParams', '$anchorScroll', function ($scope, $rootScope, $http, localStorageService, $location, restaurantSvr, geoLocation, $routeParams, $anchorScroll) {

            $scope.filters = { // contains all filter data
                cuisine: {
                    initial: [ // cuisines to show initially
                        'Indian',
                        'Indonesian Restaurant',
                        'Thai',
                        'Italian',
                        'Cafe',
                        'Modern Australian',
                        'African',
                        'Vegetarian'
                    ],
                    values: [   // {name:str, selected:bool, shown:bool}

                    ],
                    allSelected: true,
                    selectAll: function () { // show all cuisines
                        angular.forEach($scope.filters.cuisine.values, function (value) {
                            value.selected = false;
                        });
                        $scope.filters.cuisine.allSelected = true;
                        $scope.setUrl();
                    },
                    show: function (i) { // show cuisine
                        $scope.filters.cuisine.values[i].shown = true;
                        $scope.filters.cuisine.values[i].selected = true;
                        $scope.filters.cuisine.allSelected = false;
                        $scope.setUrl();
                    }
                },
                price: {
                    values: [
                        {label: '$', id: '0'},
                        {label: '$$', id: '1'},
                        {label: '$$$', id: '2'},
                        {label: '$$$$', id: '3'},
                        {label: '$$$$$', id: '4'},
                        {label: 'Unknown', id: 'null'}
                    ],
                    allSelected: true,
                    selectAll: function () {
                        angular.forEach($scope.filters.price.values, function (value) {
                            value.selected = false;
                        });
                        $scope.filters.price.allSelected = true;
                        $scope.setUrl();
                    }
                },
                rating: {
                    //value: 0,
                    options: [
                        {label: 'All ratings', value: 0},
                        {label: 'Less than 60%', value: -60},
                        {label: 'Greater than 60%', value: 60},
                        {label: 'Greater than 70%', value: 70},
                        {label: 'Greater than 80%', value: 80},
                        {label: 'Greater than 90%', value: 90}
                    ]
                },
                distance: {
                    options: [
                        {label: 'Any distance', value: 0},
                        {label: 'Less than 1 KM', value: 1},
                        {label: 'Less than 2 KM', value: 2},
                        {label: 'Less than 5 KM', value: 5},
                        {label: 'Less than 10 KM', value: 10},
                        {label: 'Greater than 10 KM', value: -10}
                    ]
                },

                trend: {
                    //value: 0,
                    options: [
                        {label: 'All', value: 0},
                        {label: 'Less than 60%', value: -60},
                        {label: 'Greater than 60%', value: 60},
                        {label: 'Greater than 70%', value: 70},
                        {label: 'Greater than 80%', value: 80},
                        {label: 'Greater than 90%', value: 90}
                    ]
                },
                reviews: {
                    //value: 0,
                    options: [
                        {label: 'Any number', value: 0},
                        {label: 'Less than 10', value: -10},
                        {label: 'More than 10', value: 10},
                        {label: 'More than 50', value: 50},
                        {label: 'More than 200', value: 200},
                        {label: 'More than 500', value: 500}
                    ]
                }
            };

            // read url search parameters and update interface
            $scope.getFromUrl = function () {
                // called on init and on every url change

                var search = clone_object($location.search());

                // cuisine: select and show given
                var categoryIn = splitStringSafe(search['category-in']);
                var cuisine = $scope.filters.cuisine;
                cuisine.allSelected = true;
                angular.forEach(cuisine.values, function (value) {
                    value.selected = ($.inArray(value.name, categoryIn) > -1);
                    if (value.selected) {
                        cuisine.allSelected = false;
                        value.shown = true;
                    }
                });

                // price: select given option
                var priceIn = splitStringSafe(search['price_range-in']);
                var price = $scope.filters.price;
                price.allSelected = true;
                angular.forEach(price.values, function (value) {
                    value.selected = ($.inArray(value.id, priceIn) > -1);
                    if (value.selected) {
                        price.allSelected = false;
                    }
                });

                // rating: select given option
                var ratingGreaterThan = search['percentile-greater-than-or-equal-to'] || '';
                var ratingLessThan = search['percentile-less-than-or-equal-to'] || '';
                $scope.filters.rating.value = 0;
                angular.forEach($scope.filters.rating.options, function (option) {
                    if (ratingGreaterThan.toString() == option.value.toString() ||
                        ratingLessThan.toString() == (-option.value).toString()) {
                        $scope.filters.rating.value = option.value;
                    }
                });

                // distance: select given option
                var distanceGreaterThan = search['distance-greater-than-or-equal-to'] || '';
                var distanceLessThan = search['distance-less-than-or-equal-to'] || '';
                $scope.filters.distance.value = 0;
                angular.forEach($scope.filters.distance.options, function (option) {
                    if (distanceGreaterThan.toString() == (-option.value).toString() ||
                        distanceLessThan.toString() == option.value.toString()) {
                        $scope.filters.distance.value = option.value;
                    } else if (distanceGreaterThan.toString() == '0') {
                        $scope.filters.distance.value = 0;
                    }
                });

                $scope.showDistance = (search.latitude && search.longitude);

                // trend: select given option
                var trendGreaterThan = search['trend-greater-than-or-equal-to'] || '';
                var trendLessThan = search['trend-less-than-or-equal-to'] || '';
                $scope.filters.trend.value = 0;
                angular.forEach($scope.filters.trend.options, function (option) {
                    if (trendGreaterThan.toString() == option.value.toString() ||
                        trendLessThan.toString() == (-option.value).toString()) {
                        $scope.filters.trend.value = option.value;
                    }
                });

                // reviews: select given option
                var reviewsGreaterThan = search['total_reviews-greater-than-or-equal-to'] || '';
                var reviewsLessThan = search['total_reviews-less-than-or-equal-to'] || '';
                $scope.filters.reviews.value = 0;
                angular.forEach($scope.filters.reviews.options, function (option) {
                    if (reviewsGreaterThan.toString() == option.value.toString() ||
                        reviewsLessThan.toString() == (-option.value).toString()) {
                        $scope.filters.reviews.value = option.value;
                    }
                });

            };
            // update url search parameters
            $scope.setUrl = function () {
                // called on every $scope.filters change

                var search = clone_object($location.search());

                var filterFields = [
                    'category-in',
                    'price_range-in',
                    'percentile-greater-than-or-equal-to',
                    'percentile-less-than-or-equal-to',
                    'distance-greater-than-or-equal-to',
                    'distance-less-than-or-equal-to',
                    'trend-greater-than-or-equal-to',
                    'trend-less-than-or-equal-to'
                ];
                // remove every parameter
                angular.forEach(filterFields, function (field) {
                    delete search[field];
                });

                // reset page
                search.page = 1;

                // reconstruct parameters

                // cuisine
                var categoryIn = [];
                angular.forEach($scope.filters.cuisine.values, function (value) {
                    if (value.selected) {
                        categoryIn.push(value.name);
                    }
                });
                if (categoryIn.length) {
                    search['category-in'] = categoryIn.join(',');
                }

                // price
                var priceIn = [];
                angular.forEach($scope.filters.price.values, function (value) {
                    if (value.selected) {
                        priceIn.push(value.id);
                    }
                });
                if (priceIn.length) {
                    search['price_range-in'] = priceIn.join(',');
                }

                // rating
                search['percentile-greater-than-or-equal-to'] = null;
                search['percentile-less-than-or-equal-to'] = null;
                if ($scope.filters.rating.value > 0) {
                    search['percentile-greater-than-or-equal-to'] = $scope.filters.rating.value;
                } else if ($scope.filters.rating.value < 0) {
                    search['percentile-less-than-or-equal-to'] = -$scope.filters.rating.value;
                }


                // distance
                search['distance-greater-than-or-equal-to'] = null;
                search['distance-less-than-or-equal-to'] = null;
                if (parseInt($scope.filters.distance.value) < 0) {
                    search['distance-greater-than-or-equal-to'] = (-parseInt($scope.filters.distance.value)).toString();
                } else if (parseInt($scope.filters.distance.value) > 0) {
                    search['distance-less-than-or-equal-to'] = $scope.filters.distance.value.toString();

                }

                // trend
                search['trend-greater-than-or-equal-to'] = null;
                search['trend-less-than-or-equal-to'] = null;
                if ($scope.filters.trend.value > 0) {
                    search['trend-greater-than-or-equal-to'] = $scope.filters.trend.value;
                } else if ($scope.filters.trend.value < 0) {
                    search['trend-less-than-or-equal-to'] = -$scope.filters.trend.value;
                }

                // reviews
                search['total_reviews-greater-than-or-equal-to'] = null;
                search['total_reviews-less-than-or-equal-to'] = null;
                if ($scope.filters.reviews.value > 0) {
                    search['total_reviews-greater-than-or-equal-to'] = $scope.filters.reviews.value;
                } else if ($scope.filters.reviews.value < 0) {
                    search['total_reviews-less-than-or-equal-to'] = -$scope.filters.reviews.value;
                }

                $location.search(search);
            };

            // expands tabs that contain active filters
            $scope.setOpenTabs = function () {
                $scope.openTabs = {
                    cuisine: true, // always expand cuisine
                    price: !$scope.filters.price.allSelected,
                    rating: $scope.filters.rating.value,
                    distance: $scope.filters.distance.value,
                    trend: $scope.filters.trend.value,
                    reviews: $scope.filters.reviews.value
                }
            };

            // init:
            // we first have to get all categories / cuisines
            restaurantSvr.getRestaurantCategories().then(function (response) {
                var i = 0;
                $scope.filters.cuisine.values = response.map(function (category) {
                    // turn array of cuisines into array of objects
                    return {
                        name: category.name,
                          // only show initial categories
                        shown: ($.inArray(category.name, $scope.filters.cuisine.initial) > -1),
                        selected: false,
                        id: i++
                    }
                });
                // on every url change update filters interface according to url params
                $scope.$on('$routeUpdate', function () { // on route change: search
                    $scope.getFromUrl();
                    $scope.setOpenTabs(); // todo: remove this, expand tabs only initially
                });
            });

        }])

    .controller('indexCtrl', ['$scope', '$rootScope', '$http', 'localStorageService', '$location',
        'restaurantSvr', 'userSvr', 'geoLocation', '$routeParams', '$anchorScroll','growl', function ($scope, $rootScope, $http, localStorageService, $location, restaurantSvr, userSvr, geoLocation, $routeParams, $anchorScroll,growl) {

            // change view manually based on 'view' route parameter
            if ($routeParams.view) {
                if ($routeParams.view == 'favorites') {
                    $scope.view = 'favorites';
                } else if ($routeParams.view == 'listall') {
                    $scope.view = 'listall';
                } else {
                    $location.path("/index");
                }
            } else { // index url (without /:view)
                $scope.view = 'index';
            }

            $scope.init = function () {
                // watch user object for changes (beause login / logout happens within indexCtrl)
                $scope.$watch('user', function () {
                    // get user's owned restaurants
                    if ($scope.user && $scope.user.ownedRestaurants && $scope.user.ownedRestaurants.length) {
                        userSvr.getOwnedRestaurants().then(function (response) {
                            $scope.ownedRestaurants = response;
                        });
                    }
                    // get user's favorite restaurants
                    if ($scope.user && $scope.view == 'favorites') {
                        userSvr.getFavorites().then(function (response) {
                            $scope.favoriteRestaurants = response;
                        });
                    }
                });

                // restaurant search sort options
                $scope.sortOptions = [
                    {label: 'Trend', value: 'trending', direction: 'bottom'},
                    {label: 'Rating', value: 'popular', direction: 'bottom'},
                    {label: 'Distance', value: 'distance', direction: 'top'}
                ];

                // options for avatar widget
                $scope.avatarOptions = {
                    animate: {
                        duration: 1000,
                        enabled: true
                    },
                    barColor: '#428bca',
                    trackColor: '#d2d2d2',
                    //trackWidth: 8,
                    size: 60,
                    scaleColor: false,
                    lineWidth: 5,
                    lineCap: 'circle'
                };

                // read url params, add any missing (page, sort), get location
                // happens initially, and on every url change (e.g. when filters are changed)
                function parseUrlSearchParams() {
                    var search = clone_object($location.search());


                    // if url is empty, add parameters
                    var addParamsToUrl = {};
                    if (!search.page) {
                        addParamsToUrl.page = 1
                    }
                    if (!search.sort) {
                        addParamsToUrl.sort = 'trending'
                    }

                    if ((search.latitude && search.longitude)) {
                        localStorageService.add('latitude', search.latitude);
                        localStorageService.add('longitude', search.longitude);
                    }
                    else {
                        // get position
                        geoLocation.getLocation()
                            .then(function (data) {
                                // try to get location from browser
                                localStorageService.add('latitude', data.coords.latitude);
                                localStorageService.add('longitude', data.coords.longitude);
                                // when we get user's location, also add distance filter to search params (initially 2 km)
                                var addParams = {};
                                addParams['distance-less-than-or-equal-to'] = '2';
                                addParams['distance-greater-than-or-equal-to'] = null;
                                addParams.latitude = data.coords.latitude;
                                addParams.longitude = data.coords.longitude;
                                $location.search(addParams);
                            }, function (error) {
                                // user has declined sharing location: get approx. location from IP address
                                userSvr.getIp().then(function (ip) {
                                    userSvr.getLocation(ip).then(function (location) {

                                            localStorageService.add('latitude', location.lat);
                                            localStorageService.add('longitude', location.lon);
                                            // when getting location from IP, set max. distance to 5km initially
                                            var addParams = {};
                                            addParams['distance-less-than-or-equal-to'] = '5';
                                            addParams['distance-greater-than-or-equal-to'] = null;
                                            addParams.latitude = location.lat;
                                            addParams.longitude = location.lon;
                                            $location.search(addParams);
                                        },
                                        function (error) {
                                        })
                                });
                            });

                    }
                    //if (! ('distance-less-than-or-equal-to' in search)){
                    //    if (! ('distance-greater-than-or-equal-to' in search)){
                    //        if( search.latitude && search.longitude) {
                    //            addParamsToUrl['distance-less-than-or-equal-to'] = '1';
                    //        }
                    //    }
                    //}
                    if (!$.isEmptyObject(addParamsToUrl)) {
                        // if there's any params to add to the url, add them, and do nothing
                        //  because this method will be called again on url update
                        $location.search(merge_objects(search, addParamsToUrl));
                    } else {
                        // if we have all parameters: execute restaurant search
                        $scope.searchParams = search;
                        // get distance info from url
                        $scope.distance = getDistanceFilterFromSearch();
                        // search restaurants
                        getPopularList(null, true);
                    }

                }

                $scope.$on('$routeUpdate', function () { // on route change: search
                    parseUrlSearchParams();
                });

                parseUrlSearchParams();

            }; // end of init

            $scope.changeUrlParam = function (param, value) {
                $location.search(param, value);
                // return to the first page if anything other than page is updated
                if (param != 'page') {
                    $location.search('page', '1');
                }
            };
            // increases distance e.g. 1km -> 2km
            // 10km -> any distance
            function getNextDistance(distance) {
                var distanceFilterOptions = [
                    {label: 'Any distance', value: 0},
                    {label: 'Less than 1 KM', value: 1},
                    {label: 'Less than 2 KM', value: 2},
                    {label: 'Less than 5 KM', value: 5},
                    {label: 'Less than 10 KM', value: 10},
                    {label: 'Greater than 10 KM', value: -10}
                ];
                for (var i = 1; i < distanceFilterOptions.length - 1; i++) {
                    if (i == distanceFilterOptions.length - 2) {
                        return '0'; // any distance
                    } else if (distanceFilterOptions[i].value.toString() == distance.toString()) {
                        return (distanceFilterOptions[i + 1].value).toString(); // next distance
                    }
                }

            }

            // updates distance url parameters
            var setDistanceUrl = function (value) {
                var search = clone_object($location.search());
///
                if (parseInt(value) == 0) { // all distances
                    search['distance-greater-than-or-equal-to'] = null;
                    search['distance-less-than-or-equal-to'] = null;
                } else if (parseInt(value) < 0) { // greater than n KM
                    search['distance-less-than-or-equal-to'] = null;
                    search['distance-greater-than-or-equal-to'] = (-value).toString();
                } else { // less than n KM
                    search['distance-greater-than-or-equal-to'] = null;
                    search['distance-less-than-or-equal-to'] = value.toString();
                }

                $location.search(search);

            };
            // gets distance from url parameters
            var getDistanceFilterFromSearch = function () {
                var search = clone_object($location.search());

                if ('distance-greater-than-or-equal-to' in search) {
                    return ((-parseInt(search['distance-greater-than-or-equal-to'])).toString());
                } else if ('distance-less-than-or-equal-to' in search) {
                    return search['distance-less-than-or-equal-to'] || '0';
                } else {
                    return '0'; // default distance
                }
            };

            // search for restaurants (todo: rename function)
            function getPopularList(params, initial) {
                if (params) {
                    params = merge_objects($scope.searchParams, params);
                }
                else {
                    params = $scope.searchParams;
                }
                // initially:
                // while there are 0 responses and distance-less-than filter is active, increase distance and repeat
                $scope.cgBusyPromise = restaurantSvr.getRestaurants(params);
                $scope.cgBusyPromise.then(function (response) {
                    if (response.items.length == 0 && $scope.distance.toString() != '0'
                        && params.latitude && params.longitude && initial) {
                        // none found:
                        // find next distance option and set it
                        $scope.distance = getNextDistance($scope.distance);
                        growl.addWarnMessage('We did not find any matching restaurants. Showing best matching alternatives.');
                        getPopularList(params, initial);

                    } else { // success
                        // update distance url params
                        setDistanceUrl($scope.distance);
                        $scope.restaurants = response.items; // show results
                        $scope.maxSize = 6;
                        $scope.popularListItemPerPage = 8;
                        $scope.popularListTotalItems = response._meta.totalCount;
                        $scope.searchParams.page = response._meta.currentPage;
                        $scope.numPages = response._meta.pageCount;
                    }
                });
            }
            // hide filters on mobile view (when 'search' button is clicked)
            $scope.toggleFiltersMobile = function () {
                $rootScope.showFiltersMobile = false;
                $scope.scrollTop();
            };

            // function, scrolls window to top
            $scope.scrollTop = $anchorScroll;

            $scope.init();

        }
    ])


    .controller('navigationController', ['$scope', '$http', '$location',
        function ($scope, $http, $location) {

            // navigate to detail view
            $scope.setRestaurant = function (restaurant) {
                if (restaurant && restaurant.data && restaurant.data.id) {
                    $location.path('/restaurant/' + restaurant.data.id);
                }
            };

        }])

    .controller('searchCtrl', ['$scope', '$http', '$location', 'restaurantSvr',
        'localStorageService', 'geoLocation', 'messageCenterService', 'growl', 'userSvr',
        function ($scope, $http, $location, restaurantSvr, localStorageService, geoLocation, messageCenterService, growl, userSvr) {

            $scope.search = {}; // raw search parameters

            $scope.selectedPrices = [];

            // update url params on price dropdown change
            $scope.$watch('selectedPrices', function () {
                $scope.search['price_range-in'] = null;
                angular.forEach($scope.selectedPrices, function (price) {
                    if ($scope.search['price_range-in']) {
                        $scope.search['price_range-in'] += ',' + price.id.toString();
                    } else {
                        $scope.search['price_range-in'] = price.id.toString();
                    }
                });
            }, true);

            $scope.selectedCategories = [];

            // update url on cuisine dropdown change
            $scope.$watch('selectedCategories', function () {
                $scope.search['category-in'] = null;
                angular.forEach($scope.selectedCategories, function (category) {
                    if ($scope.search['category-in']) {
                        $scope.search['category-in'] += ',' + category.id.toString();
                    } else {
                        $scope.search['category-in'] = category.id.toString();
                    }
                });
            }, true);

            // get all cuisines to show in dropdown
            restaurantSvr.getRestaurantCategories().then(function (response) {
                $scope.categories = response.map(function (item) {
                    return {id: item.name};
                });
            });

            // options for prices
            $scope.prices = [
                {'value': '$', "id": '0'},
                {'value': '$$', "id": '1'},
                {'value': '$$$', "id": '2'},
                {'value': '$$$$', "id": '3'},
                {'value': '$$$$$', "id": '4'},
                {'value': 'Unknown', "id": 'null'}
            ];

            // special settings for price and cuisine dropdowns (reference: dropdown documentation)
            $scope.priceDropdownSettings = {
                displayProp: 'value',
                showCheckAll: false
            };

            $scope.priceDropdownLabels = {
                buttonDefaultText: 'Any Price',
                dynamicButtonTextPrefix: 'Price (',
                dynamicButtonTextSuffix: ')',
                uncheckAll: 'Any Price'
            };

            $scope.categoryDropdownSettings = {
                scrollableHeight: '300px',
                scrollable: true,
                displayProp: 'id',
                showCheckAll: false,
                enableSearch: true
            };

            $scope.categoryDropdownLabels = {
                buttonDefaultText: 'Any Cuisine',
                dynamicButtonTextPrefix: 'Cuisine (',
                dynamicButtonTextSuffix: ' selected)',
                uncheckAll: 'Any Cuisine'
            };

            // get coordinates for given address (calls google api)
            $scope.getLocations = function (val) {
                return $http.get('http://maps.googleapis.com/maps/api/geocode/json', {
                    params: {
                        components: "country:AU",
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

            // update location url params
            $scope.setLocation = function (formattedAddress) {
                $scope.search['distance-less-than-or-equal-to'] = '2';
                $scope.search['distance-greater-than-or-equal-to'] = null;

                $scope.search.latitude = formattedAddress.location.lat;
                $scope.search.longitude = formattedAddress.location.lng;
                $scope.search['location-type'] = 'address';
                localStorageService.add('latitude', $scope.search.latitude);
                localStorageService.add('longitude', $scope.search.longitude);

                $scope.nearMe = false;
            };

            // if 'near me' is checked, get user's location
            $scope.setNearMe = function () {
                if ($scope.nearMe) {
                    // need to set distance to increasing

                    // we shouldn't remember user's location in localStorage, rather get each time
                    // because it can change each time

                    //if (!localStorageService.get('latitude') || !localStorageService.get('longitude')) {

                    geoLocation.getLocation()
                        .then(function (data) {
                            localStorageService.add('latitude', data.coords.latitude);
                            localStorageService.add('longitude', data.coords.longitude);

                            $scope.search['distance-less-than-or-equal-to'] = '2';
                            $scope.search['distance-greater-than-or-equal-to'] = null;
                            $scope.search.latitude = data.coords.latitude;
                            $scope.search.longitude = data.coords.longitude;
                            $scope.search['location-type'] = 'nearme';
                            $scope.formattedAddress = '';
                        }, function (error) {
                            //messageCenterService.add('warning', error, {timeout : 5000});
                            //growl.addWarnMessage(error);
                            setLocationFromIp();
                        });

                } else {
                    setLocationFromIp();
                }
            };

            // get user's location from ip address
            function setLocationFromIp() {
                userSvr.getIp().then(function (ip) {
                    userSvr.getLocation(ip).then(function (location) {

                            localStorageService.add('latitude', location.lat);
                            localStorageService.add('longitude', location.lon);

                            $scope.search.latitude = location.lat;
                            $scope.search.longitude = location.lon;
                            $scope.search['distance-less-than-or-equal-to'] = '5';
                            $scope.search['distance-greater-than-or-equal-to'] = null;
                            $scope.search['location-type'] = 'nearme';
                            $scope.formattedAddress = '';
                        },
                        function (error) {
                            $scope.search.latitude = null;
                            $scope.search.longitude = null;
                            $scope.search['distance-less-than-or-equal-to'] = null;
                            $scope.search['distance-greater-than-or-equal-to'] = null;
                            $scope.search['location-type'] = 'none';
                        })
                });

            }

            // called on each url change, parses url parameters and updates view
            function parseUrlSearchParams() {
                $scope.search = clone_object($location.search());
                var search = $scope.search;
                if ('price_range-in' in search) {
                    $scope.selectedPrices = search['price_range-in'].split(',').map(function (item) {
                        return {id: item.toString()}
                    });
                } else {
                    $scope.selectedPrices = [];
                }
                if ('category-in' in search) {
                    $scope.selectedCategories = search['category-in'].split(',').map(function (item) {
                        return {id: item.toString()}
                    });
                } else {
                    $scope.selectedCategories = [];
                }

                $scope.nearMe = search['location-type'] == 'nearme' || !search['location-type'];
                $scope.setNearMe();

            }

            parseUrlSearchParams(); // do it on init


            $scope.$on('$routeUpdate', function () { // as well as on any route change
                parseUrlSearchParams();
            });

            $scope.searchRestaurant = function () {
                // set search parameters to url
                var url = '/index/listall';
                var searchAndResetPage = merge_objects($scope.search, {page: 1});
                var query = objectToQueryString(merge_objects_null($location.search(), searchAndResetPage));

                $location.url(url + query);
            }

        }])

    .controller('mapCtrl', ['$scope', 'locationSvr', '$modal', '$routeParams', '$log', 'localStorageService',
        function ($scope, locationSvr, $modal, routeParams, $log, localStorageService) {

            var latitude = localStorageService.get('latitude');
            var longitude = localStorageService.get('longitude');

            //var latitude = -33.8945364;     // for testing only
            //var longitude = 151.26898979999999;
            $scope.originAddress = '';
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
                            longitude: $scope.map.center.longitude
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
                            destination: $scope.map.center.latitude + ',' + $scope.map.center.longitude,
                            showList: true
                        };

                    $scope.travelModes = [{label: "Driving", value: "DRIVING"}, {label: "Walking", value: "WALKING"},
                        {label: "Bicycling", value: "BICYCLING"}, {label: "Transit", value: "TRANSIT"}];

//                    Set Driving to the options box
                    $scope.travelMode = $scope.travelModes[0].value;


                    // Get Destination Address
                    var latlng = new google.maps.LatLng(latitude, longitude);

                    geocoder.geocode({'latLng': latlng}, function (results, status) {
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
                        $scope.routeMessage = '';
                    } else {
                        $scope.routeMessage = 'Google route unsuccessful';
                    }
                });
            };

            $scope.getMap();


        }])

    .controller('menuCtrl', ['$scope', '$routeParams',
        function ($scope, routeParams) {
            $scope.restaurantId = routeParams.restaurantId;


            if (undefined !== $scope.restaurantId && $scope.restaurantId) {
                $scope.menus = [
                    {
                        name: 'Manage Photos',
                        link: '#/manage/photos/' + $scope.restaurantId,
                        icon: 'i-docs'
                    },
                    {
                        name: 'Dashboard',
                        link: '#/dashboard/' + $scope.restaurantId,
                        icon: 'i-statistics'
                    }
                ];
            }


        }]);








