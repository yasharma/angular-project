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
        deleteRestaurantPhotos: function (photoId) {

            var photos = Restangular.all("photos", photoId);
            console.log(photoId);

            return photos.remove({}, {'Content-Type':'application/json'})
                .then(function (response) {
                    console.log('delete restaurant photo response ' + response);
                    return response;
                });

//            var headers = {
//                'Access-Control-Allow-Origin' : '*',
//                'Access-Control-Allow-Methods' : 'POST, GET, OPTIONS, PUT, DELETE',
//                'Content-Type': 'application/json',
//                'Accept': 'application/json'
//            };
//
//            return $http({
//                method: "DELETE",
//                headers: headers,
//                url: 'http://api.reviews-combined.com:80/v1/photos/'+ photoId + '?access-token=1296a85a52bb54d70054e3a754567c34',
//                data: {}
//            }).success(function(result) {
//                console.log("Delete photo success!")
//                console.log(result);
//            }).error(function(data, status, headers, config) {
//                console.log("Delete photo error!")
//                console.log(data);
//                console.log(status);
//                console.log(headers);
//                console.log(config);
//            });
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