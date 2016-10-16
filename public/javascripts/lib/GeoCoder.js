/*global define */

/*

//nominatim.openstreetmap.org/reverse/?lat=33.49351305030696&lon=-111.95955634117126&zoom=18&addressdetails=1&format=json

*/


(function () {
    "use strict";

    console.log('GeoCoder setup');
    define([
    ],

        function GeoCoder() {

            var options = {},
                http = null;
            options.serviceUrl = '//nominatim.openstreetmap.org/';

            function init(App, hhttttpp) {
                http = hhttttpp;
                console.log('GeoCoder init');
                App.service('GeoCoder', GeoCoder);
                return GeoCoder;
            }

            function handleSuccess(response) {

                return (response.data);

            }

            // I transform the error response, unwrapping the application dta from
            // the API response payload.
            function handleError(response) {

                // The API response from the server should be returned in a
                // nomralized format. However, if the request was not handled by the
                // server (or what not handles properly - ex. server error), then we
                // may have to normalize it on our end, as best we can.
                if (!angular.isObject(response.data) || !response.data.message) {
                    return ($q.reject("An unknown error occurred."));
                }

                // Otherwise, use expected error message.
                return ($q.reject(response.data.message));

            }

            function reverse(location, scale) {
                var zm = 18, //Math.round(Math.log(scale / 256) / Math.log(2)),
                    qstr = options.serviceUrl + 'reverse/?lat=' + location.lat + '&lon=' + location.lng + '&zoom=' + zm +
                        '&addressdetails=1&format=json',
                    request;
                console.log(qstr);

                request = http({
                    method: "get",
                    url: qstr,
                    params: {
                        action: "get"
                    }
                });

                return (request.then(handleSuccess, handleError));
            }

            // Return public API.
            return ({
                start: init,
                reverse: reverse
            });

    //nominatim.openstreetmap.org/reverse/?lat=33.49351305030696&lon=-111.95955634117126&zoom=18&addressdetails=1&format=json


        });

}());
