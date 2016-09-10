
(function () { "use strict"; // alert("utils created"); define([],

        function () {

            function toFixedOne(val, prec) {
                "use strict";
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
            },

            function toFixedTwo(x, y, precision) {
                "use strict";
                var fixed = {
                    lon: toFixedOne(x, precision),
                    lat: toFixedOne(y, precision)
                };
                return fixed;
            },

            function formatCoords(pos) {
                var fixed = toFixedTwo(pos.lng(), pos.lat(), 5),
                    formatted = '<div style="color: blue;">' + fixed.lon + ', ' + fixed.lat + '</div>';
                return formatted;
            },

            function geoLocate(pos, mlmap) {
                infoWindow = new google.maps.InfoWindow({map: mlmap});
                infoWindow.setPosition(pos);
                infoWindow.setContent(utils.formatCoords(pos));
                console.log('geoLocate just happened at ' + pos.lng + ", " +  pos.lat);
            },

            function showMap(mpopt) {
                // pos = {'lat' : cntr.lat, 'lng' : cntr.lng};
                var pos = {'lat' : mpopt.center.lat(), 'lng' : mpopt.center.lng()},
                    fixed = utils.formatCoords(pos),
                    mapdiv = document.getElementById('mapdiv'),
                    mlmap = new google.maps.Map(mapdiv, mpopt);

                console.log("In showMap: Create map centered at " + fixed);
                mlmap.setCenter(mpopt.center);
                console.debug(mpopt.center);
                geoLocate(mpopt.center, mlmap);
                return mlmap;
            }

            return {
                formatCoords : formatCoords,
                toFixedOne : toFixedOne,
                toFixedTwo : toFixedTwo,
                showMap : showMap
            };
        });
}());
