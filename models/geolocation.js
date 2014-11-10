'use strict';

angular.module('geoLocation',[]).constant('geoLocation_msg', {
    'errors.location.unsupportedBrowser':'Browser does not support location services',
    'errors.location.notFound':'Unable to determine your location'
});

angular.module('geoLocation')
    .factory('geoLocation', ['$q','$rootScope','$window','geoLocation_msg',function ($q,$rootScope,$window,geoLocation_msg) {
        return {
            getLocation: function () {
                var deferred = $q.defer();
                if ($window.navigator && $window.navigator.geolocation) {
                    $window.navigator.geolocation.getCurrentPosition(function(position){
                        $rootScope.$apply(function(){deferred.resolve(position);});
                    }, function(error) {
                        $rootScope.$broadcast('error',geoLocation_msg['errors.location.notFound']);
                        $rootScope.$apply(function(){deferred.reject(geoLocation_msg['errors.location.notFound']);});
                    });
                }
                else {
                    $rootScope.$broadcast('error',geoLocation_msg['errors.location.unsupportedBrowser']);
                    $rootScope.$apply(function(){deferred.reject(geoLocation_msg['errors.location.unsupportedBrowser']);});
                }
                return deferred.promise;
            }
        };
    }]);