'use strict';

rxControllers.controller('requestCtrl', ['$scope', '$routeParams', 'requestSvr', 'restaurantSvr',
    'messageCenterService', 'localStorageService', 'userSvr',
    function ($scope, routeParams, requestSvr, restaurantSvr, messageCenterService, localStorageService, userSvr) {
        userSvr.getOwnedRestaurants().then(function(restaurants){
            $scope.ownedRestaurants = restaurants;

            if($scope.ownedRestaurants.length){
                $scope.restaurantId = $scope.ownedRestaurants[0].id;
                $scope.init();
                $scope.getExistingRequest();
            }
        });

        $scope.isOwner = $scope.sidebarDetail = true; // for sidebar
        // for cuisine picker
        $scope.categories = [];
        // data for showing day/hour labels
        $scope.timeData = {
            days : {"0":"Mon","1":"Tue","2":"Wed","3":"Thu","4":"Fri","5":"Sat","6":"Sun"},
            hours : {"0.0":"12:00 am (midnight)","0.5":"12:30 am","1.0":"1:00 am","1.5":"1:30 am","2.0":"2:00 am","2.5":"2:30 am","3.0":"3:00 am","3.5":"3:30 am","4.0":"4:00 am","4.5":"4:30 am","5.0":"5:00 am","5.5":"5:30 am","6.0":"6:00 am","6.5":"6:30 am","7.0":"7:00 am","7.5":"7:30 am","8.0":"8:00 am","8.5":"8:30 am","9.0":"9:00 am","9.5":"9:30 am","10.0":"10:00 am","10.5":"10:30 am","11.0":"11:00 am","11.5":"11:30 am","12.0":"12:00 pm (noon)","12.5":"12:30 pm","13.0":"1:00 pm","13.5":"1:30 pm","14.0":"2:00 pm","14.5":"2:30 pm","15.0":"3:00 pm","15.5":"3:30 pm","16.0":"4:00 pm","16.5":"4:30 pm","17.0":"5:00 pm","17.5":"5:30 pm","18.0":"6:00 pm","18.5":"6:30 pm","19.0":"7:00 pm","19.5":"7:30 pm","20.0":"8:00 pm","20.5":"8:30 pm","21.0":"9:00 pm","21.5":"9:30 pm","22.0":"10:00 pm","22.5":"10:30 pm","23.0":"11:00 pm","23.5":"11:30 pm"}
        };
        // temp value for adding new hours
        $scope.newHours = {
            day: "0",
            start: '9.0',
            end: '17.0'
        };
        // the main object
        $scope.request = {};

        // request fields [and corresponding restaurant fields]:

        // restaurant-name [name]
        // restaurant-phone [phone]
        // restaurant-email [email]
        // restaurant-description
        // restaurant-address [address]
        // restaurant-cuisine [category]
        // restaurant-website address
        // restaurant-open hours
        // restaurant-price range [price_range]
        // social-facebook_link
        // social-twitter_link
        // social-google_plus_link
        // source-tripadvisor_source
        // source-eatability_source
        // source-yelp_source
        // source-urbanspoon_source
        // misc-is_owner
        // misc-business_closed
        // misc-duplicate
        // source-zomato_link

        $scope.submitRequest = function () {
            requestSvr.postRestaurantInfoRequest({
                restaurant_id: $scope.restaurantId,
                params: JSON.stringify($scope.request)
        }).then(function (response) {
                if(response.status < 400){
                    messageCenterService.add('success', 'Your request has been sent for processing.', {timeout : 3000});
                }
            });
            return false;
        };

        // try to get an existing request. if it doesn't exist, prefill the form with restaurant info
        $scope.getExistingRequest = function() {
            requestSvr.getCurrentRequest($scope.restaurantId).then(function(response){
                // if there is a request, read it
                if(response && response.params){
                    $scope.request = JSON.parse(response.params);
                    $scope.requestExists = true;
                } else {
                    // prepopulate from restaurant
                    $scope.prepopulateRequest();
                }
            });
        };

        // get current restaurant values and parse them into request (done on init)
        $scope.prepopulateRequest = function() {
            restaurantSvr.getRestaurant($scope.restaurantId).then(function (restaurant) {
                // prepopulate basic fields
                var fields = ['name','phone','email','address'];
                for (var i = 0; i < fields.length; i++){
                    var field = fields[i];
                    if (field in restaurant){
                        $scope.request['restaurant-' + field] = restaurant[field];
                    }
                }
                $scope.request['restaurant-price range'] = restaurant['price_range'];
                // prepopulate cuisine
                if (restaurant.category){
                    $scope.request['restaurant-cuisine'] = restaurant.category.split(', ');
                } else {
                    $scope.request['restaurant-cuisine'] = [];
                }
            });
            // prepopulate open hours
            $scope.request['restaurant-open hours'] = [];
        };

        // add new cuisine
        $scope.addCategory = function(cat){
            if ($scope.request['restaurant-cuisine'].indexOf(cat) == -1){
                $scope.request['restaurant-cuisine'].push(cat);
            }
        };

        // add new open hours
        $scope.addHours = function(hours){
            $scope.request['restaurant-open hours'].push({
                day: hours.day,
                start: hours.start,
                end: hours.end
            });
        };

        $scope.init = function(){
            restaurantSvr.getRestaurantCategories().then(function (response) {
                $scope.categories = response;
            });
        };


    }]);