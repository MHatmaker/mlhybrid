/*global define, console,  google, navigator, plugin, document, window, alert*/

(function () {
    "use strict";

    console.log('MapCtrl setup');
    define([
        'lib/utils'
    ], function (libutils) {
        console.log('MapCtrl define');
        var selfMethods = {},
            mlmap,
            MapCtrl,
            selfMethods = {},
            infoWindow = null,
            utils = libutils;

        function MobileCtrlBrowser($scope, $state, $cordovaGeolocation, $ionicLoading, $ionicPlatform) {
            var watchOptions,
                watch;
            console.log("In mobile MapCtrl controller fire away");

            function initialize() {
                console.log("In initialize MOBILE");
                var mapOptions = {
                        center: new google.maps.LatLng(37.422858, -122.085065),
                        zoom: 15,
                        mapTypeId: google.maps.MapTypeId.ROADMAP
                    },
                    options = {
                        timeout: 20000,
                        maximumAge: 0,
                        enableHighAccuracy: true
                    };
                $ionicLoading.show({
                    template: '<ion-spinner icon="bubbles"></ion-spinner><br/>Acquiring location!'
                });

                function handleLocationError(browserHasGeolocation, infoWindow, pos) {
                    infoWindow.setPosition(pos);
                    infoWindow.setContent(browserHasGeolocation ?
                            'Error: The Geolocation service failed.' :
                            'Error: Your browser doesn\'t support geolocation.');
                    $ionicLoading.hide();
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
                    $ionicLoading.hide();
                    mlmap = utils.showMap(mapOptions);
                    // $scope.map = new google.maps.Map(document.getElementById("mapdiv"), mapOptions);

                }, function (error) {
                    console.log("Could not get location from $cordovaGeolocation.getCurrentPosition");
                    alert("Could not get location");
                    if (navigator.geolocation) {
                        console.log("ready to getCurrentPosition from google navigator");
                        navigator.geolocation.getCurrentPosition(function (position) {
                            console.log("in navigator getCurrentPosition callback");

                            mapOptions.center = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                            console.log("mapOptions.center " + mapOptions.center.lng() + ", " + mapOptions.center.lat());
                            console.debug(mapOptions);
                            mlmap = utils.showMap(mapOptions);
                            $ionicLoading.hide();
                        },
                            function () {
                                console.log("error in navigator.geolocation.getCurrentPosition");
                                $ionicLoading.hide();
                                handleLocationError(true, infoWindow, mlmap.getCenter());
                            });
                        $ionicLoading.hide();
                    } else {
                        console.log("Fall thru to default map display");
                        $ionicLoading.hide();
                        mlmap = utils.showMap(mapOptions);
                        console.debug(error);
                    }
                    $ionicLoading.hide();
                    console.log("fell thru navigator.geolocation.getCurrentPosition");
                });

                watchOptions = {
                    timeout: 3000,
                    enableHighAccuracy: true
                };
                watch = $cordovaGeolocation.watchPosition(watchOptions);

                watch.then(
                    null,

                    function (err) {
                        console.log(err);
                    },

                    function (position) {
                        var lat = position.coords.latitude,
                            long = position.coords.longitude;
                        console.log(lat + '' + long);
                        mlmap.setCenter(position);
                        utils.geoLocate(position, mlmap, "Changed positions");
                    }
                );

                watch.clearWatch();

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
            selfMethods.initialize = initialize;
            $ionicPlatform.ready(initialize);
            // console.log("addEventListener for deviceready after wait 5000");
            // setTimeout(function () {
            //     document.addEventListener("deviceready", initialize);
            //     console.log("wait 5000");
            // }, 5000);
        }

        function MapCtrlBrowser($rootScope, $scope, $state) {
            var watchOptions,
                watch;
            console.log("in MapCtrlBrowser");

            function initialize() {
                console.log("MapCtrl.initialize NOT MOBILE");
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
            selfMethods.initialize = initialize;
            initialize();
            google.maps.event.addDomListener(window, 'load', initialize);
        }

        function init(App, isMob) {
            console.log('MapCtrl outer init');
            var mpApp = angular.module('maplinkr');

            if (isMob) {
                MapCtrl = mpApp.controller('MapCtrl', ['$rootScope', '$state', '$cordovaGeolocation',
                    '$ionicLoading', '$ionicPlatform', MobileCtrlBrowser]);
            } else {
                MapCtrl = mpApp.controller('MapCtrl', ['$rootScope', '$scope', '$state', MapCtrlBrowser]);
            }
            return MapCtrl;
        }
        return {
            start: init
        };
    });
}).call(this);

// }());
