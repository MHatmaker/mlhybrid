/*global define, console,  google, navigator, angular, plugin, document, window, alert, $ionicLoading, $cordovaGeolocation*/
/*global setTimeout*/
/*jslint es5: true */
/*jslint unparam: true*/
/*jslint browser: true*/
/*global $, jQuery, alert*/

(function () {
    "use strict";

    console.log('MapCtrl setup');
    define([
        'esri/map',
        'controllers/DestWndSetupCtrl',
        'lib/StartupLeaflet',
        'lib/StartupGoogle',
        'lib/StartupArcGIS',
        'lib/utils',
        'lib/MLConfig',
        'controllers/PusherSetupCtrl',
        'controllers/WindowStarter',
        'controllers/MapLinkrMgrCtrl'
    ], function (Map, DestWndSetupCtrl, StartupLeaflet, StartupGoogle, StartupArcGIS, libutils,
            MLConfig, PusherSetupCtrl, WindowStarterArg, MapLinkrMgrCtrl) {
        console.log('MapCtrl define');
        var selfMethods = {},
            currentMapType = null,
            WindowStarter = WindowStarterArg,
            whichCanvas = 'map_canvas',
            curMapTypeInitialized = false,
            searchBox = null,
            gmQSvc = null,
            modalInstance,
            mlmap,
            MapCtrl,
            infoWindow = null,
            utils = libutils;

        function initializeCommon(scope, $routeParams, $compile, $uibModal, $uibModalStack, LinkrSvc,
                    CurrentMapTypeService, PusherEventHandlerService, GoogleQueryService, SiteViewService) {

            var gmquery = MLConfig.query(),
                stup,
                tmpltName,
                connectQuery,
                queryForNewDisplay = "",
                queryForSameDisplay = "",
                searchInput,
                $scope = scope;

            whichCanvas = CurrentMapTypeService.getMapTypeKey() === 'arcgis' ? 'map_canvas_root' : 'map_canvas';
            // CurrentMapTypeService.addScope($scope);
            // $scope.$on('ForceMapSystemEvent', function (evt, args) {
            //     $scope.currentMapSystem = args.whichsystem;
            // });
            $scope.currentMapSystem = CurrentMapTypeService.getCurrentMapConfiguration();

            $scope.$on('SwitchedMapSystemEvent', function (evt, args) {
                console.log("In MapCtrl ... SwitchedMapSystemEvent");

                $scope.currentMapSystem = args.whichsystem;
                whichCanvas = $scope.currentMapSystem.maptype === 'arcgis' ? 'map_canvas_root' : 'map_canvas';
            });

            $scope.PusherEventHandlerService = PusherEventHandlerService;
            $scope.GoogleQueryService = GoogleQueryService;

            $scope.destSelections = [
                {'option' : "Same Window", 'showing' : "destination-option-showing"},
                {'option' : "New Tab", 'showing' : "destination-option-showing"},
                {'option' : "New Pop-up Window", 'showing' : "destination-option-showing"}];
            $scope.selectedDestination = "Same Window";
            $scope.gsearch = {};
            $scope.data = {
                dstSel : $scope.destSelections[0].option,
                prevDstSel : $scope.destSelections[0].option,
                title : 'map has no title',
                icon : null,
                snippet : 'nothing in snippet',
                mapType : $scope.currentMapSystem.maptype,
                imgSrc : $scope.currentMapSystem.imgSrc,
                destSelections : $scope.destSelections,
                query : "no query yet"

            };

            $scope.preserveState = function () {
                console.log("preserveState");

                $scope.data.prevDstSel = $scope.data.dstSel;
                console.log("preserve " + $scope.data.prevDstSel + " from " + $scope.data.dstSel);
            };

            $scope.restoreState = function () {
                console.log("restoreState");

                console.log("restore " + $scope.data.dstSel + " from " + $scope.data.prevDstSel);
                $scope.data.dstSel = $scope.data.prevDstSel;
            };
            $scope.updateState = function (selectedDestination) {
                console.log("updateState");
                $scope.selectedDestination  = selectedDestination;
                $scope.data.dstSel = $scope.data.prevDstSel = selectedDestination;
            };

            $scope.cancel = function () {
                modalInstance.dismiss('cancel');
            };


            function refreshLinker() {
                var lnkrText = document.getElementById("idLinkerText"),
                    lnkrSymbol = document.getElementById("idLinkerSymbol"),
                    lnkrTxt,
                    lnkrSmbl;
                if (lnkrSymbol && lnkrText) {
                    lnkrTxt =  MapLinkrMgrCtrl.getLinkrMgrData().ExpandPlug;
                    lnkrText.innerHTML = lnkrTxt;
                    console.log("refresh Linker Text with " + lnkrText.innerHTML);
                    lnkrSmbl = "../stylesheets/images/" + MapLinkrMgrCtrl.getLinkrMgrData().mapLinkrBtnImage + ".png";
                    lnkrSymbol.src = lnkrSmbl;
                    console.log("refresh Linker Symbol with " + lnkrSymbol.src);
                }
            }

            // $scope.$on('displayLinkerEvent', function (event, data) {
            //     refreshLinker();
            // });
            //
            // $scope.$on("MapLinkrClosedEvent", function (event, args) {
            //     refreshLinker();
            // });

            function placesQueryCallback(placesFromSearch, status) {
                var googmph,
                    curMapType = "no map",
                    placesSearchResults,
                    onAcceptDestination;

                console.log('status is ' + status);
                utils.hideLoading();

                onAcceptDestination = function (info) {
                    var sourceMapType,
                        evtSvc = $scope.PusherEventHandlerService,
                        newSelectedWebMapId,
                        destWnd;


                    if (info) {
                        sourceMapType = info.mapType;
                        destWnd = info.dstSel;
                    }
                    newSelectedWebMapId = "NoId";

                    if (destWnd === 'New Pop-up Window' || destWnd === 'New Tab') {
                        if (MLConfig.isNameChannelAccepted() === false) {

                            evtSvc.addEvent('client-MapXtntEvent', sourceMapType.retrievedBounds);
                            evtSvc.addEvent('client-MapClickEvent', sourceMapType.retrievedClick);

                            PusherSetupCtrl.setupPusherClient(evtSvc.getEventDct(),
                                MLConfig.getUserName(), WindowStarter.openNewDisplay,
                                {
                                    'destination' : destWnd,
                                    'currentMapHolder' : sourceMapType,
                                    'newWindowId' : newSelectedWebMapId,
                                    'query' : queryForNewDisplay
                                });
                            queryForNewDisplay = "";
                        } else {
                            WindowStarter.openNewDisplay(MLConfig.masherChannel(false),
                                MLConfig.getUserName(), destWnd, sourceMapType, newSelectedWebMapId, queryForNewDisplay);
                            queryForNewDisplay = "";
                        }

                    } else {  //(destWnd == "Same Window")
                        googmph = CurrentMapTypeService.getSpecificMapType('google');
                        googmph.placeMarkers(placesSearchResults);
                        MLConfig.setQuery(queryForNewDisplay);
                        queryForSameDisplay = queryForNewDisplay;
                    }
                };

                if (placesFromSearch && placesFromSearch.length > 0) {
                    placesSearchResults = placesFromSearch;


                    $scope.subsetDestinations(placesFromSearch);

                    gmQSvc = $scope.GoogleQueryService;
                    scope = gmQSvc.getQueryDestinationDialogScope(curMapType);
                    $scope.showDestDialog(
                        onAcceptDestination,
                        scope,
                        {
                            'id' : null,
                            'title' : searchInput.value,
                            'snippet' : 'No snippet available',
                            'icon' : 'stylesheets/images/googlemap.png',
                            'mapType' : CurrentMapTypeService.getCurrentMapType()
                        }
                    );
                } else {
                    console.log('searchBox.getPlaces() still returned no results');
                }

            }

            $scope.subsetDestinations = function (placesFromSearch) {
                var curMapType = CurrentMapTypeService.getMapTypeKey(),
                    googmph = CurrentMapTypeService.getSpecificMapType('google');

                if (curMapType === 'google') {
                    if (placesFromSearch) {
                        googmph.setPlacesFromSearch(placesFromSearch);
                    }
                    $scope.destSelections[0].showing = 'destination-option-showing';
                } else {
                    $scope.destSelections[0].showing = 'destination-option-hidden';
                    $scope.data.dstSel = $scope.destSelections[2].option;
                }
            };

            connectQuery = function () {
                var googmph,
                    mapLinkrBounds,
                    searchBounds,
                    position,
                    center,
                    googleCenter,
                    gmap,
                    mapOptions,
                    pacinput,
                    queryPlaces = {},
                    service;

                googmph = CurrentMapTypeService.getSpecificMapType('google');

                mapLinkrBounds = MLConfig.getBounds();
                searchBounds = new google.maps.LatLngBounds(
                    new google.maps.LatLng({'lat' : mapLinkrBounds.lly, 'lng' : mapLinkrBounds.llx}),
                    new google.maps.LatLng({'lat' : mapLinkrBounds.ury, 'lng' : mapLinkrBounds.urx})
                );
                position = MLConfig.getPosition();
                center = {'lat' : position.lat, 'lng' : position.lon};
                googleCenter = new google.maps.LatLng(position.lat, position.lon);
                gmap = googmph.getMap();
                utils.showLoading();
                if (!gmap) {
                    mapOptions = {
                        center : googleCenter,
                        zoom : 15,
                        mapTypeId : google.maps.MapTypeId.ROADMAP
                    };
                    gmap = new google.maps.Map(document.getElementById("hiddenmap_canvas"), mapOptions);
                }

                // placesFromSearch = searchBox.getPlaces();

                pacinput = $('#pac-input');
                queryPlaces.bounds = searchBounds;
                queryPlaces.query = pacinput[0].value;
                queryPlaces.location = center;
                // MLConfig.setQuery(queryPlaces.query);

                service = new google.maps.places.PlacesService(gmap);
                if (queryPlaces.query !== '') {
                    service.textSearch(queryPlaces, placesQueryCallback);
                }
            };

            function refreshMinMax() {
                var minMaxText = document.getElementById("idMinMaxText"),
                    minMaxSymbol = document.getElementById("idMinMaxSymbol");
                if (minMaxText && minMaxSymbol) {
                    minMaxText.innerHTML = SiteViewService.getSiteExpansion();
                    console.log("refresh MinMax Text with " + minMaxText.innerHTML);
                    minMaxSymbol.src = "../stylesheets/images/" + SiteViewService.getMinMaxSymbol() + ".png";
                    console.log("refresh MinMax Symbol with " + minMaxSymbol.src);
                }
            }

            function placeCustomControls() {
                function stopLintUnusedComplaints(lnkr, minmaxr) {
                    console.log("stopLintUnusedComplaints");
                }
                if (document.getElementById("linkerDirectiveId") === null) {

                    var contextScope = $scope,
                        cnvs = utils.getElemById(whichCanvas),
                        templateLnkr = ' \
                            <div id="linkerDirectiveId" class="lnkrclass"> \
                            <label id="idLinkerText" class="lnkmaxcontrol_label lnkcontrol_margin"  \
                            style="cursor:url(../stylesheets/images/LinkerCursor.png) 9 9,auto;"> \
                            </label> \
                            <img id="idLinkerSymbol" class="lnkmaxcontrol_symbol lnkcontrol_margin" \
                               style="cursor:url(../stylesheets/images/LinkerCursor.png) 9 9,auto;" > \
                            </div>',

                        templateMinMaxr = ' \
                            <div id="mapmaximizerDirectiveId" class="mnmxclass" > \
                            <label id="idMinMaxText" class="lnkmaxcontrol_label maxcontrol_margin" \
                                style="cursor:url(../stylesheets/images/LinkerCursor.png) 9 9,auto;"> \
                            </label> \
                            <img id="idMinMaxSymbol" class="lnkmaxcontrol_symbol maxcontrol_margin" \
                                 style="cursor:url(../stylesheets/images/LinkerCursor.png) 9 9,auto;"> \
                            </div>',
                        lnkr1 = angular.element(templateLnkr),
                        lnkr = cnvs.append(lnkr1),

                        minmaxr1 = angular.element(templateMinMaxr),
                        minmaxr = cnvs.append(minmaxr1),

                        lnkrdiv,
                        mnmxdiv,
                        lnkrText,
                        lnkrSymbol,
                        refreshDelay;
                    stopLintUnusedComplaints(lnkr, minmaxr);

                    setTimeout(function () {
                        lnkrdiv = document.getElementsByClassName('lnkrclass')[0];
                        lnkrdiv.addEventListener('click', function (event) {
                            console.log('lnkr[0].onclick   display LinkerEvent');
                            event.stopPropagation();

                            LinkrSvc.showLinkr();
                        });
                        mnmxdiv = document.getElementsByClassName('mnmxclass')[0];

                        mnmxdiv.addEventListener('click', function (event) {
                            console.log('minmaxr[0].onclick   mapMaximizerEvent');
                            event.stopPropagation();
                            contextScope.$emit('mapMaximizerEvent');
                            contextScope.$apply();
                            refreshMinMax();
                        });
                    }, 200);


                    lnkrText = document.getElementById("idLinkerText");
                    lnkrSymbol = document.getElementById("idLinkerSymbol");
                    refreshDelay = 500;
                    if (lnkrSymbol && lnkrText) {
                        refreshDelay = 10;
                    }
                    setTimeout(function () {
                        refreshLinker();
                        refreshMinMax();
                    }, refreshDelay);
                }
                // else {
                //     refreshDelay = 500;
                //     setTimeout(function () {
                //         setupQueryListener();
                //         refreshLinker();
                //         refreshMinMax();
                //     }, refreshDelay);
                // }
                // connectQuery();
            }

            selfMethods.placeCustomControls = placeCustomControls;
            console.debug(selfMethods);

            $scope.gsearchVisible = 'inline-block';
            whichCanvas = CurrentMapTypeService.getMapTypeKey() === 'arcgis' ? 'map_canvas_root' : 'map_canvas';
            $scope.selectedDestination = CurrentMapTypeService.getMapTypeKey() === 'google' ? 'Same Window' : 'New Pop-up Window';
            $scope.updateState($scope.selectedDestination);

            if (gmquery !== '') {
                $scope.gsearch = {'query' : gmquery};  // was read from url when opening new window
            } else {
                $scope.gsearch = {'query' : 'SearcherBox'};
            }

            currentMapType = CurrentMapTypeService.getCurrentMapType();

            stup = currentMapType.start();
            console.debug(stup);

            tmpltName = $routeParams.id;
            console.log(tmpltName);

            function configureCurrentMapType() {
                currentMapType = CurrentMapTypeService.getMapStartup();
                currentMapType.config(null);
                $scope.map = currentMapType.getMap();
                // $scope.map.width = mapSize['medium'];
                // $scope.MapWdth = mapSize['small'];
                $scope.isMapExpanded = false;
                console.debug($scope.map);
                curMapTypeInitialized = true;
            }

            selfMethods.configureCurrentMapType = configureCurrentMapType;

            function invalidateCurrentMapTypeConfigured() {
                curMapTypeInitialized = false;
            }

            function getSearchBox() {
                return searchBox;
            }
            selfMethods.getSearchBox = getSearchBox;

            selfMethods.invalidateCurrentMapTypeConfigured = invalidateCurrentMapTypeConfigured;

            $scope.$on('CollapseSummaryEvent', function (event, args) {
                console.log("unused CollapseSummaryEvent");
            });

            $scope.$on('CollapseSummaryCompletionEvent', function (event, args) {
                console.log("MapCtrl handling CollapseSummaryCompletionEvent - resize WindowBy");

                var refreshDelay = 500;
                setTimeout(function () {
                    utils.calculateComponentHeights(args.mastersitevis, args.websitevis);
                    utils.updateMapContainerHeight($scope);
                    utils.displayHeights("Heights after CollapseSummaryCompletionEvent");
                    console.log("REFRESH LINKER AND MINMAX");

                    if (curMapTypeInitialized === false) {
                        configureCurrentMapType();
                    }

                }, refreshDelay);
            });

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

            $scope.$on('searchClickEvent', function (event, args) {
                console.log("MapCtrl 'searchClickEvent' handler");
                var element = document.getElementById('pac-input'),
                    pacinput,
                    paccon;
                if (element) {
                    element.focus();
                }
                // element.trigger({ type : 'keypress', which : 13 });
                pacinput = $('#pac-input');
                if (pacinput) {
                    pacinput.focus();
                }
                console.log('trigger keypress event on pac-input');
                pacinput.trigger(jQuery.Event('keypress', {which: 13}));
                paccon = $('#pac-container');
                console.log('trigger keydown event on pac_container');
                paccon.trigger(jQuery.Event('keydown', {keyCode: 40, which: 40}));
                // google.maps.event.trigger(searchBox, { type : 'keypress', which : 13 });

                // alert('searchClickEvent in MapCtrl with ' + args);
                // $scope.$apply(function () {
                    // $scope.current = MLConfig.getQuery();
                // });
            });

            function setupQueryListener() {
                var
                    cnvs = utils.getElemById(whichCanvas),
                    curMapType = CurrentMapTypeService.getMapTypeKey(),
                    fnLink,
                    pacinput,
                    pacinputParent,
                    pacinputElement,
                    template = ' \
                        <div id="gmsearch" \
                            class="gmsearchclass" \
                            style="width: 28em; margin-left: 7em; margin-right : 2em;"> \
                            <input id="pac-input" \
                                class="gmsearchcontrols" className="controls" \
                                type="text" onclick="cancelBubble=true;" onmousemove="event.stopPropagation();" \
                                onmousedown="event.stopPropagation();" onmouseup="event.stopPropagation();" \
                                placeholder="Search Google Places"  \
                                ng-class="{\'gmsposition-rel\' : !gsearch.isGoogle, \'gmsposition-abs\' : gsearch.isGoogle}" \
                                ng-model="gsearch.query" \
                                ng-change="queryChanged()" auto-focus > \
                        </div>';
                if (curMapType === 'google') {
                    $scope.gsearch.isGoogle = true;
                } else {
                    $scope.gsearch.isGoogle = false;
                    if (curMapType === 'arcgis') {
                        whichCanvas = 'map_canvas_root';
                        pacinputElement = document.getElementById('pac-input');
                        if (pacinputElement) {
                            pacinputParent = pacinputElement.parentElement;
                            pacinputParent.removeChild(pacinputElement);
                        }
                    }
                }

                whichCanvas = curMapType === 'arcgis' ? 'map_canvas_root' : 'map_canvas';
                pacinput = document.getElementById('pac-input');
                if (!pacinput) {
                    pacinput = angular.element(template);
                    cnvs.append(pacinput);
                    fnLink = $compile(pacinput);
                    fnLink($scope);
                }

                $scope.safeApply();

                setTimeout(function () {
                    searchInput = /** @type {HTMLInputElement} */ (document.getElementById('pac-input'));
                    if (searchInput) {
                        // mphmap.controls[google.maps.ControlPosition.TOP_LEFT].push(searchInput);
                        searchInput.value = '';
                        searchBox = new google.maps.places.SearchBox(searchInput);

                        google.maps.event.addListener(searchBox, 'places_changed', function () {
                            console.log("MapCtrl 'places_changed' listener");
                            connectQuery();
                            searchInput.blur();
                            setTimeout(function () {
                                searchInput.value = '';
                            }, 10);
                        });
                    }
                }, 500);
            }

            selfMethods.setupQueryListener = setupQueryListener;

            // setupQueryListener();

            $scope.$on('minmaxDirtyEvent', function (event, args) {
                refreshMinMax();
            });

            $scope.queryChanged = function () {
                queryForNewDisplay = $scope.gsearch.query;
                if ($scope.gsearch.query.includes(13)) {
                    MLConfig.setQuery($scope.gsearch.query);
                    if (queryForSameDisplay === "") {
                        queryForSameDisplay = queryForNewDisplay;
                    }
                }
            };

            $scope.showDestDialog = function (callback, details, info) {
                console.log("showDestDialog for currentMapSystem " + $scope.currentMapSystem.title);
                $scope.preserveState();

                $scope.data.mapType = $scope.currentMapSystem.maptype;
                $scope.data.icon = $scope.currentMapSystem.imgSrc;
                $scope.data.query = $scope.gsearch.query;
                $scope.data.callback = callback;
                if (info) {
                    $scope.data.icon = info.icon;
                    $scope.data.title = info.title;
                    $scope.data.snippet = info.snippet;
                    $scope.data.mapType = info.mapType;
                    $scope.data.id = info.id;
                }

                modalInstance = $uibModal.open({
                    templateUrl : '/templates/DestSelectDlgGen',   // .jade will be appended
                    controller : 'DestWndSetupCtrl',
                    backdrop : true,
                    animation : false,
                    animate : 'none',
                    windowClass : 'no-animation-modal',
                    uibModalAnimationClass : 'none',

                    resolve : {
                        data: function () {
                            return $scope.data;
                        }
                    }
                });

                modalInstance.result.then(function (info) {
                    $scope.updateState(info.dstSel);
                    $scope.data.callback(info);
                    $uibModalStack.dismissAll("go away please");
                }, function () {
                    console.log('Modal dismissed at: ' + new Date());
                    $scope.restoreState();
                });

            };
        }

        function MapCtrlMobile($scope, $cordovaGeolocation, $ionicLoading, $ionicPlatform, $routeParams, $compile, $uibModal, $uibModalStack, LinkrSvc,
                    CurrentMapTypeService, PusherEventHandlerService, GoogleQueryService, SiteViewService) {
            var watchOptions,
                watch;
            console.log("In mobile MapCtrl controller fire away");

            function initialize() {
                console.log("In initialize MOBILE");
                var mapOptions = {
                        center: new google.maps.LatLng(37.422858, -122.085065),
                        zoom: 15,
                        mapTypeId: google.maps.MapTypeId.ROADMAP
                    },
                    options = {
                        timeout: 20000,
                        maximumAge: 0,
                        enableHighAccuracy: true
                    };
                $ionicLoading.show({
                    template: '<ion-spinner icon="bubbles"></ion-spinner><br/>Acquiring location!'
                });

                function handleLocationError(browserHasGeolocation, infoWindow, pos) {
                    infoWindow.setPosition(pos);
                    infoWindow.setContent(browserHasGeolocation ?
                            'Error: The Geolocation service failed.' :
                            'Error: Your browser doesn\'t support geolocation.');
                    $ionicLoading.hide();
                }
                // window.setPageTitle();
                // $rootScope.$on('$stateChangeSuccess', function (event) {
                // window.setPageTitle();
                //     console.debug(event);
                // });

                $cordovaGeolocation.getCurrentPosition(options).then(function (position) {
                    console.log("in $cordovaGeolocation.getCurrentPosition callback");
                    // var latLng = new google.maps.LatLng(33.5432, -112.075)
                    var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                    mapOptions = {
                        center: latLng,
                        zoom: 15,
                        mapTypeId: google.maps.MapTypeId.ROADMAP
                    };
                    console.log("ready to create/show Map in callback");
                    console.log("center; " + mapOptions.center.lng() + ", " + mapOptions.center.lat());
                    $ionicLoading.hide();
                    mlmap = utils.showMap(mapOptions);
                    // $scope.map = new google.maps.Map(document.getElementById("mapdiv"), mapOptions);

                }, function (error) {
                    console.log("Could not get location from $cordovaGeolocation.getCurrentPosition");
                    alert("Could not get location");
                    if (navigator.geolocation) {
                        console.log("ready to getCurrentPosition from google navigator");
                        navigator.geolocation.getCurrentPosition(function (position) {
                            console.log("in navigator getCurrentPosition callback");

                            mapOptions.center = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                            console.log("mapOptions.center " + mapOptions.center.lng() + ", " + mapOptions.center.lat());
                            console.debug(mapOptions);
                            mlmap = utils.showMap(mapOptions);
                            $ionicLoading.hide();
                        },
                            function () {
                                console.log("error in navigator.geolocation.getCurrentPosition");
                                $ionicLoading.hide();
                                handleLocationError(true, infoWindow, mlmap.getCenter());
                            });
                        $ionicLoading.hide();
                    } else {
                        console.log("Fall thru to default map display");
                        $ionicLoading.hide();
                        mlmap = utils.showMap(mapOptions);
                        console.debug(error);
                    }
                    $ionicLoading.hide();
                    console.log("fell thru navigator.geolocation.getCurrentPosition");
                    initializeCommon($scope, $routeParams, $compile, $uibModal, $uibModalStack, LinkrSvc,
                        CurrentMapTypeService, PusherEventHandlerService, GoogleQueryService, SiteViewService);
                });

                watchOptions = {
                    timeout: 3000,
                    enableHighAccuracy: true
                };
                watch = $cordovaGeolocation.watchPosition(watchOptions);

                watch.then(
                    null,

                    function (err) {
                        console.log(err);
                    },

                    function (position) {
                        var lat = position.coords.latitude,
                            long = position.coords.longitude;

                        'position - lat {0}, lon{1}'.format(lat, long);
                        mlmap.setCenter(position);
                        utils.geoLocate(position, mlmap, "Changed positions");
                    }
                );

                watch.clearWatch();

                function toPluginPosition(lat, lng) {
                    return new plugin.google.maps.LatLng(lat, lng);
                }

                // mapdiv = document.getElementById("mapdiv");

                // Invoking Map using Google Map SDK v2 by dubcanada
                // mlmap = plugin.google.maps.Map.getMap(mapdiv, {
                //     'camera': {
                //         'latLng': toPluginPosition(-19.9178713, -43.9603117),
                //         'zoom': 10
                //     }
                // });
            }
            selfMethods.initialize = initialize;
            $ionicPlatform.ready(initialize);
            // console.log("addEventListener for deviceready after wait 5000");
            // setTimeout(function () {
            //     document.addEventListener("deviceready", initialize);
            //     console.log("wait 5000");
            // }, 5000);
        }

        function MapCtrlBrowser($scope, $routeParams, $compile, $uibModal, $uibModalStack, LinkrSvc,
                    CurrentMapTypeService, PusherEventHandlerService, GoogleQueryService, SiteViewService) {
            console.log("in MapCtrlBrowser");

            function initialize() {
                console.log("MapCtrl.initialize NOT MOBILE");
                var mapOptions = {
                    center: new google.maps.LatLng(37.422858, -122.085065),
                    zoom: 15,
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                };

                function handleLocationError(browserHasGeolocation, infoWindow, pos) {
                    infoWindow.setPosition(pos);
                    infoWindow.setContent(browserHasGeolocation ?
                            'Error: The Geolocation service failed.' :
                            'Error: Your browser doesn\'t support geolocation.');
                }

                if (navigator.geolocation) {
                    console.log("ready to getCurrentPosition");
                    navigator.geolocation.getCurrentPosition(function (position) {
                        console.log("getCurrentPosition");

                        mapOptions.center = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                        mlmap = utils.showMap(mapOptions);
                    },
                        function () {
                            handleLocationError(true, infoWindow, mlmap.getCenter());
                        });
                } else {
                    // Browser doesn't support Geolocation
                    handleLocationError(false, infoWindow, mlmap.getCenter());
                    mlmap = utils.showMap(mapOptions);
                }
            }
            // selfMethods.initialize = initialize;
            initialize();
            initializeCommon($scope, $routeParams, $compile, $uibModal, $uibModalStack, LinkrSvc,
                        CurrentMapTypeService, PusherEventHandlerService, GoogleQueryService, SiteViewService);
            // google.maps.event.addDomListener(document.getElementById('mapdiv'), 'load', function () {
            //     console.log("addDomListener window load callback");
            //     initialize();
            // });
            // $ionicPlatform.ready(initialize);
        }

        function placeCustomControls() {
            console.log("placeCustomControls");
            selfMethods.placeCustomControls();
        }

        function getSearchBox() {
            selfMethods.getSearchBox();
        }

        function configureCurrentMapType() {
            console.log("configureCurrentMapType");
            selfMethods.configureCurrentMapType();
        }

        function invalidateCurrentMapTypeConfigured() {
            console.log("invalidateCurrentMapTypeConfigured");
            if (selfMethods.invalidateCurrentMapTypeConfigured) {
                selfMethods.invalidateCurrentMapTypeConfigured();
            }
        }

        function setupQueryListener() {
            console.log("setupQueryListener");
            if (selfMethods.setupQueryListener) {
                selfMethods.setupQueryListener();
            }
        }


        function init(App, isMob) {
            console.log('MapCtrl outer init');

            if (isMob) {
                MapCtrl = App.controller('MapCtrl', ['$scope', '$cordovaGeolocation',
                    '$ionicLoading', '$ionicPlatform', '$routeParams', '$compile', '$uibModal', '$uibModalStack',
                    'LinkrService', 'CurrentMapTypeService', 'PusherEventHandlerService',
                    'GoogleQueryService', 'SiteViewService', MapCtrlMobile]);
            } else {
                MapCtrl = App.controller('MapCtrl', ['$scope',
                    '$routeParams', '$compile', '$uibModal', '$uibModalStack',
                    'LinkrService', 'CurrentMapTypeService', 'PusherEventHandlerService',
                    'GoogleQueryService', 'SiteViewService', MapCtrlBrowser]);
            }
            return MapCtrl;
        }
        return {
            start: init,
            placeCustomControls : placeCustomControls,
            configureCurrentMapType : configureCurrentMapType,
            invalidateCurrentMapTypeConfigured : invalidateCurrentMapTypeConfigured,
            getSearchBox : getSearchBox,
            setupQueryListener : setupQueryListener
        };
    });
}).call(this);

// }());
