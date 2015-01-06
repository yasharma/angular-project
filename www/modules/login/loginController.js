'use strict';

rxControllers.controller('loginCtrl', ['$scope','$location', '$window', 'loginSvr', 'AuthenticationService', 'messageCenterService' , function ($scope, $location, $window, loginSvr, AuthenticationService, messageCenterService) {

    $scope.credentials = '';
    $scope.signup = {};

    $scope.login = function (isValid) {
        if(!isValid) return;
        loginSvr.authenticate($scope.credentials)
            .then(function(response){
                if(response.err){
                    delete $window.sessionStorage.token;
                    AuthenticationService.isLogged = 0;
                    var error = getErrorMsg('login',response.status);
                    messageCenterService.add('danger', error, { timeout: 3000 });
                    return;
                }
                AuthenticationService.isLogged = true;
                $window.sessionStorage.token = response.items.accessToken;
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

        if('login' == module && 422 == errStatus){
            statusText = 'The username or password you entered is incorrect.';
        }else if ('signup' == module && 422 == errStatus){
            statusText = 'Please provide correct information. Thank you.';
        }else{
            statusText = "Something went wrong ! Please try again later."
        }
        return statusText;
    }
}]);
