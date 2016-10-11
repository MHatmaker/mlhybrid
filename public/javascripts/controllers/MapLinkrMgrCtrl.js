/*global define, console, angular */
/*jslint es5: true */

(function () {
    "use strict";

    console.log('MapLinkrMgrCtrl setup');
    var selfMethods = {};
    define([
        'controllers/MapLinkrPluginCtrl'
    ], function (MapLinkrPluginCtrl) {
        console.log('MapLinkrMgrCtrl define');

        function MapLinkrMgrCtrl($scope, $rootScope, $uibModal, linkrSvc) {
            console.log("in MapLinkrMgrCtrl");
            var getData;
            $scope.mldata = {
                'news' : {
                    'isCollapsed' : true,
                    'subtext' : ""
                },
                'using' : {
                    'isCollapsed' : true,
                    'destchoices' : {
                        'Same Window' : {
                            'choice' : 'Same Window',
                            'details' : {
                                'isCollapsed' : true,
                                'text' : 'The newly selected map replaces the current map in the map viewer to the left.'
                            }
                        },

                        'New Tab' : {
                            'choice' : 'New Tab',
                            'details' : {
                                'isCollapsed' : true,
                                'text' : 'The newly selected map opens in a new tab in the current browser. \
                                       Switch to the tab and drag the tab to the desktop, which displays \
                                        the tab\'s contents in a completely new browser instance. \
                                          This is a fully functional web browser.'
                            }
                        },

                        'New Window' : {
                            'choice' : 'New Window',
                            'details' : {
                                'isCollapsed' : true,
                                'text' : 'The newly selected map is opened in a map viewer in a \
                                    new popup  window.  Although this is not a full-featured new \
                                    web browser instance, it provides complete functionality as \
                                     a synchronized map viewer.  If  popups are turned off, \
                                     use sequence described under the \'New Tab\' option above.'
                            }
                        }

                    }

                },
                'groups' : {
                    'isCollapsed' : true,
                    'subtext' : ""
                },

                'maps' : {
                    'isCollapsed' : true,
                    'subtext' : ""
                },
                'shareinst' : {
                    'isCollapsed' : true,
                    'subtext' : ""
                },
                'copyurl' : {
                    'isCollapsed' : true,
                    'subtext' : ""
                },
                'setchannel' : {
                    'isCollapsed' : true,
                    'subtext' : ""
                },
                'publishurl' : {
                    'isCollapsed' : true,
                    'subtext' : ""
                },
                'positionview' : {
                    'isCollapsed' : true,
                    'subtext' : ""
                },
                'locateself' : {
                    'isCollapsed' : true,
                    'subtext' : ""
                },
                'callback' : null,
                'isOpen' : false,
                'mapLinkrBtnImage' : "Expand",
                'mapLinkrBtnText' : 'MapLinkr',
                'ExpandPlug' : "MapLinkr"
            };
            linkrSvc.addScope($scope);

            $rootScope.$on('OpenMapPaneCommand', function (event, args) {
                $scope.mldata.groups.isCollapsed = !$scope.mldata.groups.isCollapsed;
                $scope.mldata.maps.isCollapsed = !$scope.mldata.maps.isCollapsed;
                // $scope.$broadcast('OpenMapPaneCommand', args);  // ? args.respData);
            });

            $scope.$on('displayLinkerEvent', function (event, data) {
                if (data.visibility !== 'none') {
                    $scope.onMapLinkrClicked();
                }
            });

            $scope.onMapLinkrClicked = function () {
                console.log("onMapLinkrClicked");

                $scope.mldata.isOpen = true;
                $scope.mldata.mapLinkrBtnImage = "Collapse";
                $scope.mldata.mapLinkrBtnText = "MapLinkr";
                console.debug($scope.mldata);

                var modalInstance = $uibModal.open({
                    // template : tmplt,
                    templateUrl : '/templates/MapLinkrPlugin',   // .jade will be appended
                    controller : 'MapLinkrPluginCtrl',
                    backdrop : 'false',

                    resolve : {
                        data: function () {
                            return $scope.mldata;
                        }
                    }
                });

                modalInstance.result.then(function (msg) {
                    console.log("return from showing MapLink dialog");
                    console.log(msg);
                    $scope.mldata.mapLinkrBtnText = "MapLinkr";
                    $scope.mldata.isOpen = false;
                    $scope.mldata.mapLinkrBtnImage = "Expand";
                    $scope.$broadcast("MapLinkrClosedEvent");
                    // modalInstance = null;
                }, function () {
                    console.log('MapLinkr Modal dismissed at: ' + new Date());
                    $scope.mldata.mapLinkrBtnText = "MapLinkr";
                    $scope.mldata.isOpen = false;
                    $scope.mldata.mapLinkrBtnImage = "Expand";
                    $scope.$broadcast("MapLinkrClosedEvent");
                    // modalInstance.opened.$$state.value = false;
                });
            };

            $scope.mldata.callback = function () {
                return $scope.mldata;
            };

            getData = function () {
                return $scope.mldata;
            };
            selfMethods.getData = getData;
        }

        function getData() {
            return selfMethods.getData();
        }

        function init(App) {
            console.log('MapLinkrMgrCtrl init');
            var locApp = angular.module('maplinkr');

            locApp.controller('MapLinkrMgrCtrl',  ['$scope', '$rootScope', '$uibModal', 'LinkrService', MapLinkrMgrCtrl]);

            return MapLinkrMgrCtrl;
        }

        return { start: init, getLinkrMgrData : getData};
    });

// }());
}).call(this);
