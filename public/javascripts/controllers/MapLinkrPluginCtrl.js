/*global define */

(function () {
    "use strict";

    console.log('MapLinkrPluginCtrl setup');
    define([
        'angular'
    ], function (angular) {
        console.log('MapLinkrPluginCtrl define');

        function MapLinkrPluginCtrl($scope, $uibModalInstance, data) {
            console.log("in MapLinkrPluginCtrl");

            $scope.mldata = {};

            $scope.mldata = data.callback();
            $scope.mldata.using.current = { 'Same Window' : true, 'New Tab' : true, 'New Window' : true};

            $scope.onShowHideMapLinkrClicked = function (clickedItem) {
                var collapseTest = $scope.mldata[clickedItem].isCollapsed,
                    itm = '';
                if (collapseTest === true) {
                    for (itm in $scope.mldata) {
                        if (itm !== clickedItem && $scope.mldata[itm].isCollapsed === false) {
                            $scope.mldata[itm].isCollapsed = true;
                        }
                    }
                }
                $scope.mldata[clickedItem].isCollapsed = !$scope.mldata[clickedItem].isCollapsed;
            };

            $scope.onShowHideDestChoiceInstructionsClicked = function (clickedItem) {
                var collapseTest = $scope.mldata.using.destchoices[clickedItem].details.isCollapsed,
                    itm = '',
                    strBefore = "test " + clickedItem + " against ",
                    strAfter =  "next " + clickedItem + " against ";
                if (collapseTest === true) {
                    for (itm in $scope.mldata.using.destchoices) {
                        strBefore += " " + itm + " " + $scope.mldata.using.destchoices[itm].details.isCollapsed;
                        // console.log('test ' + itm + ' against ' + clickedItem);
                        // console.log($scope.mldata.using.destchoices[itm].details.isCollapsed)
                        if (itm !== clickedItem && $scope.mldata.using.destchoices[itm].details.isCollapsed === false) {
                            $scope.mldata.using.destchoices[itm].details.isCollapsed = true;
                            $scope.mldata.using.current[itm] = true;
                        }
                        strAfter += " " + itm + " " + $scope.mldata.using.destchoices[itm].details.isCollapsed;
                    }
                    console.log(strBefore);
                    console.log(strAfter);
                }
                $scope.mldata.using.destchoices[clickedItem].details.isCollapsed = !$scope.mldata.using.destchoices[clickedItem].details.isCollapsed;
                $scope.mldata.using.current[clickedItem] = !$scope.mldata.using.current[clickedItem];
                console.log("ShowHide " + clickedItem + " is now " + $scope.mldata.using.destchoices[clickedItem].details.isCollapsed);
            };

            $scope.accept = function () {
                console.log("on Accept ");
                $uibModalInstance.close();
            };

            $scope.cancel = function () {
                console.log("on Cancel");
                $uibModalInstance.dismiss('cancel');
            };

            $scope.hitEnter = function (evt) {
                if (angular.equals(evt.keyCode, 13) && !(angular.equals($scope.name, null) || angular.equals($scope.name, ''))) {
                    $scope.save();
                }
            }; // end hitEnter
        }


        function init() {
            console.log('MapLinkrPluginCtrl init');
            var mpApp = angular.module('maplinkr');

            mpApp.controller('MapLinkrPluginCtrl',  ['$scope', '$uibModalInstance', 'data', MapLinkrPluginCtrl]);

            return MapLinkrPluginCtrl;
        }

        return {
            start: init
        };
    });

}());
