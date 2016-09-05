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


var modules = [],
    dependencies = ['ui.router', 'ionic'],
    isMobile = typeof ionic !== 'undefined' && (ionic.Platform.is("ios") || ionic.Platform.is("android"));
if (isMobile) {
    dependencies.push('ngCordova');
}
console.debug(modules);
console.debug(dependencies);

angular.module('maplinkr', dependencies.concat(modules))

    .config(['$locationProvider', '$compileProvider', '$urlRouterProvider', '$stateProvider',
        function ($locationProvider, $compileProvider, $urlRouterProvider, $stateProvider) {
            "use strict";
            $locationProvider.html5Mode(
                {
                    enabled : true,
                    requireBase : false
                }
            ); // enable html5 mode
            // other pieces of code.
            $stateProvider.state('map', {
                url: '/',
                templateUrl: 'templates/map.html',
                controller: 'MapCtrl'
            });

            $urlRouterProvider.otherwise("/");
        }])
    .controller('MapCtrl', function ($scope, $state, $cordovaGeolocation) {
        "use strict";
        var options = {
            timeout: 10000,
            enableHighAccuracy: true
        };

        if (isMobile) {
            $cordovaGeolocation.getCurrentPosition(options).then(function (position) {
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
        } else {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function (position) {
                    var pos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    // LinkrService.hideLinkr();
                    mph.geoLocate(pos);
                    // $scope.$parent.accept();
                    setTimeout(function () {
                        $scope.$parent.accept();
                    }, 200);
                },
                    function () {
                        handleLocationError(true, infoWindow, map.getCenter());
                    });
            } else {
              // Browser doesn't support Geolocation
                handleLocationError(false, infoWindow, map.getCenter());
            }
        }
    })
    .run(function ($ionicPlatform, $rootScope) {
        "use strict";
        $ionicPlatform.ready(function () {
            if (window.cordova && window.cordova.plugins.Keyboard) {
                // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
                // for form inputs)
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

                // Don't remove this line unless you know what you are doing. It stops the viewport
                // from snapping when text inputs are focused. Ionic handles this internally for
                // a much nicer keyboard experience.
                cordova.plugins.Keyboard.disableScroll(true);
            }
            if (window.StatusBar) {
                window.StatusBar.styleDefault();
            }

            // window.setPageTitle();
            $rootScope.$on('$stateChangeSuccess', function (event) {
                // window.setPageTitle();
                console.debug(event);
            });
                // other pieces of code.

            // Function that return a LatLng Object to Map
            function setPosition(lat, lng) {
                return new plugin.google.maps.LatLng(lat, lng);
            }

            var div = document.getElementById("map"),
                map,
                cntr;

                // Invoking Map using Google Map SDK v2 by dubcanada
            if (isMobile) {
                map = plugin.google.maps.Map.getMap(div, {
                    'camera': {
                        'latLng': setPosition(-19.9178713, -43.9603117),
                        'zoom': 10
                    }
                });
            } else {
                div = document.getElementById('map');
                map = google.maps.Map(div);
                cntr = new google.maps.LatLng(37.422858, -122.085065);
                map.setCenter(cntr);
            }

            if (isMobile) {
                ngModule.run(function ($ionicPlatform, $window) {
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
            }
        });
    });
