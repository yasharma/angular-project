'use strict';

rxControllers.controller('graphCtrl', ['$scope', 'restaurantSvr', '$routeParams', '$timeout',
    function ($scope, restaurantSvr, $routeParams, $timeout) {

        $scope.restaurantId = $routeParams.restaurantId;

        $scope.graphDurations = [
            {label:'Last 7 Days', value:'WEEKLY'},
            {label:'Last Month', value:'MONTHLY'},
            {label:'Last 3 Months', value:'QUARTERLY'},
            {label:'Last 6 Months', value:'HALF_YEARLY'},
            {label:'Last Year', value:'YEARLY'},
            {label:'Overall', value:'OVERALL'}
        ];
        $scope.customPeriod = {
            label:'Custom Period',
            value:''
        };

        $scope.graphDuration = $scope.graphDurations[5];

        $scope.flotColors = [
            "#1F2D6D",
            "#4897C3",
            "#B75E8F",
            "#BF1E10",
            "#D8C746",
            "#2F9630"
        ];

        $scope.refreshGraphs = function(option){
            if(option){
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

        $scope.refreshStats = function(graph){
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
            angular.forEach(graph.percentile, function(val){
                var rating = Math.round(val[1]);
                if(rating >= 1 && rating <=5){
                    stats.ratings[rating].count += 1;
                }

            });
            stats.total = graph.percentile.length;
            $scope.stats = stats;

        };

        $scope.getGraphs = function(graphDuration){
            var graphDurations = $scope.graphDurations;
            if(graphDuration){ // only one
                $scope.graphDuration = graphDuration;
                graphDurations = [graphDuration];
            } else if (!$scope.dates.start.date || !$scope.dates.end.date){
                return;
            } else {
                $scope.graphs = {};
                $scope.noGraphs = true;
            }

            angular.forEach(graphDurations, function(duration){
                restaurantSvr.getGraphs($scope.restaurantId, duration.value,
                    $scope.dates.start.date, $scope.dates.end.date)
                    .then(function (graph) {
                    if(graph.percentile && graph.percentile.length > 5 || duration.value == ''){
                        $scope.graphs[duration.value] = graph;
                        $scope.noGraphs = false;
                        // refresh graph
                        if (duration == $scope.graphDuration) {
                            $timeout(function () {
                                $scope.refreshGraphs();
                            });
                        }
                    }
                });
            });
        };
        // Load items into scatter flot graph
        $scope.refreshScatterFlot = function(){
            // for every source, copy data for selected duration into view
            $scope.scatterFlotDataset = [];
            angular.forEach($scope.graphs[$scope.graphDuration.value].ratingBySource, function(src, id){
                var length = $scope.graphs[$scope.graphDuration.value].ratingBySource.length;
                var source = src.source;
                var data = src.data;
                if(data) {
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

        //$scope.flotDataset = [d0];
        $scope.donutDataset = [];
        $scope.flotDataset = [
            //[[173401200000, 381.78], [207702000000, 330.64], [237702000000, 130.64], [297702000000, 230.64]],
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
                    var dateFormatted = $.plot.formatDate(date, '%d %b %Y');
                    var prevIndex = flotItem.dataIndex - 1;
                    var percentChangeStr = '';
                    if (prevIndex >= 0){
                        var prevValue = flotItem.series.data[prevIndex][1];
                        var percentDiff = (yval - prevValue) * 20;
                        if (percentDiff >= 0.1){
                            percentChangeStr = '<span class="graph-tooltip-green">Up by <b>' + percentDiff.toFixed(0) + '%</b></span>';
                        } else if (percentDiff <= -0.1){
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
                noColumns:5
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
                mode:'time'
            },
            yaxis: {
                ticks: 5, min: 0.1, max: 5.9
            },
            tooltip: true,
            tooltipOpts: {
                content: function(label, xval, yval, flotItem){
                    var date = new Date(xval);
                    var dateFormatted = $.plot.formatDate(date, '%d %b %Y');
                    var prevIndex = flotItem.dataIndex - 1;
                    var percentChangeStr = '';
                    if (prevIndex >= 0){
                        var prevValue = flotItem.series.data[prevIndex][1];
                        var percentDiff = yval - prevValue;
                        if (percentDiff >= 0.1){
                            percentChangeStr = '<span class="graph-tooltip-green">Up by <b>' + percentDiff.toFixed(1) + '</b></span>';
                        } else if (percentDiff <= -0.1){
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
                noColumns:5
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
                content: function(label, xval, yval, flotItem){
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

        $scope.openCalendar = function($event, calendarName) {
            $event.preventDefault();
            $event.stopPropagation();

            $scope.dates.start.opened = false;
            $scope.dates.end.opened = false;

            $scope.dates[calendarName].opened = true;
        };


        $scope.getGraphs();

        //todo: remove commented code if no longer needed

        //var jsonData = {
        //    "person1": [[1394110800000, 4], [1394542800000, 4], [1395493200000, 4], [1396357200000, 2], [1396616400000, 4], [1398175200000, 5], [1399471200000, 5], [1399471200000, 3], [1401026400000, 2], [1401199200000, 5], [1401976800000, 3], [1402840800000, 4], [1402840800000, 5], [1403186400000, 5], [1405432800000, 5], [1409580000000, 5], [1409580000000, 5], [1410962400000, 4], [1411135200000, 5], [1411221600000, 5], [1411394400000, 5], [1411394400000, 4], [1413464400000, 4]],
        //    "person2": [[1394110800000, 2], [1394542800000, 5], [1395493200000, 1], [1396357200000, 4], [1396616400000, 3], [1398175200000, 2], [1399471200000, 1], [1399471200000, 5], [1401026400000, 2], [1401199200000, 5], [1401976800000, 4], [1402840800000, 5], [1402840800000, 3], [1404741600000, 4], [1404741600000, 1], [1405346400000, 4], [1405432800000, 2], [1405605600000, 4], [1406728800000, 5], [1407160800000, 3], [1409148000000, 4], [1409580000000, 4], [1409580000000, 5], [1411135200000, 4], [1411221600000, 3], [1411394400000, 2], [1411394400000, 5], [1411740000000, 3], [1413464400000, 2]],
        //    "person3": [[1394110800000, 3], [1394542800000, 2], [1395493200000, 1], [1396357200000, 3], [1401026400000, 1], [1401199200000, 3], [1401976800000, 2], [1402840800000, 4], [1402840800000, 5], [1404741600000, 5], [1404741600000, 3], [1405346400000, 3], [1405432800000, 3], [1405605600000, 1], [1406728800000, 5], [1407160800000, 2], [1409148000000, 5], [1409580000000, 1], [1409580000000, 4], [1411135200000, 2], [1411394400000, 5], [1411394400000, 4], [1411740000000, 2], [1413464400000, 3]],
        //    "person4": [[1394110800000, 3], [1394542800000, 2], [1395147600000, 3], [1395493200000, 2], [1396357200000, 1], [1396616400000, 5], [1398175200000, 4], [1399471200000, 3], [1401026400000, 2], [1401199200000, 2], [1401976800000, 4], [1402149600000, 1], [1402840800000, 3], [1402840800000, 2], [1403186400000, 3], [1404741600000, 3], [1404741600000, 3], [1405346400000, 3], [1405432800000, 4], [1405605600000, 4], [1406728800000, 3], [1407160800000, 5], [1409148000000, 3], [1409580000000, 2], [1409580000000, 4], [1411135200000, 1], [1411221600000, 4], [1411394400000, 2], [1411740000000, 3], [1413464400000, 4]],
        //    "average": [[1394110800000, 3], [1394542800000, 3.25], [1395147600000, 0.75], [1395493200000, 2], [1396357200000, 2.5], [1396616400000, 3], [1398175200000, 2.75], [1399471200000, 1.5], [1399471200000, 2.75], [1401026400000, 1.75], [1401199200000, 3.75], [1401976800000, 3.25], [1402149600000, 0.25], [1402840800000, 4], [1402840800000, 3.75], [1403186400000, 2], [1404741600000, 3], [1404741600000, 1.75], [1405346400000, 2.5], [1405432800000, 3.5], [1405605600000, 2.25], [1406728800000, 3.25], [1407160800000, 2.5], [1409148000000, 3], [1409580000000, 3], [1409580000000, 4.5], [1410962400000, 1], [1411135200000, 3], [1411221600000, 3], [1411394400000, 3.5], [1411394400000, 3.25], [1411740000000, 2], [1413464400000, 3.25]],
        //    "min_dt": "Mar 06, 2014",
        //    "max_dt": "Oct 16, 2014"
        //};
        //
        //$scope.chartConfig = {
        //    options: {
        //        scatter: {
        //            marker: {
        //                radius: 4,
        //                states: {
        //                    hover: {
        //                        enabled: true,
        //                        lineColor: '#65b5c2'
        //                    }
        //                }
        //            },
        //            states: {
        //                hover: {
        //                    marker: {
        //                        enabled: false
        //                    }
        //                }
        //            },
        //            tooltip: {
        //                headerFormat: '<b>{series.name}</b><br>',
        //                pointFormat: '{point.x:%b %e, %Y}=>{point.y}'
        //            }
        //        }
        //
        //
        //    },
        //    series: [{
        //        name: 'Person 1',
        //        type: 'scatter',
        //        data: jsonData.person1,
        //        color: '#4da7c1'
        //    }, {
        //        name: 'Person 2',
        //        type: 'scatter',
        //        data: jsonData.person2,
        //        color: '#3993bb'
        //    }, {
        //        name: 'Person 3',
        //        type: 'scatter',
        //        data: jsonData.person3,
        //        color: '#65b5c2'
        //    }, {
        //        name: 'Person 4',
        //        type: 'scatter',
        //        data: jsonData.person4,
        //        color: '#23649e'
        //    }, {
        //        name: 'Moving Average',
        //        type: 'line',
        //        data: jsonData.average,
        //        color: '#2e7bad'
        //    }],
        //    title: {
        //        text: 'Incorporate scatter plot and moving average'
        //    },
        //    subtitle: {
        //        text: 'From ' + jsonData.min_dt + ' to ' + jsonData.max_dt
        //    },
        //    xAxis: {
        //        type: 'datetime'
        //    },
        //    yAxis: {
        //        title: {
        //            text: 'Ranking'
        //        }
        //    },
        //    tooltip: {
        //        crosshairs: true,
        //        shared: true
        //    },
        //
        //    rangeSelector: {
        //        selected: 1
        //    },
        //
        //    legend: {
        //        enabled: true,
        //        layout: 'vertical',
        //        align: 'right',
        //        verticalAlign: 'middle',
        //        borderWidth: 0
        //    },
        //    credits: {
        //        enabled: true
        //    },
        //    loading: false,
        //    size: {},
        //    backgroundColor: 'rgba(0,0,0,0)'
        //};

        //var d0 = [
        //    [0, 0], [1, 0], [2, 1], [3, 2], [4, 15], [5, 5], [6, 12], [7, 10], [8, 55], [9, 13], [10, 25], [11, 10], [12, 12], [13, 6], [14, 2], [15, 0], [16, 0]
        //];

    }]);