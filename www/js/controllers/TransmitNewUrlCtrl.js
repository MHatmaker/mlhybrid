/*global define */

(function () {
    "use strict";

    console.log('TransmitNewUrlCtrl setup');
    define(['lib/MLConfig', 'lib/utils', 'angular'], function (MLConfig, utils) {
        console.log('TransmitNewUrlCtrl define');
        var context = {};

        function TransmitNewUrlCtrl($scope, CurrentMapTypeService) {
            context.fullUrl = MLConfig.gethref();
            $scope.urlText = context.fullUrl;

            $scope.fetchUrl = function () {
                context.fullUrl = MLConfig.gethref();
                // context.urlText = $scope.urlText;
                /*
                $scope.urlText = context.fullUrl;
                var docEl = document.getElementById("UrlCopyFieldID");
                console.debug(docEl);
                var urlEl = angular.element(docEl);
                console.debug(urlEl);
                urlEl[0].select();
                console.log("fetchUrl : " + context.urlText);
                console.log("url : " + context.fullUrl);
                var labelDiv = utils.getElemById("UrlInstructions");
                labelDiv.css({"display" : "inline-block"});
                 */
            };

            $scope.publishUrl = function () {
                console.log("Publish Current URL");
                console.log(context.fullUrl);
                MLConfig.showConfigDetails('TransmitNewUrlCtrl - PUBLISH');
                var updtUrl = MLConfig.getUpdatedUrl(),
                // console.log(updtUrl);
                    curmph = CurrentMapTypeService.getSelectedMapType(),
                    curmapsys = CurrentMapTypeService.getMapRestUrl(),
                    referrerId,
                    referrerName,
                    nativeCenter,
                    newPos;

                updtUrl += '&maphost=' + curmapsys;
                referrerId = MLConfig.getReferrerId();
                updtUrl += '&referrerId=' + referrerId;
                referrerName = MLConfig.getUserName();
                updtUrl += '&referrerName=' + referrerName;

                nativeCenter = curmph.getCenter();
                MLConfig.setPosition(nativeCenter);

                newPos = MLConfig.getPosition();
                newPos.search = updtUrl;
                newPos.maphost = curmapsys;
                newPos.referrerId = referrerId;
                newPos.referrerName = referrerName;

                curmph.publishPosition(newPos);
            };
        }


        function init(App) {
            console.log('TransmitNewUrlCtrl init');
            App.controller('TransmitNewUrlCtrl', ['$scope', 'CurrentMapTypeService', TransmitNewUrlCtrl]);
            return TransmitNewUrlCtrl;
        }


        return { start: init };

    });

}).call(this);
