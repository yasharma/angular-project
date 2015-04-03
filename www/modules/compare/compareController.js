'use strict';

rxControllers.controller('compareCtrl', ['$scope', '$routeParams', 'restaurantSvr',
    function ($scope, routeParams, restaurantSvr) {
        $scope.restaurantId = routeParams.restaurantId;
        restaurantSvr.getRestaurant($scope.restaurantId).then(function (restaurant) {
            $scope.restaurant = restaurant;
            $scope.restaurants = [];
            $scope.addRestaurant(restaurant);
        });

        $scope.removeRestaurant  = function (restaurant){
            $scope.restaurants = _.without($scope.restaurants, restaurant);
            $scope.removeGraph(restaurant);
        };

        $scope.addItem = function (item){
            $scope.addRestaurant(item.data);
        };

        $scope.addRestaurant = function (restaurant){
            if(Object.keys(restaurant).length) {
                $scope.numAdded = ($scope.numAdded || 0) + 1; // for generating new colors
                restaurant.color = $scope.flotColors[$scope.numAdded % $scope.flotColors.length];
                $scope.restaurants.push(restaurant);
                $scope.addGraph(restaurant);
            }
        };

        $scope.removeGraph = function(restaurant){
            var flotDataset = $scope.flotDataset;
            for (var i=0; i< flotDataset.length; i++){
                if (flotDataset[i].restaurantId==restaurant.id){
                    flotDataset.splice(i, 1);
                    return;
                }
            }
        };

        $scope.addGraph = function(restaurant){
            //var graphDurations = $scope.graphDurations;
            //if(graphDuration){ // only one
            //    graphDurations = [graphDuration];
            //} else if (!$scope.dates.start.date || !$scope.dates.start.date){
            //    return;
            //} else {
            //    $scope.graphs = {};
            //    $scope.noGraphs = true;
            //}
            console.log(restaurant);
            restaurantSvr.getGraphs(restaurant.id, 'OVERALL')
                .then(function (graph) {
                    $scope.flotDataset.push({
                        data: graph.trend,
                        label: ' ' + restaurant.name,
                        restaurantId: restaurant.id,
                        lines: {
                            show: false
                        },
                        splines: {
                            show: true,
                            tension: 0.4,
                            lineWidth: 1,
                            fill: false
                        },
                        points: {
                            radius: 0,
                            show: true
                        },
                        shadowSize: 2,
                        color: restaurant.color
                    });
                });
        };

        $scope.setStrong = function(restaurant, strong){
            // highlights restaurant (if strong == true)
            var flotDataset = $scope.flotDataset;
            for (var i=0; i< flotDataset.length; i++){
                if (flotDataset[i].restaurantId==restaurant.id){
                    if(strong){
                        flotDataset[i].splines.lineWidth = 3;
                        flotDataset[i].points.radius = 2;
                    } else {
                        flotDataset[i].splines.lineWidth = 1;
                        flotDataset[i].points.radius = 0;
                    }

                    return;
                }
            }
        };

        $scope.flotDataset = [];
        $scope.flotColors = [
            "#235039",
            "#2B4C66",
            "#81283C",
            "#733919",
            "#5E3B67"
        ];

        $scope.flotOptions =
        {
            //series: {},
            grid: {
                hoverable: true,
                clickable: true,
                tickColor: "#d9dee9",
                borderColor: "#d9dee9",
                borderWidth: 1,
                color: '#555'
            },
            xaxis: {
                mode:'time' //,
                //timeformat:"%y-%m-%d"
            },
            yaxis: {
                ticks: 4
            },
            tooltip: true,
            tooltipOpts: {
                content: function(label, xval, yval, flotItem){
                    var date = new Date(xval);
                    var dateFormatted = $.plot.formatDate(date, '%Y-%m-%d');
                    var prevIndex = flotItem.dataIndex - 1;
                    var percentChangeStr = '';
                    if (prevIndex >= 0){
                        var prevValue = flotItem.series.data[prevIndex][1];
                        var percentDiff = yval - prevValue;
                        if (percentDiff >= 0.1){
                            percentChangeStr = 'up by ' + percentDiff.toFixed(1) + '%';
                        } else if (percentDiff <= -0.1){
                            percentChangeStr = 'down by ' + (-percentDiff).toFixed(1) + '%';
                        }
                    }
                    return Math.round(yval) + '% at ' + dateFormatted + ' ' + percentChangeStr;


                },
                defaultTheme: false,
                shifts: {
                    x: 0,
                    y: 20
                },
                lines: {
                    track: true
                }
            },
            legend: {
                show: false
            }
        };

    }]);