'use strict';

rxControllers.controller('loginCtrl', ['$scope','$location', '$window', 'loginSvr', 'AuthenticationService', function ($scope, $location, $window, loginSvr, AuthenticationService) {

    $scope.credentials = '';

    $scope.login = function (isValid) {
        if(!isValid) return;
        loginSvr.authenticate($scope.credentials)
            .then(function(response){
                if(response.err){
                    delete $window.sessionStorage.token;
                    AuthenticationService.isLogged = 0;

                    //@TODO write generic error handler
                    alert('status : ' + response.status + ' : ' + response.statusText);
                    return;
                }
                AuthenticationService.isLogged = true;
                $window.sessionStorage.token = response.items.accessToken;
                $location.path("/index");
            });
    };
}
]);