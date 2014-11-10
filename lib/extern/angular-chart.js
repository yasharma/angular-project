angular.module('AngularChart', []).directive('chart', function () {
    return {
        restrict:'E',
        template:'<div></div>',
        transclude:true,
        replace:true,
        scope: '=',
        link:function (scope, element, attrs) {
            //console.log('oo',attrs,scope[attrs.formatter])
            var opt = {
                chart:{
                    renderTo:element[0],
                    type:'line',
                    marginRight:0,
                    marginBottom:40
                },
                title:{
                    text:attrs.title,
                    x:-20 //center
                },
                subtitle:{
                    text:attrs.subtitle,
                    x:-20
                },
                xAxis:{
                    //tickInterval:1,
                    //title:{
                    //    text:attrs.xname
                    //}
                },
                plotOptions:{
                    lineWidth:0.5
                },

                tooltip:{
                    formatter:scope[attrs.formatter]||function () {
                        return '<b>' + this.y + '</b>'
                    }
                },
                series:[{ }]
            }


            //Update when charts data changes
            scope.$watch(function (scope) {
                return JSON.stringify({
                    //xAxis:{
                    //    categories:scope[attrs.xdata]
                    //    },
                    series:scope[attrs.ydata]
                });
            }, function (news) {
                //console.log('ola')
//                if (!attrs) return;
                news = JSON.parse(news)
                if (!news.series)return;
                angular.extend(opt,news)
                //console.log('opt.xAxis.title.text',opt)
                



                var chart = new Highcharts.Chart(opt);
            });
        }
    }

})