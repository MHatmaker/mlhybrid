// Ionic MapLinkr App
/*global ionic*/
/*global angular*/
/*global console*/
/*global document*/
/*global plugin*/
/*global google*/
/*global ngModule*/
/*global window*/
/*global cordova*/
/*global navigator*/

var modules = [],
    dependencies = ['ui.router', 'ionic'],
    isMobile = typeof ionic !== 'undefined' && (ionic.Platform.is("ios") || ionic.Platform.is("android")),
    mapdiv,
    mlmap,
    mapModule;
if (isMobile) {
    dependencies.push('ngCordova');
}
console.debug(modules);
console.debug(dependencies);

function toFixedOne(val, prec) {
    "use strict";
    var precision = prec || 0,
        neg = val < 0,
        power = Math.pow(10, precision),
        value = Math.round(val * power),
        integral = String((neg ? Math.ceil : Math.floor)(value / power)),
        fraction = String((neg ? -value : value) % power),
        padding = new Array(Math.max(precision - fraction.length, 0) + 1).join('0'),
        sign = neg ? "-" : "";

    if (integral[0] === '-') {
        sign = "";
    }
    return sign + (precision ? integral + '.' + padding + fraction : integral);
}

function toFixedTwo(x, y, precision) {
    "use strict";
    var fixed = {
        lon: toFixedOne(x, precision),
        lat: toFixedOne(y, precision)
    };
    return fixed;
}

mapModule = angular.module('maplinkr', dependencies.concat(modules))

.config(['$locationProvider', '$compileProvider', '$urlRouterProvider', '$stateProvider',
    function($locationProvider, $compileProvider, $urlRouterProvider, $stateProvider) {
            "use strict";
            $locationProvider.html5Mode({
                enabled: true,
                requireBase: false
            }); // enable html5 mode
            // other pieces of code.
            $stateProvider.state('map', {
                url: '/',
                templateUrl: 'templates/map.html',
                controller: 'MapCtrl'
            });

            $urlRouterProvider.otherwise("/");
        }
        ]);

if (isMobile) {
    mapModule.controller('MapCtrl', function ($scope, $state, $cordovaGeolocation) {
        "use strict";
        var options = {
                timeout: 10000,
                enableHighAccuracy: true
            };

        $cordovaGeolocation.getCurrentPosition(options).then(function(position) {
            var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude),
                mapOptions = {
                    center: latLng,
                    zoom: 15,
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                };

            $scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);

        }, function (error) {
            console.log("Could not get location");
            console.debug(error);
        });

        function toPluginPosition(lat, lng) {
            return new plugin.google.maps.LatLng(lat, lng);
        }

        mapdiv = document.getElementById("mapdiv");

        // Invoking Map using Google Map SDK v2 by dubcanada
        mlmap = plugin.google.maps.Map.getMap(mapdiv, {
            'camera': {
                'latLng': toPluginPosition(-19.9178713, -43.9603117),
                'zoom': 10
            }
        });
    });
} else {
    mapModule.controller('MapCtrl', function ($rootScope, $scope, $state) {
        "use strict";
        var infoWindow = null;
        console.log('entering MapCtrl setup');


        function formatCoords(pos) {
            var fixed = toFixedTwo(pos.lng, pos.lat, 5),
                formatted = '<div style="color: blue;">' + fixed.lon + ', ' + fixed.lat + '</div>';
            return formatted;
        }

        function geoLocate(pos) {
            infoWindow = new google.maps.InfoWindow({map: mlmap});
            infoWindow.setPosition(pos);
            infoWindow.setContent(formatCoords(pos));
            console.log('geoLocate just happened at ' + pos.lng + ", " +  pos.lat);
        }

        function initialize() {
            var fixed,
                pos,
                cntr = new google.maps.LatLng(37.422858, -122.085065),
                mapOptions = {
                    center: cntr,
                    zoom: 15,
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                };

            // window.setPageTitle();
            $rootScope.$on('$stateChangeSuccess', function (event) {
                // window.setPageTitle();
                console.debug(event);
            });
            pos = {'lat' : cntr.lat(), 'lng' : cntr.lng()};
            fixed = formatCoords(pos);
            console.log("Create map centered at " + fixed);
            mapdiv = document.getElementById('mapdiv');
            mlmap = new google.maps.Map(mapdiv, mapOptions);
            mlmap.setCenter(cntr);
            console.debug(cntr);
            // other pieces of code.

            infoWindow = new google.maps.InfoWindow({
                map: mlmap
            });
            infoWindow.setPosition(pos);
            infoWindow.setContent(formatCoords(pos));
            console.log('geoLocate just happened at ' + pos.lng + ", " + pos.lat);
        }

        function handleLocationError(browserHasGeolocation, infoWindow, pos) {
            infoWindow.setPosition(pos);
            infoWindow.setContent(browserHasGeolocation ?
                    'Error: The Geolocation service failed.' :
                    'Error: Your browser doesn\'t support geolocation.');
        }

        google.maps.event.addDomListener(window, 'load', initialize);

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                var pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                // LinkrService.hideLinkr();
                geoLocate(pos);
            },
                function () {
                    handleLocationError(true, infoWindow, mlmap.getCenter());
                });
        } else {
            // Browser doesn't support Geolocation
            handleLocationError(false, infoWindow, map.getCenter());
        }
    });
}

if (isMobile) {
    mapModule.run(function ($ionicPlatform, $window) {
        "use strict";
        $ionicPlatform.ready(function () {
            if ($window.cordova && $window.cordova.plugins.Keyboard) {
                // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
                // for form inputs)
                $window.cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

                // Don't remove this line unless you know what you are doing. It stops the viewport
                // from snapping when text inputs are focused. Ionic handles this internally for
                // a much nicer keyboard experience.
                $window.cordova.plugins.Keyboard.disableScroll(true);
            }
            if ($window.StatusBar) {
                $window.StatusBar.styleDefault();
            }
        });
    });


} else {
    mapModule.run(function() {
        "use strict";
        console.log("empty run method");
    });
}
