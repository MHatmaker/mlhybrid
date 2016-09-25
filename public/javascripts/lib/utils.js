/*global console, document, google*/
(function () {
    "use strict"; // alert("utils created"); define([],

    define([],
        (function () {

            function toFixedOne(val, prec) {
                var precision = prec || 0,
                    neg = val < 0,
                    power = Math.pow(10, precision),
                    value = Math.round(val * power),
                    integral = String((neg ? Math.ceil : Math.floor)(value / power)),
                    fraction = String((neg ? -value : value) % power),
                    padding = new Array(Math.max(precision - fraction.length, 0) + 1).join('0'),
                    sign = neg ? "-" : "";

                if (integral[0] === '-') {
                    sign = "";
                }
                return sign + (precision ? integral + '.' + padding + fraction : integral);
            }

            function toFixedTwo(x, y, precision) {
                var fixed = {
                    lon: toFixedOne(x, precision),
                    lat: toFixedOne(y, precision)
                };
                return fixed;
            }

            function fixCoords(pos) {
                return toFixedTwo(pos.lng, pos.lat, 5);
            }

            function formatCoords(pos) {
                var fixed = fixCoords(pos),
                    formatted = '<div style="color: blue;">' + fixed.lon + ', ' + fixed.lat + '</div>';
                return formatted;
            }

            function geoLocate(pos, mlmap, msg) {
                var infoWindow = new google.maps.InfoWindow({map: mlmap});
                infoWindow.setPosition(pos);
                infoWindow.setContent(formatCoords(pos));
                console.log(msg);
                console.log('geoLocate just happened at ' + pos.lng + ", " +  pos.lat);
            }

            function showMap(mpopt) {
                // pos = {'lat' : cntr.lat, 'lng' : cntr.lng};
                var pos = {'lat' : mpopt.center.lat(), 'lng' : mpopt.center.lng()},
                    fixed = fixCoords(pos),
                    mapdiv = document.getElementById('mapdiv'),
                    mlmap = new google.maps.Map(mapdiv, mpopt);

                console.log("In showMap: Create map centered at " + fixed.lon + ", " + fixed.lat);
                mlmap.setCenter(mpopt.center);
                //console.debug(mpopt.center);
                geoLocate(pos, mlmap, "Calling geoLocate from showMap");
                return mlmap;
            }

            return {
                formatCoords : formatCoords,
                toFixedOne : toFixedOne,
                toFixedTwo : toFixedTwo,
                showMap : showMap,
                geoLocate : geoLocate
            };
        })
        );
// }());
}).call(this);
