/*global define */

(function () {
    "use strict";

    console.log('LocateSelfCtrl setup');
    define([
        'angular',
        'lib/utils'
    ], function (angular, utils) {
        console.log('LocateSelfCtrl define');
        var
            map = null,
            goooogle = null;

        function LocateSelfCtrl($scope, CurrentMapTypeService, LinkrService) {
            console.log("in LocateSelfCtrl");

            $scope.geoLocate = function () {
                var
                    mph = CurrentMapTypeService.getCurrentMapType();

                function handleLocationError(browserHasGeolocation, infoWindow, pos) {
                    infoWindow.setPosition(pos);
                    infoWindow.setContent(browserHasGeolocation ?
                            'Error: The Geolocation service failed.' :
                            'Error: Your browser doesn\'t support geolocation.');
                }

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

            };
        }

        function setMap(googl, mp) {
            goooogle = googl;
            map = mp;
        }

        function init(App) {
            console.log('LocateSelfCtrl init');

            App.controller('LocateSelfCtrl',  ['$scope', 'CurrentMapTypeService', 'LinkrService', LocateSelfCtrl]);

            return LocateSelfCtrl;
        }

        return {
            start: init,
            setMap : setMap
        };


    });

}());
