/*global define, console,  google, navigator, plugin, document, window*/

(function () {
    "use strict";

    console.log('MapCtrl setup');
    define([
        'lib/utils'
    ], function (libutils) {
        console.log('MapCtrl define');
        var isMobile = false,
            mapModule = null,
            mlmap,
            infoWindow = null,
            utils = libutils;

        function MapCtrl(mpmod) {
            console.log("in MapCtrl");
            mapModule = mpmod;
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
                        console.log("MapCtrl.initialize");
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
                    initialize();
                    google.maps.event.addDomListener(window, 'load', initialize);
                });
            }

            // function init(isMob, App) {
            //     console.log('MapCtrl init');
            //     isMobile = isMob;
            //     mapModule = App;
            //
            //     App.controller('MapCtrl',  ['$scope', MapCtrl]);
            //
            //     return MapCtrl;
            // }

            // return {
            //     start: init
            // };
        }
        // return MapCtrl;
        return {
            start : MapCtrl
        };
    });
}).call(this);

// }());
