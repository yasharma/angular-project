'use strict';

rxControllers.controller('loginCtrl', ['$scope','$location', '$window', 'loginSvr', function ($scope, $location, $window, loginSvr) {

    $scope.credentials = '';

    $scope.login = function (isValid) {
        if(!isValid) return;
        loginSvr.authenticate($scope.credentials)
            .then(function(response){
                if(response.err){
                    delete $window.sessionStorage.token;
                    //@TODO write generic error handler
                    alert('status : ' + response.status + ' : ' + response.statusText);
                    return;
                }
                $window.sessionStorage.token = response.items.accessToken;
                $location.path("/index");
            });
    };
}
])
