/*global define */

(function () {
    "use strict";

    console.log('DestWndSetupCtrl setup');
    var selfdict = {
            'areWeInitialized' : false
        };
    define([
        'angular'
    ], function (angular) {
        console.log('DestWndSetupCtrl define');

        selfdict.areWeInitialized = false;

        function DestWndSetupCtrl($scope, $uibModalInstance, $uibModalStack, data) {
            console.log("in DestWndSetupCtrl");
            selfdict.areWeInitialized = false;
            $scope.destSelections = data.destSelections;
            $scope.data = {
                dstSel : data.dstSel || $scope.destSelections[0],
                title : data.title,
                icon : data.icon,
                snippet : data.snippet,
                mapType : data.mapType
            };
            $scope.status = {
                'detailsOpen' : false,
                'destChoicesOpen' : false
            };

            $scope.accept = function () {
                console.log("DestWndSetupCtrl.accept handler - onAcceptDestination " + $scope.data.dstSel);
                $uibModalInstance.close($scope.data);
            };

            $scope.cancel = function () {
                //$uibModalInstance.close($scope.data);
                // $uibModalInstance.dismiss();
                $uibModalStack.dismissAll("clear all instances");
            };

            $scope.close = function () {
                $uibModalInstance.close($scope.data);
            };

            $scope.hitEnter = function (evt) {
                if (angular.equals(evt.keyCode, 13) && !(angular.equals($scope.name, null) || angular.equals($scope.name, ''))) {
                    $scope.save();
                }
            }; // end hitEnter
        }

        function init(App) {
            console.log('DestWndSetupCtrl init');

            if (selfdict.areWeInitialized === false) {
                selfdict.areWeInitialized = true;
                App.controller('DestWndSetupCtrl',  ['$scope', '$uibModalInstance', '$uibModalStack', 'data', DestWndSetupCtrl]);
            }
            return DestWndSetupCtrl;
        }

        return {
            start: init
        };
    });

}());
