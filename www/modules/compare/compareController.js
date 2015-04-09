'use strict';

rxControllers.controller('compareCtrl', ['$scope', '$routeParams', 'restaurantSvr',
    function ($scope, routeParams, restaurantSvr) {
        if ($scope.user && $scope.user.ownedRestaurants && $scope.user.ownedRestaurants.length) {
            restaurantSvr.getRestaurants(
                {
                    'id-in': $scope.user.ownedRestaurants.join(),
                    'per-page': 50
                }
            ).then(function (response) {
                    //$scope.ownedRestaurants = response.items;
                    $scope.restaurants = [];
                    console.log(response);
                    angular.forEach(response.items, function(restaurant){
                        $scope.addRestaurant(restaurant);
                    });
                });
        }

        //$scope.restaurantId = routeParams.restaurantId;
        //restaurantSvr.getRestaurant($scope.restaurantId).then(function (restaurant) {
        //    $scope.restaurant = restaurant;
        //    $scope.restaurants = [];
        //    $scope.addRestaurant(restaurant);
        //});

        $scope.removeRestaurant  = function (restaurant){
            $scope.restaurants = _.without($scope.restaurants, restaurant);
            delete $scope.graphs[restaurant.id];
            $scope.refreshGraphs($scope.graphDuration);
        };

        $scope.graphs = {}; // {restaurant id : {duration: graph}}
        $scope.haveGraphs = {};  //{duration: boolean}
        ///=

        var today = new Date();
        $scope.dates = {
            start: {
                date: new Date(today.getFullYear() - 1, today.getMonth(), today.getDate())
            },
            end: {
                date: today
            },
            today: today
        };

        $scope.openCalendar = function($event, calendarName) {
            $event.preventDefault();
            $event.stopPropagation();

            $scope.dates.start.opened = false;
            $scope.dates.end.opened = false;

            $scope.dates[calendarName].opened = true;
        };

        $scope.graphDurations = [
            {label:'Last 7 Days', value:'WEEKLY'},
            {label:'Last Month', value:'MONTHLY'},
            {label:'Last Year', value:'YEARLY'},
            {label:'Overall', value:'OVERALL'},
            {label:'Custom Period', value:''}
        ];
        $scope.graphDuration = $scope.graphDurations[3];

        $scope.setGraphDuration = function(option){
            $scope.graphDuration = option;
            if(option.value == ''){
                $scope.updateCustomPeriodGraphs();
            }else{
                $scope.refreshGraphs(option);
            }
        };

        $scope.refreshGraphs = function(option){
            // for every graph, copy data for selected duration into view
            $scope.flotDataset = [];
            angular.forEach($scope.graphs, function(graphGroup, id){
                var graph = graphGroup[option.value];
                if(graph) {
                    $scope.flotDataset.push({
                        data: graph.trend || [],
                        label: ' ' + graph.restaurant.name,
                        restaurantId: graph.restaurant.id,
                        lines: {
                            show: false
                        },
                        splines: {
                            show: true,
                            tension: 0.4,
                            lineWidth: 2,
                            fill: false
                        },
                        points: {
                            radius: 0,
                            show: true
                        },
                        shadowSize: 2,
                        color: graph.restaurant.color
                    });
                }
            });
        };

        $scope.updateCustomPeriodGraphs = function(){
            angular.forEach($scope.restaurants, function(restaurant){
                restaurantSvr.getGraphs(restaurant.id, '',
                    $scope.dates.start.date, $scope.dates.end.date)
                    .then(function (graph) {
                        graph.restaurant = restaurant;
                        delete $scope.graphs[restaurant.id][''];
                        $scope.graphs[restaurant.id][''] = graph;
                        $scope.refreshGraphs($scope.graphDuration);
                    });

            });
        };

        $scope.addGraph = function(restaurant){
            var graphDurations = $scope.graphDurations;

            angular.forEach(graphDurations, function(duration){
                restaurantSvr.getGraphs(restaurant.id, duration.value,
                    $scope.dates.start.date, $scope.dates.end.date)
                    .then(function (graph) {
                        graph.restaurant = restaurant;
                        if(graph.percentile && graph.percentile.length){
                            $scope.haveGraphs[duration.value] = true;
                            if (! $scope.graphs[restaurant.id]){
                                $scope.graphs[restaurant.id] = {}
                            }
                            $scope.graphs[restaurant.id][duration.value] = graph;
                            $scope.refreshGraphs($scope.graphDuration);
                        }
                    });
            });
        };

        ///-

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

        $scope.setStrong = function(restaurant, strong){
            // highlights restaurant (if strong == true)
            var flotDataset = $scope.flotDataset;
            for (var i=0; i< flotDataset.length; i++){
                if (flotDataset[i].restaurantId==restaurant.id){
                    if(strong){
                        flotDataset[i].splines.lineWidth = 3;
                        flotDataset[i].points.radius = 2;
                    } else {
                        flotDataset[i].splines.lineWidth = 2;
                        flotDataset[i].points.radius = 0;
                    }

                    return;
                }
            }
        };

        $scope.flotDataset = [];
        $scope.flotColors = [
            "#1F2D6D",
            "#4897C3",
            "#B75E8F",
            "#BF1E10",
            "#D8C746",
            "#2F9630"
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
                show: true,
                noColumns:5
            }
        };

    }]);