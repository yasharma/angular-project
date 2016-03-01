var config = angular.module('config',[]);
config.factory('configuration', function() {
  return {
      apiUrl : 'http://api.ratingscombined.com:80/v1/'
  };
});


