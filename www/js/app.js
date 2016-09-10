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
/*global define*/

(function () {
    "use strict";

    console.log('app setup');
    define([
        'angular',
        'lib/utils'
    ], function (angular, utils) {
        console.log('app define');
        var modules = [],
            dependencies = ['ui.router', 'ionic'],
            isMobile = typeof ionic !== 'undefined' && (ionic.Platform.is("ios") || ionic.Platform.is("android")),
            mlmap,
            infoWindow = null,
            mapModule;
        if (isMobile) {
            dependencies.push('ngCordova');
        }
        console.debug(modules);
        console.debug(dependencies);

        mapModule = angular.module('maplinkr', dependencies.concat(modules))

            .config(['$locationProvider', '$compileProvider', '$urlRouterProvider', '$stateProvider',
                function ($locationProvider, $compileProvider, $urlRouterProvider, $stateProvider) {

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
                console.log("In mobile MapCtrl controller fire away");

                function initialize() {
                    console.log("In initialize");
                    var mapOptions = {
                            center: new google.maps.LatLng(37.422858, -122.085065),
                            zoom: 15,
                            mapTypeId: google.maps.MapTypeId.ROADMAP
                        },
                        options = {
                            timeout: 10000,
                            enableHighAccuracy: true
                        };

                    function handleLocationError(browserHasGeolocation, infoWindow, pos) {
                        infoWindow.setPosition(pos);
                        infoWindow.setContent(browserHasGeolocation ?
                                'Error: The Geolocation service failed.' :
                                'Error: Your browser doesn\'t support geolocation.');
                    }
                    // window.setPageTitle();
                    // $rootScope.$on('$stateChangeSuccess', function (event) {
                        // window.setPageTitle();
                    //     console.debug(event);
                    // });

                    $cordovaGeolocation.getCurrentPosition(options).then(function (position) {
                        console.log("in $cordovaGeolocation.getCurrentPosition callback");
                        // var latLng = new google.maps.LatLng(33.5432, -112.075)
                        var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                        mapOptions = {
                            center: latLng,
                            zoom: 15,
                            mapTypeId: google.maps.MapTypeId.ROADMAP
                        };
                        console.log("ready to create/show Map in callback");
                        console.log("center; " + mapOptions.center.lng() + ", " + mapOptions.center.lat());
                        mlmap = utils.showMap(mapOptions);
                        // $scope.map = new google.maps.Map(document.getElementById("mapdiv"), mapOptions);

                    }, function (error) {
                        console.log("Could not get location");
                        // alert("Could not get location");
                        if (navigator.geolocation) {
                            console.log("ready to getCurrentPosition from google navigator");
                            navigator.geolocation.getCurrentPosition(function (position) {
                                console.log("in navigator getCurrentPosition callback");

                                mapOptions.center = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                                console.log("mapOptions.center " + mapOptions.center.lng + ", " + mapOptions.center.lat);
                                console.debug(mapOptions);
                                mlmap = utils.showMap(mapOptions);
                            },
                                function () {
                                    console.log("error in navigator.geolocation.getCurrentPosition");
                                    handleLocationError(true, infoWindow, mlmap.getCenter());
                                });
                        } else {
                            mlmap = utils.showMap(mapOptions);
                            console.debug(error);
                        }
                    });

                    function toPluginPosition(lat, lng) {
                        return new plugin.google.maps.LatLng(lat, lng);
                    }

                    // mapdiv = document.getElementById("mapdiv");

                    // Invoking Map using Google Map SDK v2 by dubcanada
                    // mlmap = plugin.google.maps.Map.getMap(mapdiv, {
                    //     'camera': {
                    //         'latLng': toPluginPosition(-19.9178713, -43.9603117),
                    //         'zoom': 10
                    //     }
                    // });
                }
                console.log("addEventListener for deviceready");
                document.addEventListener("deviceready", initialize);
            });
        } else {
            mapModule.controller('MapCtrl', function ($rootScope, $scope, $state) {

                console.log('entering MapCtrl setup');

                function initialize() {
                    var mapOptions = {
                            center: new google.maps.LatLng(37.422858, -122.085065),
                            zoom: 15,
                            mapTypeId: google.maps.MapTypeId.ROADMAP
                        };
                    function handleLocationError(browserHasGeolocation, infoWindow, pos) {
                        infoWindow.setPosition(pos);
                        infoWindow.setContent(browserHasGeolocation ?
                                'Error: The Geolocation service failed.' :
                                'Error: Your browser doesn\'t support geolocation.');
                    }

                    if (navigator.geolocation) {
                        console.log("ready to getCurrentPosition");
                        navigator.geolocation.getCurrentPosition(function (position) {
                            console.log("getCurrentPosition");

                            mapOptions.center = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                            mlmap = utils.showMap(mapOptions);
                        },
                            function () {
                                handleLocationError(true, infoWindow, mlmap.getCenter());
                            });
                    } else {
                        // Browser doesn't support Geolocation
                        handleLocationError(false, infoWindow, mlmap.getCenter());
                        mlmap = utils.showMap(mapOptions);
                    }
                }
                google.maps.event.addDomListener(window, 'load', initialize);
            });
        }

        if (isMobile) {
            mapModule.run(function ($ionicPlatform, $window) {
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
            mapModule.run(function () {
                console.log("empty run method");
            });
        }
    });
    return mapModule;
// }());
}).call(this);
