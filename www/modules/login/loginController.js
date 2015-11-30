'use strict';

rxControllers.controller('loginCtrl', ['$scope', '$location', '$rootScope','loginSvr', 'AuthenticationService',
    'messageCenterService', 'localStorageService', '$routeParams', function ($scope, $location, $rootScope, loginSvr,
    AuthenticationService, messageCenterService, localStorageService, $routeParams) {

    $scope.navbarConfig = {
        hideButtons: true
    };

    $scope.credentials = '';
    $scope.signup = {};

    if($routeParams.success){
        // replaces form with success message (e.g. the password was changed successfully)
        $scope.success = true;
    }

    $scope.resetPassword = function (isValid) {
        if(!isValid) return;
        loginSvr.resetPassword(merge_objects($scope.credentials, $location.search()))
            .then(function(response){
                if(response.err){
                    messageCenterService.add('danger', response.message, { timeout: 3000 });
                } else {
                    $location.path('/login/changepassword?success=true');
                }
            });
    };

    $scope.forgotPassword = function (isValid) {
        if(!isValid) return;
        loginSvr.forgotPassword($scope.credentials)
            .then(function(response){
                if(response.err){
                    messageCenterService.add('danger', response.message, { timeout: 3000 });
                    return;
                }
                $scope.forgotRequestSent = true;
            });
    };

    $scope.login = function (isValid) {
        if(!isValid) return;
        loginSvr.authenticate($scope.credentials)
            .then(function(response){
                if(response.err){
                    localStorageService.remove('token');
                    localStorageService.remove('user');
                    AuthenticationService.isLogged = 0;
                    $rootScope.isLogged = false;
                    delete $rootScope.user;
                    return;
                }
                AuthenticationService.isLogged = true;
                $rootScope.isLogged = true;

                localStorageService.set('token', response.items.accessToken);
                localStorageService.set('user', {
                    "id" : response.items.id,
                    "username" : response.items.username,
                    "email" :  response.items.email,
                    "ownsRestaurants": response.items.details.owned_restaurants && response.items.details.owned_restaurants.length,
                    "ownedRestaurants": response.items.details.owned_restaurants || []
                });
                $rootScope.user = localStorageService.get('user');
                if($rootScope.returnToPage){
                    $location.path($rootScope.returnToPage);
                    $rootScope.returnToPage = null;
                } else {
                    $location.path("/index");
                }
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
    };

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
