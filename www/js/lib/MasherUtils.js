
(function() {
    "use strict";

    console.log('MasherUtils setup');
    define([
        'angular',
        'esri/map',
        'dijit/Dialog'
    ], function(angular, Map) {
        console.log('MasherUtils define');
        
    esri.config.defaults.geometryService = new esri.tasks.GeometryService("http://tasks.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer");
  
    //specify any default settings for your map 
    //for example a bing maps key or a default web map id
    configOptions = {
        webmap:newSelectedWebMapId,
        title:"",
        subtitle:"",
        //arcgis.com sharing url is used modify this if yours is different
        sharingurl:"http://arcgis.com/sharing/content/items",
        //enter the bing maps key for your organization if you want to display bing maps
        bingMapsKey:"/*Please enter your own Bing Map key*/"
    }
      
    esri.arcgis.utils.arcgisUrl = configOptions.sharingurl;
    esri.config.defaults.io.proxyUrl = "/arcgisserver/apis/javascript/proxy/proxy.ashx";
      
    //get the web map id from the url 
    urlObject = esri.urlToObject(document.location.href);
    urlObject.query = urlObject.query || {};
    if(urlObject.query && urlObject.query.webmap){
         configOptions.webmap = urlObject.query.webmap;
    }
    
        function init() {
            console.log('MasherUtils init');
            return MapCtrl;
        }

        return { start: init };

    });