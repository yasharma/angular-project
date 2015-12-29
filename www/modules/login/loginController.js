'use strict';

rxControllers.controller('loginCtrl', ['$scope', '$location', '$rootScope', 'loginSvr', 'AuthenticationService',
    'messageCenterService', 'localStorageService', function ($scope, $location, $rootScope, loginSvr,
                                                             AuthenticationService, messageCenterService, localStorageService) {

        $scope.navbarConfig = {
            hideButtons: true
        };

        $scope.credentials = '';
        $scope.user = {};
        $scope.signup = {};

        $scope.resetPassword = function (isValid) {
            if (!isValid) return;
            loginSvr.resetPassword(merge_objects($scope.credentials, $location.search()))
                .then(function (response) {
                    if (response.err) {
                        // messageCenterService.add('danger', response.message, { timeout: 3000 });
                        // the message is already added by app.js interceptor
                        // todo: messages should be cleaned up all over the app (mc-messages is missing on many pages, somewhere its double, etc)
                    } else {
                        // logout and go to password changed page
                        $rootScope.clearToken();
                        $location.path('/login/passwordchanged');
                    }
                });
        };

        $scope.forgotPassword = function (isValid) {
            if (!isValid) return;
            loginSvr.forgotPassword($scope.credentials)
                .then(function (response) {
                    if (response.err) {
                        messageCenterService.add('danger', response.message, {timeout: 3000});
                        return;
                    }
                    $scope.forgotRequestSent = true;
                });
        };

        $scope.login = function (isValid) {
            if (!isValid) return;
            loginSvr.authenticate($scope.credentials)
                .then(function (response) {
                    if (response.err) {
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
                        "id": response.items.id,
                        "username": response.items.username,
                        "email": response.items.email,
                        "ownsRestaurants": response.items.details.owned_restaurants && response.items.details.owned_restaurants.length,
                        "ownedRestaurants": response.items.details.owned_restaurants || []
                    });
                    $rootScope.user = localStorageService.get('user');
                    if ($rootScope.returnToPage) {
                        $location.path($rootScope.returnToPage);
                        $rootScope.returnToPage = null;
                    } else {
                        $location.path("/index");
                    }
                });
        };

        $scope.signupUser = function (isValid) {
            if (!isValid) return;
            loginSvr.signup($scope.signup)
                .then(function (response) {
                    if (response.err) {
                        var error = getErrorMsg('signup', response.status);
                        messageCenterService.add('danger', error, {timeout: 3000});
                        return;
                    }
                    messageCenterService.add('success', 'Thank you for registration.');
                });
        };

        $scope.updateUser = function (isValid) {
            if (!isValid) return;
           // var user = Object.keys($scope.user).map(function (key) {return obj[key]});
            var user = $scope.user;
            loginSvr.updateUser($rootScope.user.id, user)
                .then(function (response) {
                    if (response.err) {

                        var message = response.message;
                        if(response.status == 422 && typeof(response.data[0].message) != 'undefined'){
                            message = response.data[0].message;
                        }
                        messageCenterService.add('danger', message, {timeout: 3000});
                        // the message is already added by app.js interceptor
                        // todo: messages should be cleaned up all over the app (mc-messages is missing on many pages, somewhere its double, etc)
                    } else {
                        messageCenterService.add('success', 'User detail has been successfully updated.', {timeout: 3000});
                        var locallyStoredUser = localStorageService.get('user');
                        localStorageService.set('user', merge_objects(locallyStoredUser,{
                            "username": response.data.username,
                            "email": response.data.email
                        }));
                        $rootScope.user = localStorageService.get('user');
                    }
                });
        };

        function getErrorMsg(module, errStatus) {
            var statusText = '';

            if ('signup' == module && 422 == errStatus) {
                statusText = 'Please provide correct information. Thank you.';
            } else {
                statusText = "Something went wrong ! Please try again later."
            }
            return statusText;
        }
    }]);
