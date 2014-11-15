//note ns() (global string prototype),
//this prepends uiGmap to 'google-maps', so it is really 'uiGmapgoogle-maps'
angular.module('GoogleMaps', ['google-maps'.ns()]);