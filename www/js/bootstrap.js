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
/*jslint es5: true*/
/*global setTimeout*/

console.log("bootstrap outer wrapper");
(function () {
    "use strict";
    console.log("bootstrap setup method");

    define([
        'controllers/MapCtrl'
    ], function (MapCtrl) {
        console.log('bootstrap define method');
        function init() {
            console.log('app startup/init method');
            var modules = [],
                dependencies = ['ui.router', 'ionic'],
                isMobile = (ionic !== 'undefined') && (ionic.Platform.is("ios") || ionic.Platform.is("android")),
                mapModule;
            if (isMobile) {
                dependencies.push('ngCordova');
            }
            console.debug(modules);
            console.debug(dependencies);
            console.log("Is Mobile?");
            console.log(isMobile);

            mapModule = angular.module('maplinkr', dependencies.concat(modules))

                .config(['$locationProvider', '$urlRouterProvider', '$stateProvider',
                    function ($locationProvider, $urlRouterProvider, $stateProvider) {

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

            MapCtrl.start(isMobile);

            angular.element(document).ready(function() {
                angular.bootstrap(document.body, ['maplinkr']);
            });
            // angular.bootstrap(document.body, ['maplinkr']);
            // setTimeout(function () {
            //     console.log("First timout");
            //     angular.bootstrap(document.body, ['maplinkr']);
            // }, 1000);

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
                        // MapCtrl.start(isMobile);
                        // angular.bootstrap(document.body, ['maplinkr']);
                    // setTimeout(function () {
                        console.log("now bootstrap in run method");
                        // angular.bootstrap(document.body, ['maplinkr']);
                    // }, 1000);
                });
            }

            return { start: init };
        }
        return {
            start : init
        };
    });
// }).call(this);
}());
