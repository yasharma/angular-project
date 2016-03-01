'use strict';

/* Services */

var photoService = angular.module('photoService', []);

photoService.factory('photoSvr', ['localStorageService', 'Restangular', '$http', function (localStorageService, Restangular, $http) {

    return {

        getRestaurantPhotos: function (restaurantId, params) {

            var resource = 'restaurants/' + restaurantId + '/photos';
            var photos = Restangular.all(resource);

            return photos.getList(params)
                .then(function (response) {
                    return {
                        items : response.data[0].items,
                        _meta : response.data[0]._meta
                    }
                });
        },

        deleteRestaurantPhotos: function (photo) {
            var photoId = photo.id;
            var photos = Restangular.all("photos/"+photoId);

            return photos.remove()
                .then(function (response) {
                    return response;
                });
        },

        uploadRestaurantPhoto: function (items) {

            var resource = 'photos/upload';
            var formData = new FormData();

            angular.forEach(items, function (fieldData, field) {
                formData.append(field, fieldData);
            });

            return Restangular.one(resource)
                .withHttpConfig({transformRequest: angular.identity})
                .customPOST(formData, '', undefined, {'Content-Type': undefined})
                .then(function (response) {
                    return {
                        items: response.data
                    }
            });
        },

        updateRestaurantPhoto: function (photo) {
            var resource = 'photos';
            var formData = $.param(photo);

            return Restangular.one(resource, photo.id)
                .customPUT(formData, null, null, {'Content-Type': 'application/x-www-form-urlencoded'})
                .then(function (response) {
                    return response;
                });
        }
    };
}]);