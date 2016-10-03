/*global require,
    define,
    L,
    esri,
    loading
*/

(function () {
    "use strict";
    console.log("ready to require stuff in MapHosterGoogle");
    require(["lib/utils", 'angular']);
    // require(["lib/utils", 'angular', 'controllers/MapCtrl']);

    define([
        'angular',
        'controllers/PositionViewCtrl',
        'lib/utils',
        'lib/MLConfig',
        'controllers/PusherSetupCtrl',
        'controllers/LocateSelfCtrl',
    ], function (angular, PositionViewCtrl, utils, MLConfig, PusherSetupCtrl, LocateSelfCtrl) {

        var
            hostName = "MapHosterGoogle",
            mphmap,
            google,
            mapReady = true,
            scale2Level = [],
            zoomLevels = 0,
            minZoom = 0,
            maxZoom,
            zmG,
            cntrxG,
            cntryG,
            // bounds,
            // channel,
            userZoom = true,
            geoCoder = null,
            searchBox = null,
            searchInput = null,
            searchFiredFromUrl = false,

            selfPusherDetails = {
                channel : null,
                pusher : null
            },
            popDetails = null,
            // selfMethods = {},
            queryPlaces = {
                location: null,
                bounds: null,
                query: 'what do you want?'
            },
            placesFromSearch = [],
            markers = [];

        // MLConfig.showConfigDetails('MapHosterGoogle - startup');
        function updateGlobals(msg, cntrx, cntry, zm) {
            console.log("updateGlobals ");
            var gmBounds = mphmap.getBounds(),
                mapLinkrBounds = {},
                ne,
                sw;
            if (gmBounds) {
                ne = gmBounds.getNorthEast();
                sw = gmBounds.getSouthWest();
                // bounds = gmBounds;
                mapLinkrBounds.llx = gmBounds.xmin = sw.lng();
                mapLinkrBounds.lly = gmBounds.ymin = sw.lat();
                mapLinkrBounds.urx = gmBounds.xmax = ne.lng();
                mapLinkrBounds.ury = gmBounds.ymax = ne.lat();
            }
            zmG = zm;
            cntrxG = cntrx;
            cntryG = cntry;
            console.log("Updated Globals " + msg + " " + cntrxG + ", " + cntryG + " : " + zmG);
            PositionViewCtrl.update('zm', {
                'zm' : zmG,
                'scl' : scale2Level.length > 0 ? scale2Level[zmG].scale : 3,
                'cntrlng' : cntrxG,
                'cntrlat': cntryG,
                'evlng' : cntrxG,
                'evlat' : cntryG
            });
            MLConfig.setPosition({'lon' : cntrxG, 'lat' : cntryG, 'zoom' : zmG});
            MLConfig.setBounds(mapLinkrBounds);
        }

        function showGlobals(cntxt) {
            console.log(cntxt + " Globals : lon " + cntrxG + " lat " + cntryG + " zoom " + zmG);
        }

        function collectScales(levels) {
            scale2Level = [];
            var sc2lv = scale2Level,
            // var topLevel = ++levels;
                topLevel = levels + 2,
                scale = 1128.497220,
                i,
                obj;
            for (i = topLevel; i > 0; i--) {
                obj = {"scale" : scale, "level" : i};
                scale = scale * 2;
                // console.log("scale " + obj.scale + " level " + obj.level);
                sc2lv.push(obj);
            }
        }

        function markerInfoPopup(pos, content, title, mrkr) {
            var popId = "id" + title,
                shareBtnId = "idShare" + title,
                contentString = '<div id="content">' +
                    '<h4 id="' + popId + '" style="color:forestgreen">' + title + '</h4>' +
                    '<div id="bodyContent" style="color:darkmagenta">' +
                    content + '<br><button class="sharebutton btn-primary" id="' + shareBtnId + '" >Share</button>' +
                    '</div>' +
                    '</div>',


                infowindow = new google.maps.InfoWindow({
                    content: contentString
                }),

                marker = mrkr || new google.maps.Marker({
                    position: pos,
                    map: mphmap,
                    title: title
                }),

                showSomething = function () {
                    if (selfPusherDetails.pusher) {
                        var fixedLL = utils.toFixed(marker.position.lng(), marker.position.lat(), 6),
                            referrerId = MLConfig.getUserId(),
                            referrerName = MLConfig.getUserName(),
                            pushLL = {"x" : fixedLL.lon, "y" : fixedLL.lat, "z" : "0",
                                "referrerId" : referrerId, "referrerName" : referrerName,
                                'address' : marker.address, 'title' : marker.title };
                        console.log("You, " + referrerName + ", " + referrerId + ", clicked the map at " + fixedLL.lat + ", " + fixedLL.lon);
                        selfPusherDetails.pusher.channel(selfPusherDetails.channel).trigger('client-MapClickEvent', pushLL);
                    }
                };

            google.maps.event.addListener(marker, 'click', function () {
                var btnShare;
                    // referrerId,
                    // usrId;
                infowindow.setContent(contentString);
                infowindow.open(mphmap, this);

                btnShare = document.getElementById(shareBtnId);
                // referrerId = MLConfig.getReferrerId();
                // usrId = MLConfig.getUserId();
                // if (referrerId && referrerId != usrId) {
                    // if (btnShare) {
                    //     console.debug(btnShare);
                    //     btnShare.style.visibility = 'hidden';
                    // }
                // }
                btnShare.onclick = function () {
                    showSomething();
                };
            });
            return { "infoWnd" : infowindow, "infoMarker" : marker};
        }

        function placeMarkers(places) {
            var boundsForMarkers,
                image,
                marker,
                place,
                i;
            for (i = 0; i < markers.length; i++) {
                marker = markers[i];
                if (marker) {
                    marker.setMap(null);
                }
            }

            // For each place, get the icon, place name, and location.
            markers = [];
            boundsForMarkers = new google.maps.LatLngBounds();
            for (i = 0; i < places.length; i++) {
                place = places[i];
                if (place) {
                    image = {
                        url: place.icon,
                        size: new google.maps.Size(71, 71),
                        origin: new google.maps.Point(0, 0),
                        anchor: new google.maps.Point(17, 34),
                        scaledSize: new google.maps.Size(25, 25)
                    };

                  // Create a marker for each place.
                    marker = new google.maps.Marker({
                        map: mphmap,
                        icon: image,
                        title: place.name,
                        address : place.formatted_address,
                        position: place.geometry.location
                    });

                    markers.push(marker);
                    markerInfoPopup(place.geometry.location, marker.address, marker.title, marker);

                    boundsForMarkers.extend(place.geometry.location);
                }
            }
        }

        function placesQueryCallback(results, status) {
            console.log('status is ' + status);
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                if (results && results.length > 0) {
                    console.log('PlacesService returned ' + results.length);
                    placeMarkers(results);
                } else {
                    console.log('placesService() returned no results');
                }
            }
        }


        function addInitialSymbols() {
            var popPt = new google.maps.LatLng(41.890283, -87.625842),
                hint = "Lofty Thoughts";
            markerInfoPopup(popPt, "Creativity is inspired by collapsing ceilings and rubble walls.", hint);
            popPt = new google.maps.LatLng(41.888941, -87.620692);
            hint = "Drafty Sweatbox";
            markerInfoPopup(popPt, "Climate control as nature intended.", hint);
            popPt = new google.maps.LatLng(41.884979, -87.620950);
            hint = "Blank Wall Vistas";
            markerInfoPopup(popPt, "Panorama views are over-rated if you prefer exposed brick.", hint);
            // this.polygon([
                // [51.509, -0.08],
                // [51.503, -0.06],
                // [51.51, -0.047]
            // ]);
            // this.circle([51.508, -0.11], 500);
        }

        function formatBounds(b) {
            var s = String.format("ll : {0}, {1}, ru : {2}, {3}",
                                b.getSouthWest().lng(), b.getSouthWest().lat(),
                                b.getNorthEast().lng(), b.getNorthEast().lat());
            return s;
        }

        function extractBounds(action) {
            var zm = mphmap.getZoom(),
                cntr = mphmap.getCenter(),
                fixedLL = utils.toFixed(cntr.lng(), cntr.lat(), 6),
                bnds = mphmap.getBounds(),
                xtntDict = {
                    'src' : 'google',
                    'zoom' : zm,
                    'lon' : fixedLL.lon,
                    'lat' : fixedLL.lat,
                    'scale': scale2Level[zm].scale,
                    'action': action,
                    'bounds': bnds
                };
            return xtntDict;
        }

        function compareExtents(msg, xtnt) {
            var cmp = true,
                gmBounds = mphmap.getBounds(),
                ne,
                sw,
                wdth,
                hgt,
                lonDif,
                latDif;

            if (gmBounds) {
                ne = gmBounds.getNorthEast();
                sw = gmBounds.getSouthWest();
                cmp = xtnt.zoom === zmG;
                wdth = Math.abs(ne.lng() - sw.lng());
                hgt = Math.abs(ne.lat() - sw.lat());
                lonDif = Math.abs((xtnt.lon - cntrxG) / wdth);
                latDif =  Math.abs((xtnt.lat - cntryG) / hgt);
                // cmp = ((cmp == true) && (xtnt.lon == cntrxG) && (xtnt.lat == cntryG));
                cmp = ((cmp === true) && (lonDif < 0.0005) && (latDif < 0.0005));
                console.log("compareExtents " + msg + " " + cmp);
            }
            return cmp;
        }

        function setBounds(action) {
            if (mapReady === true) {
                // runs this code after you finishing the zoom
                var xtExt = extractBounds(action),
                    xtntJsonStr = JSON.stringify(xtExt),
                    cmp,
                    service,
                    qtext,
                    gBnds;
                console.log("extracted bounds " + xtntJsonStr);
                cmp = compareExtents("setBounds", xtExt);
                if (cmp === false) {
                    console.log("MapHoster setBounds pusher send to channel " + selfPusherDetails.channel);
                    if (selfPusherDetails.pusher) {
                        selfPusherDetails.pusher.channel(selfPusherDetails.channel).trigger('client-MapXtntEvent', xtExt);
                    }
                    updateGlobals("setBounds with cmp false", xtExt.lon, xtExt.lat, xtExt.zoom);

                    gBnds = mphmap.getBounds();
                    console.debug(gBnds);
                    // ll = new google.maps.LatLng(bnds.lly, bnds.llx);
                    // ur = new google.maps.LatLng(bnds.ury, bnds.urx);
                    // gBnds = new google.maps.LatLngBounds(ll, ur);
                    qtext = MLConfig.getQuery();
                    if (qtext && qtext !== "") {
                        queryPlaces.bounds = gBnds;
                        queryPlaces.query = qtext;
                        queryPlaces.location = mphmap.getCenter();
                        service = new google.maps.places.PlacesService(mphmap);
                        service.textSearch(queryPlaces, placesQueryCallback);
                    }
                }
            }
        }

        function hideLoading(error) {
            console.log("hide loading");
            esri.hide(loading);
        }

        function configureMap(gMap, goooogle, googPlaces) {
            mphmap = gMap;
            google = goooogle;
            geoCoder = new google.maps.Geocoder();
            var
                firstCntr,
                qlat,
                qlon,
                qzoom,
                initZoom = 15,
                listener;

            if (MLConfig.testUrlArgs()) {
                qlat = MLConfig.lat();
                qlon = MLConfig.lon();
                qzoom = MLConfig.zoom();
                initZoom = parseInt(qzoom, 10);
                updateGlobals("init with qlon, qlat", qlon, qlat, qzoom);
            } else {
                updateGlobals("init with hard-coded values", -87.623294, 41.888996,  13);
            }
            firstCntr = new google.maps.LatLng(cntryG, cntrxG);
            mphmap.panTo(firstCntr);
            mphmap.setCenter(firstCntr);
            LocateSelfCtrl.setMap(goooogle, mphmap);

            // updateGlobals("init", -0.09, 51.50, 13, 0.0);
            showGlobals("Prior to new Map");
            // google.maps.event.addListener(mphmap, 'end', gotDragEnd);

            // Maybe it will work at this point!!!

            minZoom = maxZoom = zoomLevels = 0;

            maxZoom = 21;
            zoomLevels = maxZoom - minZoom;
            collectScales(zoomLevels);
            MLConfig.showConfigDetails('MapHosterGoogle - after collectScales');
            showGlobals("after collectScales");
            mphmap.setZoom(initZoom);
            /*

            google.maps.event.addListenerOnce(gMap, 'zoom_changed', function() {
                var oldZoom = gMap.getZoom();
                gMap.setZoom(oldZoom - 1); //Or whatever
            });
            */

            function placeCustomControls() {
                var $inj = MLConfig.getInjector(),
                    ctrlSvc = $inj.get('MapControllerService'),
                    mapCtrl = ctrlSvc.getController();
                setTimeout(function () {
                    mapCtrl.placeCustomControls();
                }, 500);
            }

            function setupQueryListener() {
                var $inj = MLConfig.getInjector(),
                    ctrlSvc = $inj.get('MapControllerService'),
                    mapCtrl = ctrlSvc.getController();
                mapCtrl.setupQueryListener();
            }

            google.maps.event.addListenerOnce(mphmap, 'tilesloaded', function () {
                var zsvc = new google.maps.MaxZoomService(),
                    cntr = new google.maps.LatLng(cntryG, cntrxG), // {lat: cntryG, lng: cntrxG}, //
                    center,
                    gmQuery = MLConfig.query(),
                    bnds,
                    gBnds,
                    ll,
                    ur,
                    pacnpt,
                    qtext,
                    service;
                console.log(">>>>>>>>>>>>>> tiles loaded >>>>>>>>>>>>>>>>>>>>");

                hideLoading();
                mapReady = true;
                center = mphmap.getCenter();
                // google.maps.event.trigger(mphmap, 'resize');
                // mphmap.setCenter(center);
                addInitialSymbols();
                // google.maps.event.trigger(mphmap, 'resize');
                // mphmap.setCenter(center);
                gmQuery = MLConfig.query();
                console.log("getMaxZoomAtLatLng for " + cntr.lng + ", " + cntr.lat);

                zsvc.getMaxZoomAtLatLng(cntr, function (response) {
                    console.log("zsvc.getMaxZoomAtLatLng returned response:");
                    console.debug(response);
                    if (response && response.status === google.maps.MaxZoomStatus.OK) {
                        maxZoom = response.zoom;
                        zoomLevels = maxZoom - minZoom;
                        collectScales(zoomLevels);
                        // MLConfig.showConfigDetails('MapHosterGoogle zsvc.getMaxZoomAtLatLng - after collectScales');
                        showGlobals("after zsvc.getMaxZoomAtLatLng collectScales");
                    } else {
                        if (response) {
                            // alert("getMaxZoomAtLatLng service returned status other than OK");
                            console.log("getMaxZoomAtLatLng service returned status other than OK");
                            console.log(response.status);
                        } else {
                            alert("getMaxZoomAtLatLng service returned null");
                        }

                    }
                });

                console.log('gmQuery contains ' + gmQuery);
                if (gmQuery !== '') {
                    searchFiredFromUrl = true;
                    MLConfig.setQuery(gmQuery);
                }
                if (searchFiredFromUrl === true) {
                    console.log("getBoundsFromUrl.......in MapHosterGoogle 'places_changed' listener");
                    bnds = MLConfig.getBoundsFromUrl();
                    console.debug(bnds);
                    ll = new google.maps.LatLng(bnds.lly, bnds.llx);
                    ur = new google.maps.LatLng(bnds.ury, bnds.urx);
                    gBnds = new google.maps.LatLngBounds(ll, ur);
                    searchFiredFromUrl = false;

                    qtext = MLConfig.query();

                    pacnpt = $('#pac-input');
                    pacnpt.value = qtext;
                    // pacnpt.focus();
                    queryPlaces.bounds = gBnds;
                    queryPlaces.query = qtext;
                    queryPlaces.location = center;
                    service = new google.maps.places.PlacesService(mphmap);
                    service.textSearch(queryPlaces, placesQueryCallback);
                }

                placeCustomControls();
                // setupQueryListener();
            });

            setupQueryListener();
            // var bndsInit = createBounds();
            // mphmap.fitBounds(bndsInit);
            listener = google.maps.event.addListener(mphmap, "idle", function () {
                console.log("Entering idle listener");
                // var center = mphmap.getCenter();
                var idleFirstCntr = new google.maps.LatLng(cntryG, cntrxG);
                mphmap.setCenter(idleFirstCntr);
                // mphmap.setZoom(12);
                mphmap.setZoom(initZoom);
                console.log("bounds in idle");
                console.debug(mphmap.getBounds());
                google.maps.event.removeListener(listener);
            });

            searchInput = /** @type {HTMLInputElement} */ (document.getElementById('pac-input'));
            mphmap.controls[google.maps.ControlPosition.TOP_LEFT].push(searchInput);
            searchInput.value = '';
            // searchBox = new gplaces.SearchBox(/** @type {HTMLInputElement} */
            //     (searchInput));
            // searchBox = MapCtrl.getSearchBox();

            // Bias the SearchBox results towards places that are within the bounds of the
            // current map's viewport.
            google.maps.event.addListener(mphmap, 'bounds_changed', function () {
                var changedBounds = mphmap.getBounds(),
                    convertedBounds;
                // console.debug(changedBounds);
                if (searchBox) {
                    searchBox.setBounds(changedBounds);
                }
                convertedBounds = {'llx' : changedBounds.getSouthWest().lng(), 'lly' : changedBounds.getSouthWest().lat(),
                             'urx' : changedBounds.getNorthEast().lng(), 'ury' : changedBounds.getNorthEast().lat()};
                MLConfig.setBounds(convertedBounds);
            });

            google.maps.event.addListener(mphmap, 'dragend', function () {
                console.log("DRAG END");
                if (userZoom === true) {
                    setBounds('pan');
                }
            });
            google.maps.event.addListener(mphmap, "zoom_changed", function () {
                if (userZoom === true) {
                    if (scale2Level.length > 0) {
                        setBounds('zoom', null);
                    }
                // userZoom = true;
                }
            });

            function gotResize() {
                console.log("resize event hit in MapHosterGoogle");
                                // mphmap.setZoom(20);
                                // mphmap.setZoom(13);
                var center = mphmap.getCenter();
                google.maps.event.trigger(mphmap, "resize");
                mphmap.setCenter(center);
                console.log(mphmap.getBounds());
            }

            // google.maps.event.addListener(mphmap, 'resize', gotResize); //function() {
                // console.log("resize event hit");
                // console.log(mphmap.getBounds());
            // });

            google.maps.event.addDomListener(window, 'resize', function () {
                gotResize();
                // console.log("resize event hit");
                // console.log(mphmap.getBounds());
            });

            google.maps.event.addListener(mphmap, "mousemove", function (e) {
                var ltln = e.latLng,
                    fixedLL = utils.toFixed(ltln.lng(), ltln.lat(), 4),
                    evlng = fixedLL.lon,
                    evlat = fixedLL.lat,
                    zm = mphmap.getZoom(),
                    cntr = mphmap.getCenter(),
                    fixedCntrLL = utils.toFixed(cntr.lng(), cntr.lat(), 4),
                    cntrlng = fixedCntrLL.lon,
                    cntrlat = fixedCntrLL.lat;

                if (scale2Level.length > 0) {
                    // var view = "Zoom : " + zm + " Scale : " + scale2Level[zm].scale + " Center : " + cntrlng + ", " + cntrlat + " Current : " + evlng + ", " + evlat;
                    // document.getElementById("mppos").value = view;
                    PositionViewCtrl.update('coords',
                        {
                            'zm' : zm,
                            'scl' : scale2Level[zm].scale,
                            'cntrlng' : cntrlng,
                            'cntrlat': cntrlat,
                            'evlng' : evlng,
                            'evlat' : evlat
                        });
                }
            });

            function showClickResult(content, popPt, marker) {
                if (popDetails !== null) {
                    popDetails.infoWnd.close();
                    popDetails.infoMarker.setMap(null);
                }
                popDetails = markerInfoPopup(popPt, content, "Ready to Push Click", marker);
                // popDetails.infoWnd.open(mphmap, popDetails.infoMarker);
                // if (selfPusherDetails.pusher)
                // {
                    // var fixedLL = utils.toFixed(popPt.lng(), popPt.lat(), 6);
                    // var referrerId = MLConfig.getUserId();
                    // var referrerName = MLConfig.getUserName();
                    // var pushLL = {"x" : fixedLL.lon, "y" : fixedLL.lat, "z" : "0",
                        // "referrerId" : referrerId, "referrerName" : referrerName };
                    // console.log("You, " + referrerName + ", " + referrerId + ", clicked the map at " + fixedLL.lat + ", " + fixedLL.lon);
                    // selfPusherDetails.pusher.channel(selfPusherDetails.channel).trigger('client-MapClickEvent', pushLL);
                // }
            }


            function onMapClick(e) {
                var popPt = e.latLng,
                    fixedLL = utils.toFixed(popPt.lng(), popPt.lat(), 6),
                    marker,
                    content = "You clicked the map at " + fixedLL.lat + ", " + fixedLL.lon;
                geoCoder.geocode({'latLng': popPt}, function (results, status) {
                    if (status === google.maps.GeocoderStatus.OK) {
                        if (results[0]) {
                            marker = new google.maps.Marker({
                                map: mphmap,
                                title: "",
                                address : results[0].formatted_address,
                                position: popPt
                            });

                            content = results[0].formatted_address;
                            showClickResult(content, popPt, marker);
                        } else {
                            showClickResult(content, popPt);
                        }
                    }
                });
                // showClickResult(content, popPt);
            }

            google.maps.event.addListener(mphmap, 'click', function (event) {
                onMapClick(event);
            });

            /*
            function createBounds() {
                var createdBounds = new google.maps.LatLngBounds(),
                    testPts = [

                        new google.maps.LatLng(41.890283, -87.625842),
                        new google.maps.LatLng(41.888941, -87.620692),
                        new google.maps.LatLng(41.884979, -87.620950)
                    ],
                    i;

                for (i = 0; i < 3; i++) {
                    createdBounds.extend(testPts[i]);
                }
                return createdBounds;
            }
            */
        }
        /*
        function gotDragEnd() {
            console.log("dragend event hit");
            setBounds('pan');
        }
        */

        function retrievedClick(clickPt) {
            var fixedLL = utils.toFixed(clickPt.x, clickPt.y, 6),
                content,
                popPt,
                btnShare;
            console.log("Back in retrievedClick - with click at " +  clickPt.x + ", " + clickPt.y);
            // latlng = L.latLng(clickPt.y, clickPt.x, clickPt.y);
            // $inj = MLConfig.getInjector();
            // linkrSvc = $inj.get('LinkrService');
            // linkrSvc.hideLinkr();

            popPt = new google.maps.LatLng(clickPt.y, clickPt.x);
            content = "Map click at " + fixedLL.lat + ", " + fixedLL.lon;
            if (clickPt.title) {
                content += '<br>' + clickPt.title;
            }
            if (clickPt.address) {
                content += '<br>' + clickPt.address;
            }
            if (popDetails !== null && clickPt.referrerId !== MLConfig.getUserId()) {
                popDetails.infoWnd.close();
                popDetails.infoMarker.setMap(null);
            }
            if (clickPt.referrerId !== MLConfig.getUserId()) {
                popDetails = markerInfoPopup(popPt, content, "Received from user " + clickPt.referrerName + ", " + clickPt.referrerId);
                popDetails.infoWnd.open(mphmap, popDetails.infoMarker);

                btnShare = document.getElementsByClassName('sharebutton')[0];
                if (btnShare) {
                    console.debug(btnShare);
                    btnShare.style.visibility = 'hidden';
                }
            }
        }

        function getMapHosterName() {
            return "hostName is " + hostName;
        }

        function getMap() {
            return mphmap;
        }

        function getEventDictionary() {
            var $inj = MLConfig.getInjector(),
                evtSvc = $inj.get('PusherEventHandlerService'),
                eventDct = evtSvc.getEventDct();
            return eventDct;
        }
        function retrievedBoundsInternal(xj) {
            console.log("Back in retrievedBounds");
            var zm = xj.zoom,
                tmpLon,
                tmpLat,
                tmpZm,
                cntr,
                gBnds,
                qtext,
                service,
                cmp = compareExtents("retrievedBounds", {'zoom' : zm, 'lon' : xj.lon, 'lat' : xj.lat});
                // view = xj.lon + ", " + xj.lat + " : " + zm + " " + scale2Level[zm].scale;
                // document.getElementById("mppos").innerHTML = view;
            if (cmp === false) {
                tmpLon = cntrxG;
                tmpLat = cntryG;
                tmpZm = zmG;

                updateGlobals("retrievedBounds with cmp false", xj.lon, xj.lat, xj.zoom);
                userZoom = false;
                cntr = new google.maps.LatLng(xj.lat, xj.lon);
                // userZoom = true;
                if (xj.action === 'pan') {
                    if (tmpZm !== zm) {
                        mphmap.setZoom(zm);
                    }
                    mphmap.setCenter(cntr);

                    gBnds = mphmap.getBounds();
                    console.debug(gBnds);
                    // ll = new google.maps.LatLng(bnds.lly, bnds.llx);
                    // ur = new google.maps.LatLng(bnds.ury, bnds.urx);
                    // gBnds = new google.maps.LatLngBounds(ll, ur);
                    qtext = MLConfig.getQuery();
                    if (qtext && qtext !== "") {
                        queryPlaces.bounds = gBnds;
                        queryPlaces.query = qtext;
                        queryPlaces.location = mphmap.getCenter();
                        service = new google.maps.places.PlacesService(mphmap);
                        service.textSearch(queryPlaces, placesQueryCallback);
                    }
                } else {
                    if (tmpLon !== xj.lon || tmpLat !== xj.lat) {
                        mphmap.setCenter(cntr);
                    }
                    mphmap.setZoom(zm);
                }
                userZoom = true;
            }
        }

/*
        function getBoundsZoomLevel(bounds) {
            var GLOBE_HEIGHT = 256, // Height of a google map that displays the entire world when zoomed all the way out
                GLOBE_WIDTH = 256, // Width of a google map that displays the entire world when zoomed all the way out

                ne = bounds.getNorthEast(),
                sw = bounds.getSouthWest(),
                latZoomLevel,
                lngZoomLevel,
                lngAngle = ne.lng() - sw.lng(),
                latAngle = ne.lat() - sw.lat();

            if (latAngle < 0) {
                latAngle += 360;
            }
            latZoomLevel = Math.floor(Math.log(mphmap.height * 360 / latAngle / GLOBE_HEIGHT) / Math.LN2);
            lngZoomLevel = Math.floor(Math.log(mphmap.width * 360 / lngAngle / GLOBE_WIDTH) / Math.LN2);

            return (latZoomLevel < lngZoomLevel) ? latZoomLevel : lngZoomLevel;
        }
*/

        /*
        function polygon(coords) {
            var arrayLatLng = [],
                i,
                pgn;
            for (i = 0; i < coords.length; i++) {
                arrayLatLng.push(new google.maps.LatLng(coords[i][0], coords[i][1]));
            }
            pgn = new google.maps.Polygon({
                paths: arrayLatLng,
                strokeColor: "#0000FF",
                strokeOpacity: 0.8,
                strokeWeight: 4,
                fillColor: "#FF0000",
                fillOpacity: 0.25
            });

            pgn.setMap(mphmap);
        }

        function circle(cntr, rds) {
            var cntrLatLng = new google.maps.LatLng(cntr[0], cntr[1]),
                crcl = new google.maps.Circle({
                    center: cntrLatLng,
                    radius: rds,
                    strokeColor: 'red',
                    fillColor: '#f03',
                    fillOpacity: 0.5
                });

            crcl.setMap(mphmap);
        }
        */


        function setUserName(name) {
            MLConfig.setUserName(name);
        }

        // MapHosterGoogle.prototype.setPusherClient = function (pusher, channel)
        function setPusherClient(pusher, channel) {

            var $inj = MLConfig.getInjector(),
                evtSvc = $inj.get('PusherEventHandlerService'),
                evtDct = evtSvc.getEventDct(),
                key;
            for (key in evtDct) {
                if (evtDct.hasOwnProperty(key)) {
                    pusher.subscribe(key, evtDct[key]);
                }
            }
            selfPusherDetails.pusher = pusher;
            selfPusherDetails.channel = channel;
            MLConfig.setChannel(channel);
            console.log("reset MapHosterGoogle setPusherClient, selfPusherDetails.pusher " +  selfPusherDetails.pusher);
        }

        function getGlobalsForUrl() {
            return "&lon=" + cntrxG + "&lat=" + cntryG + "&zoom=" + zmG;
        }

        function getCenter() {
            var pos = { 'lon' : cntrxG, 'lat' : cntryG, 'zoom' : zmG};
            console.log("return accurate center from getCenter()");
            console.debug(pos);
            return pos;
        }

        function formatCoords (pos) {
            var fixed = utils.toFixed(pos.lng, pos.lat, 5),
                formatted  = '<div style="color: blue;">' + fixed.lon + ', ' + fixed.lat + '</div>';
            return formatted;
        }

        function geoLocate(pos) {
            var infoWindow = new google.maps.InfoWindow({map: mphmap});
            infoWindow.setPosition(pos);
            infoWindow.setContent(formatCoords(pos));
            mphmap.setCenter(pos);
            mphmap.setZoom(14);
            updateGlobals('geoLocate just happened', pos.lng, pos.lat, 15);
        }

        function publishPosition(pos) {
            var gmQuery,
                pubBounds;
            if (selfPusherDetails.pusher) {
                console.log("MapHosterGoogle.publishPosition");
                console.log(pos);

                gmQuery = MLConfig.getQuery();
                if (gmQuery !== '') {
                    console.log("adding gmQuery : " + gmQuery);
                    pos.gmquery = gmQuery;
                    pos.search += "&gmquery=" + gmQuery;
                    pubBounds = MLConfig.getBoundsForUrl();
                    pos.search += pubBounds;
                }
                console.log('After adding gmQuery');
                console.debug(pos.search);

                selfPusherDetails.pusher.channel(selfPusherDetails.channel).trigger('client-NewMapPosition', pos);
            }

        }

        function retrievedBounds(xj) {
            return retrievedBoundsInternal(xj);
        }

        function getSearchBounds() {
            var bounds = mphmap.getBounds();
            // console.debug(bounds);
            return bounds;
        }

        function setSearchBox(sbox) {
            searchBox = sbox;
        }

        function setPlacesFromSearch(places) {
            placesFromSearch = places;
            console.log("in setPlacesFromSearch");
            console.log(placesFromSearch);
        }

        function MapHosterGoogle() {
            mapReady = false;
            // bounds = null;
            userZoom = true;
        }

        function init() {
            return MapHosterGoogle;
        }

        function removeEventListeners() {
            console.log("empty removeEventListeners block in MapHosterGoogle");
        }

        return {
            start: init,
            config : configureMap,
            retrievedBounds: retrievedBounds,
            retrievedClick: retrievedClick,
            setPusherClient: setPusherClient,
            setUserName : setUserName,
            getGlobalsForUrl: getGlobalsForUrl,
            getCenter : getCenter,
            getEventDictionary : getEventDictionary,
            publishPosition : publishPosition,
            removeEventListeners : removeEventListeners,
            getMapHosterName : getMapHosterName,
            setPlacesFromSearch : setPlacesFromSearch,
            getSearchBounds : getSearchBounds,
            setSearchBox : setSearchBox,
            getMap : getMap,
            placeMarkers : placeMarkers,
            geoLocate : geoLocate
        };
    });

}());
// }).call(this);
