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
            hideOnRatingLessThan: false
        };

        $scope.$watch('options', function () {
            var ratingLessThanText = '\n';
            if ($scope.options.hideOnRatingLessThan) {
                ratingLessThanText = ',\n' + '    hideIfRatingLessThan : ' +$scope.options.ratingLessThan + ' \n';
            }
            $scope.snippet =
                '<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js"></script> \n' +
                '<script src="' + $scope.baseUrl + 'modules/widget/rating_widget.js"></script> \n' +
                '<div id="ir-widget"></div> \n' +
                '<script> \n' +
                '  irRatingWidget({ \n' +
                '    container: "#ir-widget", \n' +
                '    restaurantId : ' + $scope.options.restaurantId + ratingLessThanText +
                '  });\n' +
                '</script>'

        }, true);


    }])
;