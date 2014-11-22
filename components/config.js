var config = angular.module('config',[]);
config.factory('configuration', function() {
  return {
      apiUrl : 'http://api.ireview.dev/v1/'
      //apiUrl : 'http://api.irestaurant.com/v1/'
  };
});


