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

        // default widget options
        $scope.options = {
            restaurantId: 0, // user-selected restaurant which the widget is applied to
            ratingLessThan: 4, // hide the widget if rating is less than (1-5), and next option is true
            hideOnRatingLessThan: false,
            hideOnTrendNegative: false, // hide the restaurant with (currently) negative trend
            restaurantName: 'No restaurant selected',
            width: '160px' // widget on-screen width
        };

        // sets the restaurant which the widget is applied to
        $scope.setRestaurant = function(restaurant){
            if (! (restaurant && restaurant.id)) return; // if none was selected, return

            $scope.options.restaurantId = restaurant.id;
            $scope.options.restaurantName = restaurant.name;

            // get restaurant info, to show rating and trend in widget preview
            restaurantSvr.getRestaurants({'id-in': restaurant.id}).then(function(res){
                var restaurant = res.items[0];

                // calculate rating
                var rating = Math.round(restaurant.overviews__percentile / 10) / 2;
                if (rating < 1) rating = 1;
                // calculate wholes (can be 1-5) and halves (can be 0 or 5)
                var ratingWhole = Math.trunc(rating);
                var ratingHalf = 0;
                if (rating - ratingWhole > 0){
                    ratingHalf = 5;
                }
                $scope.options.rating = rating;
                $scope.options.ratingWhole = ratingWhole;
                $scope.options.ratingHalf = ratingHalf;
                $scope.options.reviews_str = restaurant.overviews__total_reviews == 1 ? '1 review' : restaurant.overviews__total_reviews + ' reviews';
                $scope.options.trend_change = restaurant.trend_change;
                $scope.options.current_trend_change = restaurant.trend_change >= 0 ? '+ ' + restaurant.trend_change_abs : '- ' + restaurant.trend_change_abs;
                $scope.options.trend_change_abs = restaurant.trend_change_abs;
                $scope.options.current_trend_change_color = $scope.options.trend_change > 0 ? '#5cb85c' : ($scope.options.trend_change < 0 ? '#f0ad4e' : '#92B1BB');

            });
        };

        // whenever options change, rerender widget preview and widget's code snippet
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

            if ($scope.options.hideOnRatingLessThan && $scope.options.rating < $scope.options.ratingLessThan) {
                $scope.isHidden = true;
            } else if ($scope.options.hideOnTrendNegative && $scope.options.trend_change < 0){
                $scope.isHidden = true;
            } else {
                $scope.isHidden = false;
            }

            // generate code snippet
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