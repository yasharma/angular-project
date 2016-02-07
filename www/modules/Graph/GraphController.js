'use strict';

rxControllers.controller('graphCtrl', ['$scope', 'restaurantSvr', '$routeParams', '$timeout',
    function ($scope, restaurantSvr, $routeParams, $timeout) {

        $scope.restaurantId = $routeParams.restaurantId;

        $scope.graphDurations = [
            {label: 'Last 7 Days', value: 'WEEKLY'},
            {label: 'Last Month', value: 'MONTHLY'},
            {label: 'Last 3 Months', value: 'QUARTERLY'},
            {label: 'Last 6 Months', value: 'HALF_YEARLY'},
            {label: 'Last Year', value: 'YEARLY'},
            {label: 'Overall', value: 'OVERALL'}
        ];
        $scope.customPeriod = { // used from template, to get specific date period
            label: 'Custom Period',
            value: ''
        };

        // initially show 'Overall' duration
        $scope.graphDuration = $scope.graphDurations[5];

        $scope.flotColors = [
            "#1F2D6D",
            "#4897C3",
            "#B75E8F",
            "#BF1E10",
            "#D8C746",
            "#2F9630"
        ];

        // redraw flot graphs (on graph change)
        $scope.refreshGraphs = function (option) {
            if (option) {
                $scope.graphDuration = option;
            }
            var graph = $scope.graphs[$scope.graphDuration.value];
            $scope.flotDataset[0].data = graph.percentile;
            $scope.flotDataset[1].data = graph.trend;
            $scope.donutDataset = graph.source;
            //$scope.stats = graph.stats;
            $scope.refreshScatterFlot();
            $scope.refreshStats(graph);
        };

        // count number of ratings for each rating value, returns results in $scope.stats
        $scope.refreshStats = function (graph) {
            var stats = {
                ratings: {
                    1: {label: 'Terrible', count: 0},
                    2: {label: 'Poor', count: 0},
                    3: {label: 'Average', count: 0},
                    4: {label: 'Very good', count: 0},
                    5: {label: 'Excellent', count: 0}
                },
                total: 0
            };
            // go through overall stats, if available, and count ratings
            angular.forEach(graph.comments, function (comment) {
                var rating = Math.round(comment.rating);
                if (rating >= 1 && rating <= 5) {
                    stats.ratings[rating].count += 1;
                }

            });
            stats.total = graph.percentile.length;
            $scope.stats = stats;

        };

        // get graph data from the API
        // todo: can be refactored, it was written for getting multiple durations at once
        //  which (I think) is not the case anymore
        $scope.getGraphs = function (graphDuration) {
            var graphDurations = $scope.graphDurations;
            if (graphDuration) { // get graphs for specified duration
                $scope.graphDuration = graphDuration;
                graphDurations = [graphDuration];
            } else if (!$scope.dates.start.date || !$scope.dates.end.date) {
                // make sure we have start/end dates
                return;
            } else {
                // show 'Not enough data to show analytics graph' message
                $scope.graphs = {};
                $scope.noGraphs = true;
            }

            // get graphs for every specified duration
            angular.forEach(graphDurations, function (duration) {
                restaurantSvr.getGraphs($scope.restaurantId, duration.value,
                    $scope.dates.start.date, $scope.dates.end.date)
                    .then(function (graph) {
                        // make sure there is enough data (at least 5 radings), for non-custom durations
                        if (graph.percentile && graph.percentile.length > 5 || duration.value == '') {
                            $scope.graphs[duration.value] = graph;
                            $scope.noGraphs = false;
                            // refresh graph
                            if (duration == $scope.graphDuration) {
                                // zero-timeout is needed for flot to update properly (for unknown reasons)
                                $timeout(function () {
                                    $scope.refreshGraphs();
                                });
                            }
                        }
                    });
            });
        };
        // Load items into scatter flot graph
        $scope.refreshScatterFlot = function () {
            // for every source, copy data for selected duration into view
            $scope.scatterFlotDataset = [];
            angular.forEach($scope.graphs[$scope.graphDuration.value].ratingBySource, function (src, id) {
                var length = $scope.graphs[$scope.graphDuration.value].ratingBySource.length;
                var source = src.source;
                var data = src.data;
                if (data) {
                    $scope.scatterFlotDataset.push({
                        data: data || [],
                        label: source,
                        lines: {
                            show: false
                        },
                        points: {
                            radius: 3,
                            show: true,
                            fill: true,
                            fillColor: $scope.flotColors[id % length]
                        },
                        shadowSize: 2,
                        color: $scope.flotColors[id % length]
                    });
                }
            });
        };

        $scope.donutDataset = [];
        $scope.flotDataset = [
            // test data
            // [[173401200000, 381.78], [207702000000, 330.64], [237702000000, 130.64], [297702000000, 230.64]],
            {
                data: [],
                label: ' Overview',
                lines: {
                    show: false
                },
                splines: {
                    show: true,
                    tension: 0.4,
                    lineWidth: 1.3
                    //fill: 0.4
                },
                points: {
                    radius: 0,
                    show: true
                },
                shadowSize: 2
            },
            {
                data: [],
                label: ' Trend',
                //dashes: {
                //    show: true,
                //    dashLength: 3,
                //    lineWidth: 1
                //},
                lines: {
                    show: true,
                    width: 3
                },
                points: {
                    radius: 0,
                    show: true
                },
                shadowSize: 2
            }

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
            colors: ["#000", "#ff6600"],
            xaxis: {
                mode: 'time' //,
                //timeformat:"%y-%m-%d"
            },
            yaxis: {
                ticks: 5, min: 0.1, max: 5.9
            },
            tooltip: true,
            tooltipOpts: {
                content: function (label, xval, yval, flotItem) {
                    var date = new Date(xval);
                    var dateFormatted = $.plot.formatDate(date, '%d %b %Y');
                    var prevIndex = flotItem.dataIndex - 1;
                    var percentChangeStr = '';
                    // get previous value, to show % change
                    if (prevIndex >= 0) {
                        var prevValue = flotItem.series.data[prevIndex][1];
                        var percentDiff = (yval - prevValue) * 20;
                        if (percentDiff >= 0.1) {
                            percentChangeStr = '<span class="graph-tooltip-green">Up by <b>' + percentDiff.toFixed(0) + '%</b></span>';
                        } else if (percentDiff <= -0.1) {
                            percentChangeStr = '<span class="graph-tooltip-red">Down by <b>' + (-percentDiff).toFixed(0) + '%</b></span>';
                        }
                    }
                    return '<b>' + dateFormatted + '</b></br>' +
                        label + ': <b>' + yval + ' </b><br>' +
                        percentChangeStr;


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
                //container: $('#flotLegend')
                noColumns: 5
            }
        };

        $scope.scatterFlotDataset = [];

        $scope.scatterFlotOptions =
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
                mode: 'time'
            },
            yaxis: {
                ticks: 5, min: 0.1, max: 5.9
            },
            tooltip: true,
            tooltipOpts: {
                content: function (label, xval, yval, flotItem) {
                    var date = new Date(xval);
                    var dateFormatted = $.plot.formatDate(date, '%d %b %Y');
                    var prevIndex = flotItem.dataIndex - 1;
                    var percentChangeStr = '';
                    // get previous value, to show % change
                    if (prevIndex >= 0) {
                        var prevValue = flotItem.series.data[prevIndex][1];
                        var percentDiff = yval - prevValue;
                        if (percentDiff >= 0.1) {
                            percentChangeStr = '<span class="graph-tooltip-green">Up by <b>' + percentDiff.toFixed(1) + '</b></span>';
                        } else if (percentDiff <= -0.1) {
                            percentChangeStr = '<span class="graph-tooltip-red">Down by <b>' + (-percentDiff).toFixed(1) + '</b></span>';
                        }
                    }
                    return '<b>' + dateFormatted + '</b></br>' +
                        label + ': <b>' + yval + ' </b><br>' +
                        percentChangeStr;


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
                noColumns: 5
            }
        };

        $scope.donutOptions = {
            series: {
                pie: {
                    innerRadius: 0.50,
                    radius: 0.90,
                    show: true,
                    stroke: {
                        width: 0
                    },
                    label: {
                        show: false,
                        threshold: 0.05
                    }
                }
            },
            colors: ["#65b5c2", "#4da7c1", "#3993bb", "#2e7bad", "#23649e"],
            grid: {
                hoverable: true,
                clickable: false
            },
            tooltip: true,
            tooltipOpts: {
                content: function (label, xval, yval, flotItem) {
                    return label + ': <b>' + Math.round(flotItem.datapoint[0]) + '%</b>';
                }
            }
        };

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

        $scope.openCalendar = function ($event, calendarName) {
            // calendarName can be 'start' or 'end'

            $event.preventDefault();
            $event.stopPropagation();

            // close other calendars
            $scope.dates.start.opened = false;
            $scope.dates.end.opened = false;

            // open specified calendar
            $scope.dates[calendarName].opened = true;
        };


        $scope.getGraphs();


    }]);