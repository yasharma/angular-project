'use strict';

rxControllers.controller('loginCtrl', ['$scope', '$location', '$rootScope','loginSvr', 'AuthenticationService', 'messageCenterService', 'localStorageService' , function ($scope, $location, $rootScope, loginSvr, AuthenticationService, messageCenterService, localStorageService) {

    $scope.credentials = '';
    $scope.signup = {};

    $scope.login = function (isValid) {
        if(!isValid) return;
        loginSvr.authenticate($scope.credentials)
            .then(function(response){
                if(response.err){
                    localStorageService.remove('token');
                    AuthenticationService.isLogged = 0;
                    $rootScope.isLogged = false;
                }
                AuthenticationService.isLogged = true;
                $rootScope.isLogged = true;

                localStorageService.set('token', response.items.accessToken);
                $location.path("/index");
            });
    };

    $scope.signupUser = function(isValid){
        if(!isValid) return;
        loginSvr.signup($scope.signup)
            .then(function(response){
                if(response.err){
                    var error = getErrorMsg('signup', response.status);
                    messageCenterService.add('danger', error, { timeout: 3000 });
                    return;
                }
                messageCenterService.add('success', 'Thank you for registration.');
            });
    }

    function getErrorMsg (module, errStatus){
        var statusText = '';

        if ('signup' == module && 422 == errStatus){
            statusText = 'Please provide correct information. Thank you.';
        }else{
            statusText = "Something went wrong ! Please try again later."
        }
        return statusText;
    }
}]);
