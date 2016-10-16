/*global console, angular, require, alert, define, esri, document, dojo, esriPortal*/


(function () {
    'use strict';

    console.log("in MapLinkrApp");

    var locationPath = "/";

    define('angular', function () {
        if (angular) {
            return angular;
        }
        return {};
    });

    require({
        async: true,
        packages: [
            {
                name: 'controllers',
                location: locationPath + 'js/controllers'
            },
            {
                name: 'lib',
                location: locationPath + 'js/lib'
            },
            {
                name: 'js',
                location: locationPath + 'js'
            }
        ]
    });

    require([
        "dojo",
        "dojo/domReady",
        "esri/arcgis/Portal",
        'lib/MLConfig',
        'js/bootstrap'
    ], function (dojo, dojodomReady, esriPortal, MLConfig, bootstrap) {
        // alert('in MapLinkrApp, require bootstrap');

        // document.body.onload = function () {
        // window.onload = function () {
        //     console.log("window loaded, now bootstrap");
        // bootstrap.start();
        // }
      // $(document).ready(function() {
      //   var tHithere = "Hi there. It's now $time";
      //   $('body').append(template.render(tHithere, {time: new Date()}));
      // });

        dojodomReady(function () {
            var
                portalUrl = document.location.protocol + '//www.arcgis.com',
                portalForSearch = new esri.arcgis.Portal(portalUrl);
            console.info('start the bootstrapper');
            bootstrap.start(portalForSearch);
        });
    });
}());
