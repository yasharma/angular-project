'use strict';

/* Login Services */
var loginService = angular.module('Services', []);

loginService.factory('loginSvr', ['Restangular', function (Restangular) {

    return {

        authenticate: function (params) {

            if (!params || undefined == params) params = {};

            var resource = Restangular.all('authentications/login');
            params.encrypted = false;
            var formData = $.param(params);
            return resource.post(formData, null, {"Content-Type": "application/x-www-form-urlencoded"})
                .then(function (response) {
                    return {
                        items: response.data.items[0],
                        meta: response.data._meta
                    };
                }, function (response) {
                    return {
                        err: 1,
                        status: response.status,
                        statusText: response.statusText
                    };
                });
        },

        signup: function (params) {

            if (!params || undefined == params) params = {};

            var resource = Restangular.all('authentications/register');
            var formData = $.param(params);

            return resource.post(formData, null, {"Content-Type": "application/x-www-form-urlencoded"})
                .then(function (response) {
                    return {
                        status: response.status
                    };
                }, function (response) {
                    return {
                        err: 1,
                        status: response.status,
                        statusText: response.statusText
                    };
                });
        },

        resetPassword: function (params) {

            if (!params || undefined == params) params = {};

            var resource = Restangular.all('authentications/reset');
            var formData = $.param(params);
            return resource.post(formData, null, {"Content-Type": "application/x-www-form-urlencoded"})
                .then(function (response) {
                    return response;
                }, function (response) {
                    return {
                        err: 1,
                        status: response.status,
                        statusText: response.statusText,
                        message: response.data.message
                    };
                });
        },

        updateUser: function (userId, params) {

            if (!params || undefined == params) params = {};

            var action = 'users';
            var resource = Restangular.one(action);
            var formData = $.param(params);
            return resource.customPUT(formData, userId, null, {"Content-Type": "application/x-www-form-urlencoded"})
                .then(function (response) {
                    return response;
                }, function (response) {
                    response['err'] = 1;
                    return response;
                });
        },

        forgotPassword: function (params) {

            if (!params || undefined == params) params = {};

            var resource = Restangular.all('authentications/forgot');
            var formData = $.param(params);
            return resource.post(formData, null, {"Content-Type": "application/x-www-form-urlencoded"})
                .then(function (response) {
                    return response;
                }, function (response) {
                    return {
                        err: 1,
                        status: response.status,
                        statusText: response.statusText,
                        message: response.data.message
                    };
                });
        }

    };
}]);

