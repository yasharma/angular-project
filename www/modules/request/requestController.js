'use strict';

rxControllers.controller('requestCtrl', ['$scope', '$routeParams', 'requestSvr', 'restaurantSvr',
    'messageCenterService', 'localStorageService', 'userSvr', '$location',
    function ($scope, $routeParams, requestSvr, restaurantSvr, messageCenterService, localStorageService, userSvr, $location) {

        // initially, get user's owned restaurants, to show in dropdown
        userSvr.getOwnedRestaurants().then(function(restaurants){
            $scope.data.ownedRestaurants = restaurants;

            if($scope.data.ownedRestaurants.length){
                // show initial restaurant
                if($routeParams.restaurantId) {
                    // if restaurant id is in the url, show specific restaurant...
                    $scope.data.restaurant = $scope.findRestaurantId($scope.data.ownedRestaurants, $routeParams.restaurantId);
                } else {
                    // ...otherwise, show first restaurant
                    $scope.data.restaurant = $scope.data.ownedRestaurants[0];
                }
                // fill in the form with initial data
                $scope.getExistingRequest();
            }
        });

        // returns restaurant with given id in a list, or first restaurant if not found
        $scope.findRestaurantId = function(restaurant_list, id){
            var result = restaurant_list.filter(function(obj) {
                return obj.id == id;
            });
            if (result.length){
                return result[0];
            } else {
                $scope.setRestaurantId(restaurant_list[0].id);
                return restaurant_list[0];
            }
        };

        // update url on restaurant dropdown change
        $scope.setRestaurantId = function(id){
            $location.path("/settings/restaurant/" + id + "/info");
        };

        $scope.isOwner = $scope.sidebarDetail = true; // for sidebar

        $scope.data = {
            // for cuisine picker
            categories : [],
            // data for showing day/hour labels
            timeData: {
                days : {"0":"Mon","1":"Tue","2":"Wed","3":"Thu","4":"Fri","5":"Sat","6":"Sun"},
                daysFull : {"mon":"Monday","tue":"Tuesday","wed":"Wednesday","thu":"Thursday","fri":"Friday","sat":"Saturday","sun":"Sunday"},
                hours : {'00:00:00': '12:00 am (midnight)', '00:30:00': '12:30 am', '01:00:00': '1:00 am', '01:30:00': '1:30 am', '02:00:00': '2:00 am', '02:30:00': '2:30 am', '03:00:00': '3:00 am', '03:30:00': '3:30 am', '04:00:00': '4:00 am', '04:30:00': '4:30 am', '05:00:00': '5:00 am', '05:30:00': '5:30 am', '06:00:00': '6:00 am', '06:30:00': '6:30 am', '07:00:00': '7:00 am', '07:30:00': '7:30 am', '08:00:00': '8:00 am', '08:30:00': '8:30 am', '09:00:00': '9:00 am', '09:30:00': '9:30 am', '10:00:00': '10:00 am', '10:30:00': '10:30 am', '11:00:00': '11:00 am', '11:30:00': '11:30 am', '12:00:00': '12:00 pm (noon)', '12:30:00': '12:30 pm', '13:00:00': '1:00 pm', '13:30:00': '1:30 pm', '14:00:00': '2:00 pm', '14:30:00': '2:30 pm', '15:00:00': '3:00 pm', '15:30:00': '3:30 pm', '16:00:00': '4:00 pm', '16:30:00': '4:30 pm', '17:00:00': '5:00 pm', '17:30:00': '5:30 pm', '18:00:00': '6:00 pm', '18:30:00': '6:30 pm', '19:00:00': '7:00 pm', '19:30:00': '7:30 pm', '20:00:00': '8:00 pm', '20:30:00': '8:30 pm', '21:00:00': '9:00 pm', '21:30:00': '9:30 pm', '22:00:00': '10:00 pm', '22:30:00': '10:30 pm', '23:00:00': '11:00 pm', '23:30:00': '11:30 pm'}
            },
            // temp value for adding new hours
            newHours: {
                day: "0",
                start: '09:00:00',
                end: '17:00:00'
            },
            // the main object (request to be sent)
            request: {}
        };

        // request fields [and corresponding restaurant fields]:

        // restaurant-name [name]
        // restaurant-phone [phone]
        // restaurant-email [email]
        // restaurant-description [description]
        // restaurant-address [address]
        // restaurant-cuisine [category]
        // restaurant-website address [website] !
        // restaurant-open hours [opening_hours] !
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
                restaurant_id: $scope.data.restaurant.id,
                params: JSON.stringify($scope.data.request)
        }).then(function (response) {
                if(response.status < 400){
                    messageCenterService.add('success', 'Your request has been sent for processing.', {timeout : 3000});
                    $scope.data.requestSent = true;
                }
            });
            return false;
        };

        // copy restaurant billing from given restaurant (first tries to find its request)
        $scope.copyRestaurantBilling = function(fromRestaurant, toRequest){
            requestSvr.getCurrentRequest(fromRestaurant.id).then(function (response) {
                // if there is a request, read it
                if (response && response.params) {
                    var fromRequest = JSON.parse(response.params);
                    toRequest['billing-billing_address'] = fromRequest['billing-billing_address'];
                    toRequest['billing-billing_email'] = fromRequest['billing-billing_email'];
                    toRequest['billing-billing_phone'] = fromRequest['billing-billing_phone'];
                } else {
                    // prepopulate from restaurant
                    // todo: check field names when they're added to backend
                    toRequest['billing-billing_address'] = fromRestaurant['billing_address'] || '';
                    toRequest['billing-billing_email'] = fromRestaurant['billing_email'] || '';
                    toRequest['billing-billing_phone'] = fromRestaurant['billing_phone'] || '';
                }
            });
        };

        // try to get an existing request. if it doesn't exist, prefill the form with restaurant info
        $scope.getExistingRequest = function() {
            if($scope.data.restaurant && $scope.data.restaurant.id) {
                $scope.data.request = {};
                requestSvr.getCurrentRequest($scope.data.restaurant.id).then(function (response) {
                    // if there is a request, read it
                    if (response && response.params) {
                        $scope.data.request = JSON.parse(response.params);
                        $scope.data.requestExists = true;
                    } else {
                        // prepopulate from restaurant
                        $scope.prepopulateRequest();
                    }
                });
            }
        };

        // get current restaurant values and parse them into request (done on init)
        $scope.prepopulateRequest = function() {
            var restaurant = $scope.data.restaurant;
            // prepopulate basic fields
            var fields = ['name','phone','email','description','address'];
            for (var i = 0; i < fields.length; i++){
                var field = fields[i];
                if (field in restaurant){
                    $scope.data.request['restaurant-' + field] = restaurant[field];
                }
            }
            $scope.data.request['restaurant-price range'] = restaurant['price_range'];
            $scope.data.request['restaurant-website address'] = restaurant['website'];
            $scope.data.request['restaurant-open hours'] = restaurant['opening_hours'] || [];
            // prepopulate cuisine
            if (restaurant.category){
                $scope.data.request['restaurant-cuisine'] = restaurant.category.split(', ');
            } else {
                $scope.data.request['restaurant-cuisine'] = [];
            }
        };

        // add new cuisine
        $scope.addCategory = function(cat){
            if ($scope.data.request['restaurant-cuisine'].indexOf(cat) == -1){
                $scope.data.request['restaurant-cuisine'].push(cat);
            }
        };

        // add new open hours
        $scope.addHours = function(hours){
            $scope.data.request['restaurant-open hours'].push({
                day: $scope.data.timeData.days[hours.day].toLowerCase(),
                start: hours.start,
                close: hours.end
            });
        };

        $scope.init = function(){
            // get cuisines
            restaurantSvr.getRestaurantCategories().then(function (response) {
                $scope.data.categories = response;
            });
            // get form field info
            requestSvr.getRequestTitles().then(function (response) {
                $scope.data.fieldList = response;
                // convert fields to a dictionary, to be able to look up values
                $scope.data.fields = {};
                angular.forEach($scope.data.fieldList, function(field) {
                    $scope.data.fields[field.tag + '-' + field.name] = field;
                });
            });
        };

        $scope.init();

    }]);