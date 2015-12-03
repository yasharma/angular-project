'use strict';

angular.module('directive', ['restaurantService'])
    .directive('searchBox', ['restaurantSvr', searchBox])
    .directive('shareLinks', ['$location', shareLinks])
    .directive('accordionGroupMod', [accordionGroupMod]);

function searchBox(restaurantSvr) {
    return {
        restrict: 'E',
        templateUrl: 'modules/partials/search-box.html',
        replace: true,
        link: function (scope) {
            scope.navSearch = function (val) {
                return restaurantSvr.findRestaurant(val)
                    .then(function (response) {
                        if (!response.length) {
                            response.push({formatted: "no results found"});
                        }
                        var filterOutKeys = {};
                        angular.forEach(scope.filterOut, function(restaurant){
                            filterOutKeys[restaurant.id] = true;
                        });

                        return response.map(function (item) {
                            if ("no results found" !== item.formatted) {
                                var formatted = item.formatted.split(' - ');
                                item.searchText = formatted[0];
                                var tags = formatted[1].split(':');
                                item.tag = tags[0];
                                item.tagValue = tags[1];
                            }
                            return item;
                        }).filter(function(item){
                            if(! (item && item.data)){
                                return true; // in case item is invalid, return it
                            } else {
                                return ! filterOutKeys[item.data.id];
                            }
                        });
                    });
            }
        },
        scope: {
            setRestaurant: '&', // action that's called on restaurant selection
            placeholder: '@',
            filterOut: '=' // list of restaurant ids to hide in results
        }
    };
}

function shareLinks($location) {
    return {
        link: function (scope, elem, attrs) {
            var i,
                sites = ['twitter', 'facebook', 'linkedin', 'google-plus'],
                theLink,
                links = attrs.shareLinks.toLowerCase().split(','),
                pageLink = encodeURIComponent($location.absUrl()),
                pageTitle = attrs.shareTitle,
                pageTitleUri = encodeURIComponent(pageTitle),
                shareLinks = [];

            // assign share link for each network
            angular.forEach(links, function (key) {
                key = key.trim();

                switch (key) {
                    case 'twitter':
                        theLink = 'http://twitter.com/intent/tweet?text=' + pageTitleUri + '%20' + pageLink;
                        break;
                    case 'facebook':
                        theLink = 'http://facebook.com/sharer.php?u=' + pageLink;
                        break;
                    case 'linkedin':
                        theLink = 'http://www.linkedin.com/shareArticle?mini=true&url=' + pageLink + '&title=' + pageTitleUri;
                        break;
                    case 'google-plus':
                        theLink = 'https://plus.google.com/share?url=' + pageLink;
                        break;
                }

                if (sites.indexOf(key) > -1) {
                    shareLinks.push({network: key, url: theLink});
                }
            });
            scope.openWindow = function (ii){
                alert(ii);
                alert(shareLinks[ii].url);
            };
            for (i = 0; i < shareLinks.length; i++) {
                var anchor = '';
                anchor += '<a class="pointer" onclick="window.open(' + "'" + shareLinks[i].url +
                  "', '_blank', 'width=550,height=450,toolbar=0,location=0,menubar=0'" + ')" ';
                   //+ 'href="' + shareLinks[i].url + '" target="_blank"';
                //anchor += '<a onclick="window.open("'+ shareLinks[i].url +'", "_system");"';
                anchor += '><i width="36" height="36" title="Share" class="share-button fa fa-' + shareLinks[i].network + '"></a>';
                elem.append(anchor);
            }
        }
    };
}

// angular ui accordion-group mod with plus/minus icon
function accordionGroupMod() {
    return {
        restrict: "E",
        transclude: true,
        scope: {
            heading: "@",
            isOpen: "=?"
        },
        template: '<accordion-group is-open="isOpen"><accordion-heading>' +
        '<i class="glyphicon" ng-class="{\'glyphicon-minus\': isOpen, \'glyphicon-plus\': !isOpen}"'+
        'style="font-size: 60%; vertical-align: 2px; padding-right: 10px;"></i>{{heading}}' +
        '</accordion-heading><div ng-transclude></div></accordion-group>'
    };
}