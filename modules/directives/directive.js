'use strict';

var directiveMod = angular.module('directive', []);

directiveMod.directive('showRating', function () {
    var showRating = {
        link: function postLink(scope, element, attrs) {
            var rating = Math.round(attrs.value);
            var maxStar = 5;
            var htmlData = "";
            for(var i = 0 ;i < rating; i++){
                htmlData = htmlData + '<span class="glyphicon glyphicon-star"></span>';
            }
            for(var i = 0; i < maxStar - rating; i++){
                htmlData = htmlData + '<span class="glyphicon glyphicon-star-empty"></span>';
            }
            element.html(htmlData);
        }
    }
    return showRating;
});

function merge_objects(obj1,obj2){
    var obj = {};
    for (var attrname in obj1) { obj[attrname] = obj1[attrname]; }
    for (var attrname in obj2) { obj[attrname] = obj2[attrname]; }
    return obj;
}