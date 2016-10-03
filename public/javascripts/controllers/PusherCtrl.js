/*global define */

(function () {
    "use strict";

    console.log('PusherCtrl setup');
    define([
        'angular'
    ], function (angular) {
        console.log('PusherCtrl define');

        function PusherCtrl($scope, $uibModalInstance, data) {
            console.log("in PusherCtrl");

            // selfdict.callbackFunction = null;
            $scope.data = {
                privateChannelMashover : data.privateChannelMashover,
                userName : data.userName
            };

            $scope.hitEnter = function (evt) {
                if (angular.equals(evt.keyCode, 13) && !(angular.equals($scope.name, null) || angular.equals($scope.name, ''))) {
                    $scope.save();
                }
            }; // end hitEnter

            $scope.accept = function () {
                $uibModalInstance.close($scope.data);
            };

            $scope.cancel = function () {
                $uibModalInstance.dismiss('cancel');
            };

        }

        function init(App) {
            console.log('PusherCtrl init');

            App.controller('PusherCtrl',  ['$scope', '$uibModalInstance', 'data', PusherCtrl]);

            return PusherCtrl;
        }

        return { start: init};


    });

}());
