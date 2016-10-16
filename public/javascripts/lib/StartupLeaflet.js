/*global require*/
/*global define*/
/*global L*/
/*global dojo*/
/*global google*/

(function () {
    "use strict";
    // require(['lib/MapHosterLeaflet']);

    console.log('StartupLeaflet setup');
    define([
        'lib/MapHosterLeaflet',
        'controllers/PusherSetupCtrl',
        'lib/MLConfig'
    ], function (MapHosterLeaflet, PusherSetupCtrl, MLConfig) {
        console.log('StartupLeaflet define');
        var
            lMap,
            // mph = null,
            newSelectedWebMapId = "",
            pusher = null,
            pusherChannel = null;

        function getMap() {
            return lMap;
        }

        function openAGOWindow(channel, userName) {
            var url = "?id=" + newSelectedWebMapId + MapHosterLeaflet.getGlobalsForUrl() + "&channel=" + channel + "&userName=" + userName;
            console.log("open new ArcGIS window with URI " + url);
            console.log("using channel " + channel + " with user name " + userName);
            MLConfig.setUrl(url);
            MLConfig.setChannel(channel);
            MLConfig.userName(userName);
            window.open(MLConfig.gethref() + "arcgis/" + url, newSelectedWebMapId, MLConfig.getSmallFormDimensions());
        }

        function configure(newMapId) {
            var $inj = MLConfig.getInjector(),
                evtSvc = $inj.get('PusherEventHandlerService');
            newSelectedWebMapId = newMapId;
            window.loading = dojo.byId("loadingImg");
            console.log(window.loading);
            console.log("newSelectedWebMapId " + newMapId);
            if (newSelectedWebMapId !== null) {
                if (MLConfig.isChannelInitialized() === false) {
                    evtSvc.addEvent('client-MapXtntEvent', MapHosterLeaflet.retrievedBounds);
                    evtSvc.addEvent('client-MapClickEvent',  MapHosterLeaflet.retrievedClick);

                    // PusherSetupCtrl.setupPusherClient(evtSvc.getEventDct(),
                    //     MLConfig.getUserName(), openNewDisplay,
                    //         {'destination' : displayDestination, 'currentMapHolder' : curmph, 'newWindowId' : newSelectedWebMapId});

                    PusherSetupCtrl.setupPusherClient(evtSvc.getEventDct(),
                        MLConfig.getUserName(), function (channel, userName) {
                            MLConfig.setUserName(userName), openNewDisplay,
                                {'destination' : displayDestination, 'currentMapHolder' : curmph, 'newWindowId' : newSelectedWebMapId};
                            openAGOWindow(channel, userName);
                        });
                } else {
                    openAGOWindow(MLConfig.masherChannel(false));
                }
            } else {
                evtSvc.addEvent('client-MapXtntEvent', MapHosterLeaflet.retrievedBounds);
                evtSvc.addEvent('client-MapClickEvent',  MapHosterLeaflet.retrievedClick);

                // lMap = new L.Map('map_canvas', {loadingControl: true}); //.setView([41.8, -87.7], 13);
                if (lMap) {
                    // lMap.remove();
                    lMap = new L.Map('map_canvas');
                } else {
                    lMap = new L.Map('map_canvas');
                }

                MapHosterLeaflet.start();
                MapHosterLeaflet.config(lMap);

                pusherChannel = MLConfig.masherChannel(false);
                console.debug(pusherChannel);
                pusher = PusherSetupCtrl.createPusherClient(
                    {
                        'client-MapXtntEvent' : MapHosterLeaflet.retrievedBounds,
                        'client-MapClickEvent' : MapHosterLeaflet.retrievedClick,
                        'client-NewMapPosition' : MapHosterLeaflet.retrievedNewPosition
                    },
                    pusherChannel,
                    MLConfig.getUserName(),
                    function (channel, userName) {
                        MLConfig.setUserName(userName);
                    },
                    null
                    // {'destination' : displayDestination, 'currentMapHolder' : curmph, 'newWindowId' : newSelectedWebMapId}
                );
                if (!pusher) {
                    console.log("createPusherClient failed in StartupLeaflet");
                }
            }
        }

        function StartupLeaflet() {
            console.log("StartupLeaflet unused block");
        }

        function init() {
            console.log('StartupLeaflet init');
            return StartupLeaflet;
        }

        return {
            start: init,
            config : configure,
            getMap: getMap
        };

    });
}());
