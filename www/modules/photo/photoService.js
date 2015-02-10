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
        uploadRestaurantPhoto: function (restaurantId,item) {

            var resource = 'photos/' + restaurantId;
            var data = new FormData();
            angular.forEach(item, function (fieldData, field) {
                data.append(field, fieldData);
            });

            Restangular
                .all(resource)
                .withHttpConfig({transformRequest: angular.identity})
                .post(data, {}, {'Content-Type': 'multipart/form-data'})
                .then(function (msg) {
                    console.log(msg);
                }, function () {
                    // do on failure
                });
        }
    };
}]);