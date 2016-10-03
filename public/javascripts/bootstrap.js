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
        'controllers/MapCtrl',
        'controllers/MapLinkrPluginCtrl',
        'controllers/MapLinkrMgrCtrl'
    ], function (MapCtrl, MapLinkrPluginCtrl, MapLinkrMgrCtrl) {
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
                            controller: 'MapLinkrMgrCtrl    '
                        });

                        $urlRouterProvider.otherwise("/");
                    }
                ]).

                factory("LinkrService", ['linkrScopes', function (linkrScopes) {
                    var hideLinkr,
                        showLinkr,
                        addScope;

                    addScope = function (scope) {
                        linkrScopes.addScope(scope);
                    };
                    hideLinkr = function () {
                        var data = {'visibility' : 'none'},
                            scp = linkrScopes.getScope();
                        if (scp) {
                            scp.$broadcast('displayLinkerEvent', data);
                        }
                    };
                    showLinkr = function () {
                        var data = {'visibility' : 'block'};
                        var scp = linkrScopes.getScope();
                        if (scp) {
                            scp.$broadcast('displayLinkerEvent', data);
                        }
                    };

                    return {addScope : addScope, hideLinkr: hideLinkr, showLinkr: showLinkr};
                }]).
                factory("CurrentMapTypeService", ['mapsvcScopes', function (mapsvcScopes) {
                    var mapTypes = {
                        'leaflet': MapHosterLeaflet,
                        'google' : MapHosterGoogle,
                        'arcgis' : MapHosterArcGIS
                    },
                        mapStartups = {
                            'leaflet': StartupLeaflet,
                            'google' : StartupGoogle,
                            'arcgis' : StartupArcGIS
                        },

                        mapRestUrl = {
                            'leaflet': 'leaflet',
                            'google' : 'google',
                            'arcgis' : 'arcgis',
                            'Leaflet': 'leaflet',
                            'GoogleMap' : 'google',
                            'ArcGIS' : 'arcgis'

                        },

                        mapType2Config = {
                            'leaflet': 2,
                            'google' : 0,
                            'arcgis' : 1
                        },

                        contentsText = ' \
                            The {0} tab opens a typical web page \
                            displaying typical web page stuff, including a div with {1} \
                            programmed with {2} embedded in it.',
                        mapSystemDct = {
                            'google' : 0,
                            'arcgis' : 1,
                            'leaflet' : 2
                        },
                        mapconfigs = [
                            {
                                maptype : 'google',
                                title : 'Google Maps',
                                site : 'Web Site featuring a Google Map',
                                content : String.format(contentsText, 'Google Map', 'a Google map', 'google map content'),
                                url : "/partials/google.html",
                                imgSrc : "css/images/googlemap.png",
                                imgAlt : "Google Map",
                                active : true,
                                disabled : false
                            },
                            {
                                maptype : 'arcgis',
                                title : 'ArcGIS Web Maps',
                                site : 'Web Site featuring an ArcGIS Online Map',
                                content : String.format(contentsText, 'ArcGIS', 'an ArcGIS Web Map', 'ArcGIS Online content'),
                                url : "/partials/arcgis.html",
                                imgSrc : "css/images/arcgis.png",
                                imgAlt : "ArcGIS Web Maps",
                                active : false,
                                disabled : false
                            },
                            {
                                maptype : 'leaflet',
                                title : 'Leaflet/OSM Maps',
                                site : 'Web Site featuring a Leaflet Map',
                                content : String.format(contentsText, 'Leaflet/OSM Map',  'a Leaflet/OSM map', 'Leaflet content'),
                                url : "/partials/leaflet.html",
                                imgSrc :  "css/images/Leaflet.png",
                                imgAlt : "Leaflet/OSM Maps",
                                active : false,
                                disabled : false
                            }
                        ],

                        getMapTypes = function () {
                            var values = Object.keys(mapTypes).map(function (key) {
                                return {'type' : key, 'mph' : mapTypes[key]};
                            });
                            return values;

                            // var mapTypeValues = [];
                            // for (var key in mapTypes){
                                // mapTypeValues.push(mapTypes[key]);
                            // return mapTypes;
                        },
                        getMapConfigurations = function () {
                            return mapconfigs;
                        },
                        getCurrentMapConfiguration = function () {
                            return mapconfigs[mapType2Config[currentMapType]];
                        },
                        getSpecificMapType = function (key) {
                            return mapTypes[key];
                        },
                        getCurrentMapType = function () {
                            return mapTypes[currentMapType];
                        },
                        getMapStartup = function () {
                            return mapStartups[currentMapType];
                        },
                        getMapTypeKey = function () {
                            return selectedMapType;
                        },
                        getMapRestUrl = function () {
                            return mapRestUrl[selectedMapType];
                        },
                        getMapRestUrlForType = function (tp) {
                            return mapRestUrl[tp];
                        },
                        setCurrentMapType = function (mpt) {
                            var data = {
                                'whichsystem' : mapconfigs[mapSystemDct[mpt]],
                            },
                                scp = mapsvcScopes.getScopes()[0];
                            previousMapType = currentMapType;
                            selectedMapType = mpt;
                            currentMapType = mpt;
                            console.log("selectedMapType set to " + selectedMapType);
                            MapCtrl.invalidateCurrentMapTypeConfigured();
                            if (scp) {
                                scp.$broadcast('SwitchedMapSystemEvent', data);
                            }
                        },
                        getPreviousMapType = function () {
                            return mapTypes[previousMapType];
                        },
                        getSelectedMapType = function () {
                            console.log("getSelectedMapType : " + selectedMapType);
                            return mapTypes[selectedMapType];
                        },

                        addScope = function (scope) {
                            mapsvcScopes.addScope(scope);
                        },
                        forceAGO = function () {
                        // Simulate a click on ArcGIS Ago mapSystem "Show the Map" buttons under the map system tabs.
                        // The listener resets the $locationPath under the ng-view.
                        // This code should be entered in a new window created by a publish event with the map system
                        // in the url

                            var data = {
                                'whichsystem' : mapconfigs[mapSystemDct.arcgis],
                                'newpath' : "/views/partials/arcgis"
                            },
                                scp = mapsvcScopes.getScopes()[0];
                            if (scp) {
                                scp.$broadcast('ForceAGOEvent', data);
                            }
                            console.log("forceAGO setting path to : " + data.newpath);
                            // window.location.pathname += "/views/partials/GoogleMap";
                            // window.location.reload();
                        },

                        forceMapSystem = function (mapSystem) {
                        // Simulate a click on one of the mapSystem "Show the Map" buttons under the map system tabs.
                        // The listener resets the $locationPath under the ng-view.
                        // This code should be entered in a new window created by a publish event with the map system
                        // in the url

                            var data = {'whichsystem' : mapconfigs[mapSystemDct[mapSystem]], 'newpath' : "/views/partials/" + mapSystem},
                                scp = mapsvcScopes.getScopes()[0];
                            if (scp) {
                                scp.$broadcast('ForceMapSystemEvent', data);
                            }
                            console.log("forceMapSystem setting path to : " + data.newpath);
                        };
                    return {
                        addScope : addScope,
                        getMapTypes: getMapTypes,
                        getCurrentMapType : getCurrentMapType,
                        getMapConfigurations : getMapConfigurations,
                        getCurrentMapConfiguration : getCurrentMapConfiguration,
                        getMapStartup : getMapStartup,
                        setCurrentMapType : setCurrentMapType,
                        getPreviousMapType : getPreviousMapType,
                        getSelectedMapType : getSelectedMapType,
                        getMapTypeKey : getMapTypeKey,
                        getMapRestUrl : getMapRestUrl,
                        getMapRestUrlForType : getMapRestUrlForType,
                        getSpecificMapType : getSpecificMapType,
                        forceMapSystem : forceMapSystem,
                        forceAGO : forceAGO
                    };
                }])
                factory("InjectorSvc", function () {
                    var injector = angular.injector(['app']),
                        getInjector = function () {
                            return injector;
                        };
                    return {
                        getInjector : getInjector
                    };
                }).

                factory("GoogleQueryService", function ($rootScope) {
                    googleQueryDct.rootScope = $rootScope;
                    var getRootScope = function () {
                        return googleQueryDct.rootScope;
                    },
                        getQueryDestinationDialogScope = function (mapsys) {
                            var elemID = 'DestWndDialogNode',
                                e = document.getElementById(elemID),
                                scope = angular.element(e).scope();
                            return scope;
                        },

                        getPusherDialogScope = function () {
                            var elemID = 'PusherChannelDialog',
                                e = document.getElementById(elemID),
                                scope = angular.element(e).scope();
                            return scope;
                        },

                        setDialogVisibility = function (tf) {
                            var e = document.getElementById('Verbage'),
                                scope = angular.element(e).scope(),
                                previousVisibility = scope.VerbVis;
                            scope.VerbVis = tf ? 'flex' : 'none';
                            if (tf === false) {
                                angular.element(e).css({'display' : 'none'});
                            }
                            return previousVisibility;
                        },

                        getQueryDct = function () {
                            return googleQueryDct;
                        },
                        setQuery = function (q) {
                            // alert('setQuery' + q);
                            googleQueryDct.query = q;
                        };
                    return {
                        getQueryDct: getQueryDct,
                        setQuery : setQuery,
                        getQueryDestinationDialogScope : getQueryDestinationDialogScope,
                        getPusherDialogScope : getPusherDialogScope,
                        setDialogVisibility : setDialogVisibility,
                        getRootScope : getRootScope
                    };
                }).

                factory("MapControllerService", function () {
                    var getController = function () {
                        return MapCtrl;
                    };

                    return {getController: getController};
                });


            ControllerStarter.start(mapModule, isMobile);

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
