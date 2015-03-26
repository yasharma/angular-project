'use strict';

rxControllers.controller('graphCtrl', ['$scope', 'restaurantSvr', '$routeParams',
    function ($scope, restaurantSvr, $routeParams) {

        $scope.restaurantId = $routeParams.restaurantId;

        $scope.graphDurations = [
            {label:'Last 7 Days', value:'WEEKLY'},
            {label:'Last Month', value:'MONTHLY'},
            {label:'Last Year', value:'YEARLY'},
            {label:'Overall', value:'OVERALL'}
        ];
        $scope.graphDuration = $scope.graphDurations[3];

        $scope.graphTypes = [
            {label:'Rating', value:'percentile'},
            {label:'Trend', value:'trend'}
        ];
        $scope.graphType = $scope.graphTypes[0];

        $scope.setGraphDuration = function(option){
            $scope.graphDuration = option;
            $scope.getGraphs();
        };

        $scope.setGraphType = function(option){
            $scope.graphType = option;
            $scope.getGraphs();
        };

        $scope.getGraphs = function(){
            restaurantSvr.getGraphs($scope.restaurantId, $scope.graphDuration.value, $scope.graphType.value).then(function (graphs) {
                $scope.flotDataset = [graphs.data];

                $scope.donutDataset = graphs.source;
            });
        };

        //todo: remove commented code

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

        //$scope.flotDataset = [d0];
        //$scope.flotDataset = [[
        //    [173401200000, 381.78], [207702000000, 330.64], [237702000000, 130.64]
        //]];

        $scope.flotOptions =
        {
            series: {
                lines: {
                    show: false
                },
                splines: {
                    show: true,
                    tension: 0.4,
                    lineWidth: 1,
                    fill: 0.4
                },
                points: {
                    radius: 0,
                    show: true
                },
                shadowSize: 2
            },
            grid: {
                hoverable: true,
                clickable: true,
                tickColor: "#d9dee9",
                borderWidth: 1,
                color: '#d9dee9'
            },
            colors: ["#19b39b", "#644688"],
            xaxis: {
                mode:'time'
                //timeformat:"%y/%m/%d"
            },
            yaxis: {
                ticks: 4
            },
            tooltip: true,
            tooltipOpts: {
                content: "%y.4",
                defaultTheme: false,
                shifts: {
                    x: 0,
                    y: 20
                }
            }
        };

        //$scope.donutDataset = [
        //    {
        //        label: "Tripadvisor",
        //        data: 40
        //    },
        //    {
        //        label: "Eatability",
        //        data: 10
        //    },
        //    {
        //        label: "Urbanspoon",
        //        data: 20
        //    },
        //    {
        //        label: "Yelp",
        //        data: 12
        //    }
        //];



        $scope.donutOptions = {
            series: {
                pie: {
                    innerRadius: 0.35,
                    radius: 0.65,
                    show: true,
                    stroke: {
                        width: 0
                    },
                    label: {
                        show: true,
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
                content: '%s'
            }
        };

        $scope.getGraphs();

    }]);