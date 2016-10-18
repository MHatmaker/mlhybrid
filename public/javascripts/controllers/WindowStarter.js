/*global require*/
/*global define*/

(function () {
    "use strict";
    console.log("ready to require stuff in WindowStarter");
    require(["lib/utils", 'angular']);

    define([
        'lib/utils',
        'lib/MLConfig',
        'controllers/PopupBlockerCtrl'
    ], function (utils, MLConfig) {

        var
            setupNewDisplay = function (channel, userName, wndIndex, destWnd, curmph, newSelectedWebMapId, query) {

                var
                    wndName = newSelectedWebMapId + wndIndex,
                    baseUrl,
                    displayBnds,
                    popresult,
                    modalInstance,
                    $inj,
                    $uibModal,
                    restUrl,
                    urlToUnblock = MLConfig.gethost(), //'OpenShift.Arcadian.com',
                    url = "?id=" + wndName + curmph.getGlobalsForUrl() +
                    "&channel=" + channel + "&userName=" + userName +
                    "&maphost=google" + "&referrerId=" + MLConfig.getUserId(),
                    gmQuery = query; //MLConfig.getQuery();

                if (gmQuery !== '') {
                    url += "&gmquery=" + gmQuery;
                    displayBnds = MLConfig.getBoundsForUrl();
                    url += displayBnds;
                }
                console.log("open new Google window with URI " + url);
                console.log("using channel " + channel + "with userName " + userName);
                MLConfig.setUrl(url);
                MLConfig.setUserName(userName);

                if (destWnd === "New Pop-up Window") {
                    baseUrl = MLConfig.getbaseurl();

                    popresult = window.open(baseUrl + "/google/" + url,  wndName, MLConfig.getSmallFormDimensions());
                    if (popresult === null) {
                        $inj = angular.element(document.body).injector();
                        $uibModal = $inj.get('$uibModal');

                        modalInstance = $uibModal.open({

                            templateUrl : '/templates/ModalDialogPopupBlocked',   // .jade will be appended
                            controller : 'PopupBlockerCtrl',
                            backdrop : 'false',

                            resolve: {
                                data : function () {
                                    return {'urlToUnblock': urlToUnblock};
                                }
                            }
                        });

                        modalInstance.result.then(function (msg) {
                            console.log("return from showing PopupBlockerDialog dialog");
                        });
                    }

                } else {
                    if (destWnd === "New Tab") {
                        baseUrl = MLConfig.getbaseurl();
                        restUrl = $inj.get('CurrentMapTypeService').getMapRestUrlForType('google');
                        window.open(baseUrl + restUrl + url, '_blank');
                        window.focus();
                    }
                }
            },

            openNewDisplay = function (channel, userName, destWnd, curmph, newSelectedWebMapId, query) {
                var $inj = angular.injector(['app']),
                    $http = $inj.get('$http');

                $http({method: 'GET', url: '/wndseqno'}).
                    success(function (data, status, headers, config) {
                        setupNewDisplay(channel, userName, data.wndNameSeqNo, destWnd, curmph, newSelectedWebMapId, query);
                    }).
                    error(function (data, status, headers, config) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                        console.log('Oops and error', data);
                        alert('Oops getting next window sequence number ' + data.wndseqno);
                    });
            };

        function init() {
            return {openNewDisplay : openNewDisplay};
        }
        return {
            start: init,
            openNewDisplay : openNewDisplay,
            setupNewDisplay : setupNewDisplay
        };
    });

}());
