/*global dojo */
/*global define */
/*global require */
/*global esri */
/*global deferred */

(function () {
    "use strict";

    var selfDetails = {},
        aMap = null;
    console.log('StartupGArcGIS setup');
    require(['lib/MapHosterArcGIS', 'lib/utils']);

    dojo.require("esri.map");
    dojo.require("dijit.layout.BorderContainer");
    dojo.require("dijit.layout.AccordionContainer");
    dojo.require("dijit.layout.AccordionPane");
    dojo.require("dijit.layout.ContentPane");
    dojo.require("esri.tasks.geometry");
    dojo.require("esri.tasks.locator");
    dojo.require("esri/geometry/webMercatorUtils");
    dojo.require("esri.IdentityManager");
    dojo.require("esri.dijit.Scalebar");
    dojo.require("esri.arcgis.utils");
    dojo.require("dgrid.Grid");
    dojo.require("dgrid/Selection");
    dojo.require("dijit.Dialog");
    dojo.require("dojo.parser");

    define([
        'lib/MapHosterArcGIS',
        'controllers/PusherSetupCtrl',
        'lib/MLConfig',
        'lib/utils',
        'angular',
        'esri/map'
    ], function (MapHosterArcGIS, PusherSetupCtrl, MLConfig, utils) {
        console.log('StartupArcGIS defined');

        var
            configOptions,
            selectedWebMapId = "a4bb8a91ecfb4131aa544eddfbc2f1d0 ", // Requires a space after map ID
            previousSelectedWebMapId = selectedWebMapId,
            zoomWebMap = null,
            pointWebMap = [null, null],
            channel = null,
            pusherChannel = null,
            pusher = null;

        selfDetails.mph = null;

        function getMap() {
            return aMap;
        }

        function showLoading() {
            utils.showLoading();
            aMap.disableMapNavigation();
            aMap.hideZoomSlider();
        }

        function hideLoading(error) {
            utils.hideLoading(error);
            aMap.enableMapNavigation();
            aMap.showZoomSlider();
        }

        function placeCustomControls() {
            var $inj = MLConfig.getInjector(),
                ctrlSvc = $inj.get('MapControllerService'),
                mapCtrl = ctrlSvc.getController();
            mapCtrl.placeCustomControls();
        }

        function setupQueryListener() {
            var $inj = MLConfig.getInjector(),
                ctrlSvc = $inj.get('MapControllerService'),
                mapCtrl = ctrlSvc.getController();
            mapCtrl.setupQueryListener();
        }

        function initUI() {
          //add scalebar or other components like a legend, overview map etc
            // dojo.parser.parse();
            console.debug(aMap);
            var curmph = null,
                $inj,
                mapTypeSvc,
                currentPusher,
                currentChannel;

            /* Scalebar refuses to appear on map.  It appears outside the map on a bordering control.
            var scalebar = new esri.dijit.Scalebar({
                map: aMap,
                scalebarUnit:"english",
                attachTo: "top-left"
            });
             */

            console.log("start MapHoster with center " + pointWebMap[0] + ", " + pointWebMap[1] + ' zoom ' + zoomWebMap);
            console.log("selfDetails.mph : " + selfDetails.mph);
            if (selfDetails.mph === null) {
                console.log("self.Details.mph is null");
                // alert("StartupArcGIS.initUI : selfDetails.mph == null");

                selfDetails.mph = MapHosterArcGIS.start();
                // placeCustomControls();

                MapHosterArcGIS.config(aMap, zoomWebMap, pointWebMap);
                placeCustomControls();
                setupQueryListener();
                // mph = new MapHosterArcGIS(window.map, zoomWebMap, pointWebMap);
                console.log("StartupArcGIS.initUI : selfDetails.mph as initially null and should now be set");
                console.debug(MapHosterArcGIS);
                console.debug(pusherChannel);
                curmph = null;

                $inj = MLConfig.getInjector();
                mapTypeSvc = $inj.get('CurrentMapTypeService');
                curmph = mapTypeSvc.getSelectedMapType();

                pusher = PusherSetupCtrl.createPusherClient(
                    {
                        'client-MapXtntEvent' : MapHosterArcGIS.retrievedBounds,
                        'client-MapClickEvent' : MapHosterArcGIS.retrievedClick,
                        'client-NewMapPosition' : curmph.retrievedNewPosition
                    },
                    pusherChannel,
                    MLConfig.getUserName(),
                    function (callbackChannel, userName) {
                        console.log("callback - don't need to setPusherClient");
                        console.log("It was a side effect of the createPusherClient:PusherClient process");
                        MLConfig.setUserName(userName);
                        // MapHosterArcGIS.prototype.setPusherClient(pusher, callbackChannel);
                    },
                    {'destination' : "destPlaceHolder", 'currentMapHolder' : curmph, 'newWindowId' : "windowIdPlaceholder"}
                );

            } else {
                console.log("self.Details.mph is something or other");
                currentPusher = pusher;
                currentChannel = channel;
                selfDetails.mph = MapHosterArcGIS.start();
                MapHosterArcGIS.config(aMap, zoomWebMap, pointWebMap);

                // mph = new MapHosterArcGIS(window.map, zoomWebMap, pointWebMap);
                console.log("use current pusher - now setPusherClient");
                MapHosterArcGIS.setPusherClient(currentPusher, currentChannel);
                placeCustomControls();  // MOVED TEMPORARILY on 3/15
                setupQueryListener();
            }
        }

        function initializePostProc(newSelectedWebMapId) {
            var urlparams,
                idWebMap,
                $inj,
                mapTypeSvc,
                curmph,
                url,
                lonWebMap,
                latWebMap,
                zmw,
                position,
                mapDeferred;

            window.loading = dojo.byId("loadingImg");  //loading image. id
            console.log("");
            if (newSelectedWebMapId && newSelectedWebMapId !== null) {
                urlparams = dojo.queryToObject(window.location.search);
                console.log(" - urlparams");
                console.log(urlparams);

                // Get the idWebMap from the url if it is present, otherwise return current webmapId
                idWebMap = MLConfig.webmapId(true);

                MLConfig.setMapHost('arcgis');
                $inj = MLConfig.getInjector();
                mapTypeSvc = $inj.get('CurrentMapTypeService');
                mapTypeSvc.setCurrentMapType('arcgis');

                mapTypeSvc.forceAGO();

                /*
                    Force the master site web sub-site to host an AGO webmap.  Prepare to initialize or replace details in the MLConfig with ArcGIS-specific attributes.
                */
                if (idWebMap && idWebMap !== "") {
                    if (idWebMap !== newSelectedWebMapId) {
                        /*
                        idWebMap should have been initiated through a replace current map selection
                        in the AGO group/map search process.
                         */
                        curmph = MapHosterArcGIS;
                        selectedWebMapId = newSelectedWebMapId;
                        MLConfig.setWebmapId(selectedWebMapId);
                        url = "?id=" + newSelectedWebMapId + curmph.getGlobalsForUrl() + "&channel=" + channel;
                        console.log("initialize or replace map in current window with URI " + url);
                        console.log("using channel " + channel);
                        // set up config in the event that this map environment might be published.
                        MLConfig.setUrl(url);
                    } else {
                        console.log("selectedWebMapId == newSelectedWebMapId " + newSelectedWebMapId);
                        selectedWebMapId = idWebMap;
                        MLConfig.setWebmapId(selectedWebMapId);
                    }

                    /*
                    These accessors only return values from checking the url.  If it doesn't find them,
                    the value should be an empty string
                    */
                    lonWebMap = MLConfig.lon();
                    latWebMap = MLConfig.lat();
                    zmw = MLConfig.zoom();
                    pusherChannel = MLConfig.masherChannel(true);

                    // alert(" - pusherChannel = " + pusherChannel);
                    console.log("initializePostProc - pusherChannel = " + pusherChannel);
                    // MLConfig.setUrl(url);

                    if (lonWebMap && latWebMap && zoomWebMap) {
                        /*
                        zoomWebMap would only be non-null if the ArcGIS map system was invoked through
                        the GUI in a "Show the map" selection.
                        */
                        zoomWebMap =  zmw;
                        console.log("zoomWebMap from URI " + zoomWebMap);
                        pointWebMap = [lonWebMap, latWebMap];
                        console.log(pointWebMap);
                    }
                } else {
                    selectedWebMapId = newSelectedWebMapId;
                    lonWebMap = MLConfig.lon();
                    latWebMap = MLConfig.lat();
                    zmw = MLConfig.zoom();
                    pusherChannel = MLConfig.masherChannel(false);
                    curmph = MapHosterArcGIS;
                    url = "?id=" + newSelectedWebMapId + curmph.getGlobalsForUrl() + "&channel=" + channel;
                    console.log("replace map in current window with URI " + url);
                    console.log("using channel " + channel);
                    MLConfig.setUrl(url);
                    position = curmph.getGlobalPositionComponents();
                    MLConfig.setPosition(position);
                    MLConfig.setWebmapId(newSelectedWebMapId);
                    MLConfig.showConfigDetails('StartupArcGIS : initializePostProc - original initialization or replace map');
                }
            }
            console.debug("initializePostProc proceeding with " + selectedWebMapId);
            //This service is for development and testing purposes only. We recommend that you create your own geometry service for use within your applications.
            esri.config.defaults.geometryService =
                new esri.tasks.GeometryService("http://tasks.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer");

            //specify any default settings for your map
            //for example a bing maps key or a default web map id
            configOptions = {
                // webmap: '4b99c1fb712d4fe694805717df5fadf2', // selectedWebMapId,
                webmap: selectedWebMapId,
                title: "",
                subtitle: "",
                //arcgis.com sharing url is used modify this if yours is different
                sharingurl: "http://arcgis.com/sharing/content/items",
                //enter the bing maps key for your organization if you want to display bing maps
                bingMapsKey: "/*Please enter your own Bing Map key*/"
            };

            esri.arcgis.utils.arcgisUrl = configOptions.sharingurl;
            esri.config.defaults.io.proxyUrl = "/arcgisserver/apis/javascript/proxy/proxy.ashx";

            //create the map using the web map id specified using configOptions or via the url parameter
            // var cpn = new dijit.layout.ContentPane({}, "map_canvas").startup();

            // dijit.byId("map_canvas").addChild(cpn).placeAt("map_canvas").startup();

            try {
                mapDeferred = esri.arcgis.utils.createMap(configOptions.webmap, "map_canvas", {
                    mapOptions: {
                        slider: true,
                        nav: false,
                        wrapAround180: true

                    },
                    ignorePopups: false,
                    bingMapsKey: configOptions.bingMapsKey,
                    geometryServiceURL: "http://tasks.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer"

                });
            } catch (err) {
                console.log(err.message);
                alert(err.message);
            } finally {
                console.log("finally???????????????");
                //alert("why are we in finally?");
            }

            console.log("set up mapDeferred anonymous method");
            try {
                mapDeferred.then(function (response) {
                    console.log("mapDeferred.then");
                    if (previousSelectedWebMapId !== selectedWebMapId) {
                        previousSelectedWebMapId = selectedWebMapId;
                        //dojo.destroy(map.container);
                    }
                    if (aMap) {
                        aMap.destroy();
                    }
                    aMap = response.map;
                    console.log("in mapDeferred anonymous method");
                    console.log("configOptions title " + configOptions.title);
                    console.debug("ItemInfo object " + response.itemInfo);
                    console.log("ItemInfo.item object " + response.itemInfo.item);
                    console.log("response title " + response.itemInfo.item.title);
                    dojo.connect(aMap, "onUpdateStart", showLoading);
                    dojo.connect(aMap, "onUpdateEnd", hideLoading);
                    dojo.connect(aMap, "onLoad", initUI);

                    setTimeout(function () {
                        if (aMap.loaded) {
                            initUI();
                        } else {
                            dojo.connect(aMap, "onLoad", initUI);
                        }
                    }, 300);
                }, function (error) {
                    // alert("Create Map Failed ");
                    console.log('Create Map Failed: ' + dojo.toJson(error));
                    console.log("Error: ", error.code, " Message: ", error.message);
                    deferred.cancel();
                });
            } catch (err) {
                console.log("deferred failed with err " + err.message);
            }
        }

        function prepareWindow(newSelectedWebMapId, referringMph, displayDestination) {

            var curmph = MapHosterArcGIS,
                $inj,
                mapTypeSvc,
                evtSvc,
                url,
                baseUrl,
                openNewDisplay;

            $inj = MLConfig.getInjector();
            mapTypeSvc = $inj.get('CurrentMapTypeService');
            curmph = mapTypeSvc.getSelectedMapType();

            evtSvc = $inj.get('PusherEventHandlerService');
            evtSvc.addEvent('client-MapXtntEvent', curmph.retrievedBounds);
            evtSvc.addEvent('client-MapClickEvent', curmph.retrievedClick);

            openNewDisplay = function (channel, userName) {
                url = "?id=" + newSelectedWebMapId + curmph.getGlobalsForUrl() +
                    "&channel=" + channel + "&userName=" + userName +
                    "&maphost=ArcGIS" + "&referrerId=" + MLConfig.getUserId();
                if (referringMph) {
                    url = "?id=" + newSelectedWebMapId + referringMph.getGlobalsForUrl() +
                        "&channel=" + channel + "&userName=" + userName +
                        "&maphost=ArcGIS" + "&referrerId=" + MLConfig.getUserId();
                }

                console.log("open new ArcGIS window with URI " + url);
                console.log("using channel " + channel + "with userName " + userName);
                MLConfig.setUrl(url);
                MLConfig.setUserName(userName);
                if (displayDestination === 'New Pop-up Window') {
                    baseUrl = MLConfig.getbaseurl();
                    window.open(baseUrl + "/arcgis/" + url, newSelectedWebMapId, MLConfig.getSmallFormDimensions());
                } else {
                    baseUrl = MLConfig.getbaseurl();
                    window.open(baseUrl + "arcgis/" + url, '_blank');
                    window.focus();
                }
            };

            if (MLConfig.isNameChannelAccepted() === false) {
                PusherSetupCtrl.setupPusherClient(evtSvc.getEventDct(),
                    MLConfig.getUserName(), openNewDisplay,
                        {'destination' : displayDestination, 'currentMapHolder' : curmph, 'newWindowId' : newSelectedWebMapId});
            } else {
                openNewDisplay(MLConfig.masherChannel(false), MLConfig.getUserName());
            }
        }

        function initialize(newSelectedWebMapId, destDetails, selectedMapTitle, referringMph) {
            var curmph = MapHosterArcGIS,
                displayDestination = destDetails.dstSel,
                $inj,
                evtSvc,
                CurrentMapTypeService;
            /*
            This branch should only be encountered after a DestinationSelectorEvent in the AGO group/map search process.  The user desires to open a new popup or tab related to the current map view, without yet publishing the new map environment.
             */
            if (displayDestination === 'New Pop-up Window' || displayDestination === 'New Tab') {
                prepareWindow(newSelectedWebMapId, referringMph, displayDestination);
            } else {
                /*
                This branch handles a new ArcGIS Online webmap presentation from either selecting the ArcGIS tab in the master
                site or opening the webmap from a url sent through a publish event.
                 */
                $inj = MLConfig.getInjector();
                evtSvc = $inj.get('PusherEventHandlerService');
                CurrentMapTypeService = $inj.get('CurrentMapTypeService');
                CurrentMapTypeService.setCurrentMapType('arcgis');
                evtSvc.addEvent('client-MapXtntEvent', curmph.retrievedBounds);
                evtSvc.addEvent('client-MapClickEvent',  curmph.retrievedClick);

                initializePostProc(newSelectedWebMapId);
            }
        }

        function initializePreProc() {
            console.log('initializePreProc entered');
            // var urlparams=dojo.queryToObject(window.location.search);
            // console.debug(urlparams);
            // var idWebMap=urlparams['?id'];
            var idWebMap = MLConfig.webmapId(true),
                llon,
                llat;

            console.debug(idWebMap);
            // initUI();
            if (!idWebMap) {
                console.log("no idWebMap");
                selectedWebMapId = "a4bb8a91ecfb4131aa544eddfbc2f1d0 "; //"e68ab88371e145198215a792c2d3c794";
                MLConfig.setWebmapId(selectedWebMapId);
                console.log("use " + selectedWebMapId);
                // pointWebMap = [-87.7, lat=41.8];
                pointWebMap = [-87.620692, 41.888941];
                zoomWebMap = 15;
                initialize(selectedWebMapId, '', '');
            } else {
                console.log("found idWebMap");
                console.log("use " + idWebMap);
                zoomWebMap = MLConfig.zoom();
                llon = MLConfig.lon();
                llat = MLConfig.lat();
                pointWebMap = [llon, llat];
                initialize(idWebMap, '', '');
            }
        }


        function StartupArcGIS() {
            console.log("nothing happening yet in StartupArcGIS function");
        }

        function init() {
            console.log('StartupArcGIS init');
            return StartupArcGIS;
        }

        return {
            start: init,
            config : initializePreProc,
            getMap: getMap,
            replaceWebMap : initialize,
            prepareWindow: prepareWindow
        };

    });

}());
