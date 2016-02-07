'use strict';

rxControllers.controller('detailCtrl', ['$scope', '$timeout', '$upload', 'localStorageService', '$location',
    '$routeParams', 'restaurantSvr', 'geoLocation', 'reviewSvr', 'overviewSvr', 'locationSvr',
    'photoSvr', 'Lightbox', 'userSvr', '$anchorScroll', '$modal', '$rootScope',
    function ($scope, $timeout, $upload, localStorageService, $location, $routeParams, restaurantSvr,
              geoLocation, reviewSvr, overviewSvr, locationSvr, photoSvr, Lightbox, userSvr, $anchorScroll, $modal, $rootScope) {

        var modalInstance = null;

        initTemplate();
        $anchorScroll();
        $scope.restaurantId = $routeParams.restaurantId;
        $scope.$watch('user', function () {
            $scope.isOwner = $scope.user && $scope.user.ownedRestaurants && _.contains($scope.user.ownedRestaurants, parseInt($scope.restaurantId));
        });
        clearForm();

        function clearForm() {
            $scope.activationForm = {};
            $scope.activationForm.restaurant_id = $scope.restaurantId;
            if ($scope.user) $scope.activationForm.user_id = $scope.user.id;
        }

        $scope.reviewListPageChanged = function () {
            var nextPage = $scope.reviewListCurrentPage;
            getReviews({
                page: nextPage
            });
        };

        $scope.changeLength = function (review) {
            review.textLength = 99999;
        };

        $scope.showPhone = function () {
            alert($scope.restaurant.phone);
        };


        $scope.getPhotos = function () {
            photoSvr.getRestaurantPhotos($scope.restaurantId).then(function (photos) {
                $scope.photos = photos.items;
            });
            $scope.openLightboxModal = function (index) {
                Lightbox.openModal($scope.photos, index);
            };
        };

        $scope.onFileSelect = function ($files) {
            //$files: an array of files selected, each file has name, size, and type.
            for (var i = 0; i < $files.length; i++) {
                var file = $files[i];
                $scope.upload = $upload.upload({
                    url: 'http://api.iresturant.com/v1/photos/upload?access-token=f899139df5e1059396431415e770c6dd', //upload.php script, node.js route, or servlet url
                    method: 'POST',
                    //headers: {'header-key': 'header-value'},
                    //withCredentials: true,
                    data: {myObj: $scope.myModelObj, restaurant_id: $scope.restaurantId, user_id: 1},
                    file: file, // or list of files ($files) for html5 only
                    //fileName: 'doc.jpg' or ['1.jpg', '2.jpg', ...] // to modify the name of the file(s)
                    // customize file formData name ('Content-Disposition'), server side file variable name.
                    fileFormDataName: 'data' //or a list of names for multiple files (html5). Default is 'file'
                    // customize how data is added to formData. See #40#issuecomment-28612000 for sample code
                    //formDataAppender: function(formData, key, val){}
                }).progress(function (evt) {
                    console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
                }).success(function (data, status, headers, config) {
                    // file is uploaded successfully
                    console.log(data);
                });
                //.error(...)
                //.then(success, error, progress);
                // access or attach event listeners to the underlying XMLHttpRequest.
                //.xhr(function(xhr){xhr.upload.addEventListener(...)})
            }
            /* alternative way of uploading, send the file binary with the file's content-type.
             Could be used to upload files to CouchDB, imgur, etc... html5 FileReader is needed.
             It could also be used to monitor the progress of a normal http post/put request with large data*/
            // $scope.upload = $upload.http({...})  see 88#issuecomment-31366487 for sample code.
        };

        $scope.claim = function () {
            if ($scope.isLogged) {
                $location.url($location.path() + '?request=claimRestaurant');
                handleRestaurantClaim();
            } else {
                $rootScope.returnToPage = $location.path() + '?request=claimRestaurant';
                $location.url('/login');
            }
        };

        // check if the restaurant is in user's favorites
        $scope.checkFavourite = function () {
            userSvr.getFavorites().then(function (response) {
                $scope.favoriteRestaurants = response;
                $scope.isFavourite = false;
                $scope.favouriteId = null;
                angular.forEach(response, function (restaurant) {
                    if (restaurant.id == $scope.restaurantId) {
                        $scope.isFavourite = true;
                        $scope.favouriteId = restaurant.favourite__id;
                    }
                });
            });
        };

        $scope.checkFavourite();

        // toggle favorite (add or remove restaurant from user's favorites)
        $scope.favourite = function () {
            if ($scope.isFavourite) {
                userSvr.removeFavorite($scope.favouriteId);
                $scope.favouriteId = null;
            } else {
                userSvr.addFavorite($scope.user.id, $scope.restaurant.id).then(function(data){
                    $scope.favouriteId = data.id;
                });
            }
            $scope.isFavourite = !$scope.isFavourite;
        };

        $scope.$on('$routeChangeSuccess', function () {
            handleRestaurantClaim();
        });

        function handleRestaurantClaim(){
            var modalInstance = checkParams($routeParams.request);

            if (typeof modalInstance !== undefined && Object.keys(modalInstance).length && $scope.user) {

                modalInstance = $modal.open({
                    templateUrl: modalInstance.templateLocation,
                    scope: $scope,
                    controller: modalInstance.controller,
                    windowClass: modalInstance.windowClass || ''
                });

                modalInstance.opened.then(function () {
                    $scope.showModal = true;
                    $(".overlay-main").css("display", "block");
                });

                modalInstance.result.then(function (selectedItem) {
                    $scope.selected = selectedItem;
                }, function () {
                    $(".overlay-main").css("display", "none");
                });

            }
        }


        function checkParams(params) {
            var modalDetails = {};
            switch ($routeParams.request) {
                case "validateRestaurant" :
                    modalDetails = {
                        modal: "validate",
                        requestParam: params,
                        templateLocation: "modules/claim/views/activation-form.html",
                        controller: "claimCtrl"

                    };
                    break;
                case "claimRestaurant" :
                    modalDetails = {
                        modal: "claim",
                        requestParam: params,
                        templateLocation: "modules/claim/views/form.html",
                        controller: "claimCtrl",
                        windowClass: "claim-modal-window"
                    };
                    break;
            }
            return modalDetails;
        }

        // get restaurant info, photos and stats
        function getRestaurant() {

            var restaurantId = $scope.restaurantId;
            restaurantSvr.getRestaurant(restaurantId).then(function (restaurant) {
                $scope.restaurant = restaurant;
            });

            $scope.getPhotos();

            restaurantSvr.getOverviews(restaurantId, $scope).then(function (stats) {
                $scope.stats = stats;
            });

        }

        function chartData() {
            getGraphData($scope.restaurantId);
        }

        function initTemplate() {
            $scope.templates =
                [
                    {name: 'review-widget.html', url: 'modules/partials/review-widget.html'},
                ];
            $scope.sidebarDetail = true;
            $scope.header = 'modules/partials/header.html';
            $scope.footer = 'modules/partials/footer.html';
            $scope.reviewBox = 'modules/review/views/index.html';
        }

        // initially: get restaurant data
        // first check if we have user's coordinates, get them if we don't.
        //  save them to local storage because getRestaurant will read them to return correct distance
        //  and map directions
        if (!localStorageService.get('latitude') || !localStorageService.get('longitude')) {
            geoLocation.getLocation()
                .then(function (data) {
                    localStorageService.add('latitude', data.coords.latitude);
                    localStorageService.add('longitude', data.coords.longitude);
                    getRestaurant();
                }, function (error) {
                    // if we can't get exact coordinates (user declines permission),
                    //  get approx. coordinates from ip
                    userSvr.getIp().then(function (ip) {
                        userSvr.getLocation(ip).then(function (location) {

                                localStorageService.add('latitude', location.lat);
                                localStorageService.add('longitude', location.lon);
                                getRestaurant();
                            },
                            function (error) {
                                getRestaurant();
                            })
                    });
                });
        }
        else{
            getRestaurant();
        }

    }
]);