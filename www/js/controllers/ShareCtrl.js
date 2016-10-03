
/*global define */

(function () {
    "use strict";

    console.log('ShareCtrl setup');
    define(['angular', 'lib/MLConfig', 'lib/utils'], function (angular, MLConfig, utils) {
        console.log('ShareCtrl define');

        function ShareCtrl($scope) {
            var context = {
                'fullUrl' : ''
            };
            $scope.status = {
                'isCopyMapLinkOpen' : true
            };

            function resizeTextArea() {
                var textarea = document.getElementById('UrlCopyFieldID');
                textarea.value = context.fullUrl;
                textarea.style.height = (textarea.scrollHeight) + 'px';
                console.log('resizeTextArea with : ' + textarea.value);
            }

            function assembleUrl() {
                console.log("gethref : ");
                console.log(MLConfig.gethref());
                var updtUrl = MLConfig.gethref(),
                    $inj = MLConfig.getInjector(),
                    serv = $inj.get('CurrentMapTypeService'),
                    curmapsys = serv.getMapRestUrl(),
                    gmQuery = encodeURIComponent(MLConfig.getQuery()),
                    bnds = MLConfig.getBoundsForUrl();

                if (updtUrl.indexOf('?') < 0) {
                    updtUrl +=  MLConfig.getUpdatedRawUrl();
                }
                console.log("Raw Updated url");
                console.log(updtUrl);
                updtUrl += '&maphost=' + curmapsys;
                updtUrl += '&referrerId=-99';


                if (gmQuery !== '') {
                    updtUrl += "&gmquery=" + gmQuery;
                    updtUrl += bnds;
                }

                return updtUrl;
            }

            $scope.status.isCopyMapLinkOpen = false;

            $scope.safeApply = function (fn) {
                var phase = this.$root.$$phase;
                if (phase === '$apply' || phase === '$digest') {
                    if (fn && (typeof fn === 'function')) {
                        fn();
                    }
                } else {
                    this.$apply(fn);
                }
            };

            $scope.fetchUrl = function () {
                resizeTextArea();
                var urlEl = utils.getElemById("UrlCopyFieldID"),
                    labelDiv = utils.getElemById("UrlInstructions");

                setTimeout(function () {
                    urlEl[0].select();
                    $scope.safeApply();
                }, 50);

                console.log("fetchUrl with : " + context.fullUrl);

                labelDiv.css({"display" : "inline-block"});
                $scope.status.isCopyMapLinkOpen = true;
            };

            $scope.$watch("status.isCopyMapLinkOpen", function (newValue, oldValue) {
                var labelDiv = utils.getElemById("UrlInstructions");

                if ($scope.status.isCopyMapLinkOpen) {
                    context.fullUrl = assembleUrl();

                    console.log("watching status.isCopyMapLinkOpen");
                    console.log(context.fullUrl);
                    console.log('status.isCopyMapLinkOpen is ' + $scope.status.isCopyMapLinkOpen);
                    resizeTextArea();
                } else {
                    $scope.status.isCopyMapLinkOpen = false;
                    labelDiv.css({"display" : "none"});
                }
            });
        }


        function init(App) {
            console.log('ShareCtrl init');
            App.controller('ShareCtrl', ['$scope', ShareCtrl]);
            return ShareCtrl;
        }


        return { start: init };

    });

}());
// }()).call(this);

/*
  Plunker that manages to get textarea updated from change in the scope variable.
 http://plnkr.co/edit/YnXZQm78M9nMqd9uOURz?p=preview
*/
