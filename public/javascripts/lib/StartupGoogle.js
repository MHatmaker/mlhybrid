/*global require */
/*global define */
/*global L */
/*global dojo */
/*global google */
/*global esri */
/*global loading */

// define('google', function () {
    // if (google) {
        // return google;
    // }
    // return {};
// });
/*
var isGoogleLoaded = false,
    isPlacesLoaded = false;
*/
/*
function loadScript(scrpt, loadedTest, callback) {
    "use strict";
    var script = document.createElement('script');
    script.type = 'text/javascript';
    console.log('loadScript before append');
    if (loadedTest === false) {
        console.log("load google api library" + scrpt);

        if (callback) {
            script.onload = callback;
        }

        // script.src = 'https://maps.googleapis.com/maps/api/js?v=3.exp&'  + 'callback=skipScript';
        loadedTest = true;
        document.body.appendChild(script);
        script.src = scrpt + '&callback=' + callback;
        console.log('loadScript after append');
    } else {
        console.log("google api already loaded");
    }
}

function skipScript() {
    "use strict";
    console.log('skipScript');
}

function initPlaces() {
    "use strict";
    console.log('skipScript');
}
*/
// window.onload = loadScript;

(function () {
    "use strict";
    // require(['lib/MapHosterGoogle', 'lib/MLConfig']);

    console.log('StartupGoogle setup');
    define([
        'lib/MapHosterGoogle',
        'controllers/PusherSetupCtrl',
        'lib/MLConfig',
        'lib/utils'
    ], function (MapHosterGoogle, PusherSetupCtrl, MLConfig, utils) {
        console.log('StartupGoogle define');
        var
            gMap = null,
            newSelectedWebMapId = "",
            pusherChannel = null,
            pusher = null;

        // loadScript();
        // console.debug(google);

        function getMap() {
            return gMap;
        }

        function configure(newMapId) {
            var $inj,
                evtSvc,
                centerLatLng,
                initZoom,
                mapOptions = {},
                mpcanhgt,
                qlat,
                qlon,
                bnds,
                zoomStr,
                userName,
                canelem = document.getElementById('map_canvas'),

                openAgoWindow = function (channel, userName) {
                    var url = "?id=" + newSelectedWebMapId + MapHosterGoogle.getGlobalsForUrl() + "&channel=" + channel + "&userName=" + userName;
                    console.log("open new ArcGIS window with URI " + url);
                    console.log("using channel " + channel + " with user name " + userName);
                    MLConfig.setUrl(url);
                    MLConfig.setChannel(channel);
                    MLConfig.userName(userName);
                    window.open(MLConfig.gethref() + "arcgis/" + url, newSelectedWebMapId, MLConfig.getSmallFormDimensions());
                };

            newSelectedWebMapId = newMapId;
            console.log("newSelectedWebMapId " + newMapId);

            window.loading = dojo.byId("loadingImg");
            utils.showLoading();

            if (newSelectedWebMapId !== null) {
                if (MLConfig.isNameChannelAccepted() === false) {
                    $inj = MLConfig.getInjector(); //angular.injector(['app']);
                    evtSvc = $inj.get('PusherEventHandlerService');
                    evtSvc.addEvent('client-MapXtntEvent', MapHosterGoogle.retrievedBounds);
                    evtSvc.addEvent('client-MapClickEvent',  MapHosterGoogle.retrievedClick);

                    PusherSetupCtrl.setupPusherClient(evtSvc.getEventDct(),
                        MLConfig.getUserName(), function (channel, userName) {
                            MLConfig.setUserName(userName);
                            openAgoWindow(channel, userName);
                        });
                } else {
                    userName = MLConfig.getUserName();
                    openAgoWindow(MLConfig.masherChannel(false), userName);
                }
            } else {
                $inj = MLConfig.getInjector(); // angular.injector(['app']);
                evtSvc = $inj.get('PusherEventHandlerService');
                evtSvc.addEvent('client-MapXtntEvent', MapHosterGoogle.retrievedBounds);
                evtSvc.addEvent('client-MapClickEvent',  MapHosterGoogle.retrievedClick);

                console.debug(MLConfig);
                // var centerLatLng = new google.maps.LatLng(41.8, -87.7);
                centerLatLng = new google.maps.LatLng(41.888996, -87.623294);
                initZoom = 15;

                if (MLConfig.testUrlArgs()) {
                    qlat = MLConfig.lat();
                    qlon = MLConfig.lon();
                    centerLatLng = new google.maps.LatLng(qlat, qlon);
                    bnds = MLConfig.getBoundsFromUrl();
                    console.log("getBoundsFromUrl..................");
                    console.debug(bnds);
                    zoomStr = MLConfig.zoom();
                    initZoom = parseInt(zoomStr, 10);
                }

                mpcanhgt = utils.getElemHeight('map_canvas');
                console.log("mpcanhgt before new google.map is " + mpcanhgt);

                mapOptions = {
                    center: centerLatLng, //new google.maps.LatLng(41.8, -87.7),
                    // center: new google.maps.LatLng(51.50, -0.09),
                    zoom: initZoom,
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                };


                // console.log("before first invalidate : " + canelem.clientHeight);
                // invalidateMapWrapper();

                console.log("before map create : " + canelem.clientHeight);
                console.log("create a google map with option: " + mapOptions.mapTypeId);
                gMap = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);

                console.log("before second invalidate : " + canelem.clientHeight);

                // invalidateMapWrapper();
                // canelem = document.getElementById('map_canvas');
                // console.log("after second invalidate : " + canelem.clientHeight);

                // loadScript('https://maps.googleapis.com/maps/api/js?libraries=places', isPlacesLoaded);
                MapHosterGoogle.start();
                MapHosterGoogle.config(gMap, google, google.maps.places);

                pusherChannel = MLConfig.masherChannel(false);
                console.debug(pusherChannel);
                pusher = PusherSetupCtrl.createPusherClient(
                    {
                        'client-MapXtntEvent' : MapHosterGoogle.retrievedBounds,
                        'client-MapClickEvent' : MapHosterGoogle.retrievedClick,
                        'client-NewMapPosition' : MapHosterGoogle.retrievedNewPosition
                    },
                    pusherChannel,
                    MLConfig.getUserName(),
                    function (channel, userName) {
                        MLConfig.setUserName(userName);
                    }
                );
                if (!pusher) {
                    console.log("failed to create Pusher in StartupGoogle");
                }
            }
        }

/*
        function invalidateMapWrapper() {

            var element = 'map_wrapper',
                wrapHgt,
                wrapWdth,
                // cnvsHgt,
                cnvsWdth;
            console.log("MapHosterGoogle map_wrapper : invalidateSize");
            // gMap.invalidateSize(true);
            wrapHgt = utils.getElementDimension(element, 'height') + 1;
            console.log('reset ' + element + ' height to ' + wrapHgt);
            utils.setElementDimension(element, 'height', wrapHgt);

            wrapWdth = utils.getElementDimension(element, 'width');
            console.log('reset ' + element + ' width to ' + wrapWdth);
            utils.setElementDimension(element, 'width', wrapWdth);

            element = 'map_canvas';
            // gMap.invalidateSize(true);
            // cnvsHgt = '100'; // wrapHgt; //utils.getElementDimension(element, 'height') + 1;
            console.log('reset ' + element + ' height to ' + wrapHgt + 'px'); //cnvsHgt + '%');
            utils.setElementDimension(element, 'height', wrapHgt); // cnvsHgt, '%');

            cnvsWdth = utils.getElementDimension(element, 'width');
            console.log('reset ' + element + ' width to ' + cnvsWdth);
            utils.setElementDimension(element, 'width', cnvsWdth);
        }
*/

        function StartupGoogle() {
            console.log('StartupGoogle unused block');
        }

        function init() {
            console.log('StartupGoogle init');
            return StartupGoogle;
        }

        return {
            start: init,
            config : configure,
            getMap : getMap
        };

    });
}());
