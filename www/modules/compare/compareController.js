'use strict';

rxControllers.controller('compareCtrl', ['$scope', '$routeParams', 'restaurantSvr', 'userSvr',
    function ($scope, routeParams, restaurantSvr, userSvr) {
        if ($scope.user && $scope.user.ownedRestaurants && $scope.user.ownedRestaurants.length) {
            // add owned restaurants to comparison table by default
            userSvr.getOwnedRestaurants().then(function (response) {
                    $scope.restaurants = [];
                    // have to add each restaurant through addRestaurant method, so it can load required data
                    angular.forEach(response, function(restaurant){
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
            // remove given restaurant from graphs and restaurants arrays
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
            // calendarName can be 'start' or 'end'

            $event.preventDefault();
            $event.stopPropagation();

            // close other calendars
            $scope.dates.start.opened = false;
            $scope.dates.end.opened = false;

            // open specified calendar
            $scope.dates[calendarName].opened = true;
        };

        $scope.graphDurations = [
            {label:'Last 7 Days', value:'WEEKLY'},
            {label:'Last Month', value:'MONTHLY'},
            {label:'Last 3 Months', value:'QUARTERLY'},
            {label:'Last 6 Months', value:'HALF_YEARLY'},
            {label:'Last Year', value:'YEARLY'},
            {label:'Overall', value:'OVERALL'},
            {label:'Custom Period', value:''}
        ];
        $scope.graphDuration = $scope.graphDurations[4];

        // refresh graphs or graph duration change
        $scope.setGraphDuration = function(option){
            $scope.graphDuration = option;
            if(option.value == ''){ // custom duration
                // for custom duration, we have to get data for each restaurant again
                $scope.updateCustomPeriodGraphs();
            }else{
                // otherwise, we have data already, just refresh the graph
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

        // get data for each restaurant, for custom period
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

        // add restaurant to the graph (loads every duration for given restaurant)
        $scope.addGraph = function(restaurant){
            var graphDurations = $scope.graphDurations;

            angular.forEach(graphDurations, function(duration){
                restaurantSvr.getGraphs(restaurant.id, duration.value,
                    $scope.dates.start.date, $scope.dates.end.date)
                    .then(function (graph) {
                        graph.restaurant = restaurant;
                        if(graph.percentile && graph.percentile.length){
                            // enable duration in duration dropdown
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
                // for generating new colors, numAdded keeps track of the last color used
                $scope.numAdded = ($scope.numAdded || 0) + 1;
                restaurant.color = $scope.flotColors[$scope.numAdded % $scope.flotColors.length];
                $scope.restaurants.push(restaurant);
                // load restaurant graph data
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
                        // remove highlight
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
                tickColor: "#f0f0f0", //"#d9dee9",
                borderColor: "#d9dee9",
                borderWidth: 1,
                color: '#555'
            },
            xaxis: {
                mode:'time' //,
                //timeformat:"%y-%m-%d"
            },
            yaxis: {
                ticks: 5, min: 0.1, max: 5.9
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
                            percentChangeStr = 'up by ' + percentDiff.toFixed(1) + '';
                        } else if (percentDiff <= -0.1){
                            percentChangeStr = 'down by ' + (-percentDiff).toFixed(1) + '';
                        }
                    }
                    return yval + ' at ' + dateFormatted + ' ' + percentChangeStr;


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