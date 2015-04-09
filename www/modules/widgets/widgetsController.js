'use strict';

rxControllers.controller('widgetsCtrl', ['$scope', '$routeParams', 'restaurantSvr',
    function ($scope, routeParams, restaurantSvr) {
        //if ($scope.user && $scope.user.ownedRestaurants && $scope.user.ownedRestaurants.length) {
        //    restaurantSvr.getRestaurants(
        //        {
        //            'id-in': $scope.user.ownedRestaurants.join(),
        //            'per-page': 50
        //        }
        //    ).then(function (response) {
        //            //$scope.ownedRestaurants = response.items;
        //            $scope.restaurants = [];
        //            console.log(response);
        //            angular.forEach(response.items, function(restaurant){
        //                $scope.addRestaurant(restaurant);
        //            });
        //        });
        //}

        $scope.options = {
            restaurantId: 0,
            ratingLessThan: 4,
            hideOnRatingLessThan: false,
            hideOnTrendNegative: false,
            restaurantName: 'No restaurant selected',
            width: '160px'
        };

        $scope.setRestaurant = function(restaurant){
            $scope.options.restaurantId = restaurant.id;
            $scope.options.restaurantName = restaurant.name;



            restaurantSvr.getRestaurants({'id-in': restaurant.id}).then(function(res){
                var restaurant = res.items[0];

                // calculate rating
                var rating = Math.round(restaurant.overview__percentile / 10) / 2;
                if (rating < 1) rating = 1;
                var ratingWhole = Math.trunc(rating);
                var ratingHalf = 0;
                if (rating - ratingWhole > 0){
                    ratingHalf = 5;
                }
                $scope.options.ratingWhole = ratingWhole;
                $scope.options.ratingHalf = ratingHalf;
                $scope.options.reviews_str = restaurant.overview__total_reviews == 1 ? '1 review' : restaurant.overview__total_reviews + ' reviews';
                $scope.options.trend_change = restaurant.trend_change;
                $scope.options.current_trend_change = restaurant.trend_change >= 0 ? '+ ' + restaurant.trend_change_abs : '- ' + restaurant.trend_change_abs;
                $scope.options.trend_change_abs = restaurant.trend_change_abs;
                $scope.options.current_trend_change_color = $scope.options.trend_change > 0 ? '#5cb85c' : ($scope.options.trend_change < 0 ? '#f0ad4e' : '#92B1BB');

            });
        };
        
        $scope.$watch('options', function () {
            var ratingLessThanText = '';
            if ($scope.options.hideOnRatingLessThan) {
                ratingLessThanText = ',\n' + '    hideIfRatingLessThan: ' + $scope.options.ratingLessThan;
            }
            var trendNegative = '';
            if ($scope.options.hideOnTrendNegative) {
                trendNegative = ',\n' + '    hideOnTrendNegative: true\n';
                //ratingLessThanText += '\n';
            } else{
                ratingLessThanText += ' \n';
            }

            $scope.snippet =
                '<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js"></script> \n' +
                '<script src="' + $scope.baseUrl + 'modules/widget/rating_widget.js"></script> \n' +
                '<div id="ir-widget"></div> \n' +
                '<script> \n' +
                '  irRatingWidget({ \n' +
                '    container: "#ir-widget", \n' +
                '    restaurantId: ' + $scope.options.restaurantId + ratingLessThanText + trendNegative +
                '  });\n' +
                '</script>';

        }, true);


    }])
;