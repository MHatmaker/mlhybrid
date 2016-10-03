/*global define */

var details = {
    locationPath : "/",
    search: "/",
    webmapId : "a4bb8a91ecfb4131aa544eddfbc2f1d0 ",
    masherChannel : "private-channel-mashchannel",
    masherChannelInitialized : false,
    nameChannelAccepted : false,
    protocol : 'http',
    host : '', //"http://localhost",
    hostport : '3035',
    href : '', //"http://localhost",
    url: '',
    lat : '',
    lon : '',
    zoom : '',
    destPref : '',
    maphost : '',
    query : '',
    bounds : {'llx' : '', 'lly' : '', 'urx' : '', 'ury' : ''},
    isInitialUser : true,
    userId : null,
    referrerId : null,
    userName : '',
    nextWindowName : 0,
    hideWebSiteOnStartup : false,
    smallFormDimensions : { 'top' : 1, 'left' : 1, 'width' : 450, 'height' : 570},
    startupView : {'summaryShowing' : true, 'websiteDisplayMode' : true},
    nginj : null
};


(function () {
    'use strict';
    console.debug('MLConfig.js setup method');
    var nextWindowName = 'MishMash ';
   /*
    var locationPath = "/";
    //var pathRX = new RegExp(/\/[^\/]+$/), locationPath = location.pathname.replace(pathRX, '');
    console.log(location.pathname);
    console.log(location.search);
    console.log(locationPath);
    console.log("webmapId " + webmapId + " channel " + masherChannel);
 */
    define(['lib/utils'],
        function (utils, Color, Symbol) {
            console.debug('MLConfig define fn');

            function search(searchDetails) {
                // console.log("setSearch from " + details.search + " to " + searchDetails);
                details.search = searchDetails.substring(0);
                // console.log("copied to details : " + details.search);
                //var pathRX = new RegExp(/\/[^\/]+$/), locationPath = location.pathname.replace(pathRX, '');
            }
            function getParameterByName(name) {
                // console.log("get paramater " + name + " from " + details.search);
                name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
                var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
                    results = regex.exec(details.search);
                return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
            }

            return {
                testUrlArgs: function (args) {
                    var rslt = getParameterByName('id');
                    // alert("getParameterByName('id') = " + rslt);
                    // alert(rslt.length);
                    // alert(rslt.length != 0);

                    console.log("getParameterByName('id') = " + rslt);
                    console.log(rslt.length);
                    console.log(rslt.length !== 0);
                    return rslt.length !== 0;
                },
                masherChannel: function (newWindow) {
                    // alert(getParameterByName('channel'));
                    // alert(details.masherChannel);
                    return newWindow ? getParameterByName('channel') : details.masherChannel;
                },
                setInjector : function (inj) {
                    details.nginj = inj;
                },
                getInjector : function () {
                    return details.nginj;
                },
                getChannelFromUrl : function () {
                    details.masherChannel = getParameterByName('channel');
                    details.masherChannelInitialized = true;
                    return details.masherChannel;
                },
                setChannel : function (chnl) {
                    if (details.masherChannelInitialized === false) {
                        details.masherChannelInitialized = true;
                    }
                    details.masherChannel = chnl;
                },
                isChannelInitialized : function () {
                    return details.masherChannelInitialized;
                },

                setNameChannelAccepted : function (tf) {
                    if (details.nameChannelAccepted === false) {
                        details.nameChannelAccepted = true;
                    }
                    details.nameChannelAccepted = tf;
                },
                isNameChannelAccepted : function () {
                    return details.nameChannelAccepted;
                },
                webmapId: function (newWindow) {
                    return newWindow ? getParameterByName('id') : details.webmapId;
                },
                setWebmapId : function (id) {
                    details.webmapId = id;
                },
                setLocationPath : function (locPath) {
                    details.locationPath = locPath;
                },
                getLocationPath: function () {
                    return details.locationPath;
                },
                setSearch : function (searchDetails) {
                    details.search = searchDetails;
                },
                lon: function () {
                    return getParameterByName('lon');
                },
                lat: function () {
                    return getParameterByName('lat');
                },
                zoom: function () {
                    return getParameterByName('zoom');
                },
                maphost: function () {
                    return getParameterByName('maphost');
                },
                query: function () {
                    return getParameterByName('gmquery');
                },
                getQueryFromUrl: function () {
                    // details.query.push(getParameterByName('gmquery'));
                    return details.query;
                },
                setPosition: function (position) {
                    details.lon = position.lon;
                    details.lat = position.lat;
                    details.zoom = position.zoom;
                },
                getPosition: function () {
                    return {"webmapId" : details.webmapId, "lon" : details.lon, "lat" : details.lat, "zoom" : details.zoom};
                },
                sethref: function (hrf) {
                    console.log("sethref : " + hrf);
                    details.href = hrf;
                    console.log("details href : " + details.href);
                },
                gethref: function () {
                    var pos = details.href.indexOf("/arcgis");
                    if (pos  > -1) {
                        return details.href; //.substring(0, pos);
                    }
                    return details.href;
                },
                sethost: function (h) {
                    details.host = h;
                    console.log("host : " + details.host);
                },
                gethost: function () {
                    return details.host;
                },
                setprotocol: function (p) {
                    details.protocol = p;
                    console.log("protocol : " + details.protocol);
                },
                getprotocol: function () {
                    return details.protocol;
                },
                sethostport: function (hp) {
                    details.hostport = hp;
                    console.log("hostport : " + details.hostport);
                },
                gethostport: function () {
                    return details.hostport;
                },
                getbaseurl : function () {
                    var baseurl = details.protocol + "//" + details.host + "/";
                    console.log("getbaseurl --> " + baseurl);
                    return baseurl;
                },
                setUrl: function (u) {
                    details.url = u;
                },
                getUrl: function () {
                    return details.url;
                },
                setMapHost: function (h) {
                    details.maphost = h;
                },
                getMapHost: function () {
                    return details.maphost;
                },
                setQuery: function (q) {
                    details.query = q;
                    // if(details.query.length > 0) {
                    //     if (details.query[details.query.length-1] !== q) {
                    //         details.query.push(q);
                    //     }
                    // } else {
                    //     details.query.push(q);
                    // }
                    // console.log("details query array on push");
                    // console.debug(details.query);
                },
                getQuery: function () {
                    return details.query;
                    // if (details.query.length === 0) {
                    //     return "";
                    // } else {
                    //     return details.query[0];
                    // }
                },
                popQuery : function () {
                    details.query.pop();
                    console.log("details query array on pop");
                    console.debug(details.query);
                },
                setBounds : function (bnds) {
                    details.bounds = bnds;
                },
                getBounds : function () {
                    return details.bounds;
                },
                getBoundsForUrl : function () {
                    var bnds = details.bounds,
                        bndsUrl = "&llx=" + bnds.llx + "&lly=" + bnds.lly + "&urx=" + bnds.urx + "&ury=" + bnds.ury;
                    return bndsUrl;
                },
                getBoundsFromUrl : function () {
                    var llx = getParameterByName('llx'),
                        lly = getParameterByName('lly'),
                        urx = getParameterByName('urx'),
                        ury = getParameterByName('ury');
                    return {'llx' : llx, 'lly' : lly, 'urx' : urx, 'ury' : ury};
                },

                getUpdatedUrl : function () {
                    var n = details.webmapId.length,
                        id = details.webmapId,
                        updatedUrl;

                    if (id[n - 1] === ' ') {
                        id = details.webmapId.substr(0, n - 1);
                    }
                    updatedUrl = String.format("?id={0}&lon={1}&lat={2}&zoom={3}&channel={4}",
                        id, details.lon, details.lat, details.zoom, details.masherChannel);
                    console.log(updatedUrl);
                    return updatedUrl;
                },
                getUpdatedRawUrl : function () {
                    var n = details.webmapId.length,
                        id = details.webmapId.substr(0, n - 1),
                        updatedUrl = "?id=" + id + "&lon=" + details.lon + "&lat=" + details.lat +
                            "&zoom=" + details.zoom + "&channel=" + details.masherChannel;
                    console.log(updatedUrl);
                    return updatedUrl;
                },

                getDestinationPreference : function () {
                    return details.destPref;
                },
                setDestinationPreference : function (pref) {
                    details.destPref = pref;
                },
                getUserId : function () {
                    return details.userId;
                },
                setUserId : function (id) {
                    details.userId = id;
                },
                getReferrerId : function () {
                    return details.referrerId;
                },
                getReferrerIdFromUrl : function () {
                    details.referrerId = getParameterByName('referrerId');
                    return details.referrerId;
                },
                setReferrerId : function (id) {
                    details.referrerId = id;
                },

                getUserName : function () {
                    return details.userName;
                },
                getUserNameFromUrl : function () {
                    details.userName = getParameterByName('userName');
                    return details.userName;
                },
                setUserName : function (name) {
                    details.userName = name;
                },

                getReferrerNameFromUrl : function () {
                    details.referrerName = getParameterByName('referrerName');
                    return details.referrerName;
                },

                getInitialUserStatus : function () {
                    return details.isInitialUser;
                },
                setInitialUserStatus : function (tf) {
                    details.isInitialUser = tf;
                },
                getNextWindowName : function () {
                    var nextNum = utils.getRandomInt(100, 200),
                        nextName = nextWindowName + nextNum;
                    return nextName;
                },
                setHideWebSiteOnStartup : function (tf) {
                    details.hideWebSiteOnStartup = tf;
                },
                getHideWebSiteOnStartup : function () {
                    return details.hideWebSiteOnStartup;
                },
                getRandomInt : function (min, max) {
                    return Math.floor(Math.random() * (max - min + 1)) + min;
                },
                getSmallFormDimensions : function () {
                    var d = details.smallFormDimensions,
                        ltwh = String.format('top={0}, left={1}, height={2},width={3}',
                            d.top, d.left, d.height, d.width);
                    return ltwh;
                },
                setStartupView : function (sum, site) {
                    details.startupView.summaryShowing = sum;
                    details.startupView.websiteDisplayMode = site;
                },
                getStartupView : function () {
                    return details.startupView;
                },

                showConfigDetails: function (msg) {
                    console.log(msg);
                    console.log(
                        'isInitialUser ' + details.isInitialUser + "\n",
                        "  userId : "  + details.userId + ', userName ' + details.userName + "\n" +
                            "referrerId : "  + details.referrerId + "\n" +
                            "locationPath : "  + details.locationPath + "\n" +
                            "host : "  + details.host + "\n" +
                            "hostport : "  + details.hostport + "\n" +
                            "href : "  + details.href + "\n"  +
                            "search : "  + details.search + "\n" +
                            "maphost : "  + details.maphost + "\n" +
                            "webmapId : "  + details.webmapId + "\n" +
                            "masherChannel : "  + details.masherChannel + "\n" +
                            "lon :" + details.lon + '\n' +
                            "lat : " + details.lat + "\n" +
                            "zoom : " + details.zoom +
                            "startupView.summaryShowing : " + details.startupView.summaryShowing + ", startupView.websiteDisplayMode : " + details.startupView.websiteDisplayMode
                    );

                }
            };
        });

}());
// }).call(this);
