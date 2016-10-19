/*global console, document, google*/


if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) {
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}


(function () {
    "use strict"; // alert("utils created"); define([],

    define([],
        (function () {

            function stringFormat() {
                var args = arguments;
                return this.replace(/{(\d+)}/g, function(match, number) {
                    return typeof args[number] != 'undefined'
                        ? args[number]
                        : match
                    ;
                });
            }
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

            function getDocHeight() {
            // return Math.max(
                // document.body.scrollHeight, document.documentElement.scrollHeight,
                // document.body.offsetHeight, document.documentElement.offsetHeight,
                // document.body.clientHeight, document.documentElement.clientHeight
            // );
                return document.documentElement.offsetHeight; //window.innerHeight;
            }

            function getRootElementFontSize() {
                // Returns a number
                var fontSize = parseFloat(
                    // of the computed font-size, so in px
                    getComputedStyle(
                        // for the root <html> element
                        document.documentElement
                    ).fontSize
                );
                return fontSize;
            }

            function convertRem(value) {
                return value * getRootElementFontSize();
            }

            function getButtonHeight(m) {
                var btnHeight = convertRem(m);
                // btnHeight = btnHeight; // / 16;
                return btnHeight;
            }

            function getElemHeight(itm) {
                var elem = document.getElementById(itm),
                    elemHeight = elem.clientHeight;
                return elemHeight;
            }

            function setElementHeight(itm, hgt, units) {
                var elem, hstr;
                // var elem = utils.getElemById(itm)[0];
                if (units === undefined) {
                    units = 'px';
                }
                elem = document.getElementById(itm);
                hstr = String.format("{0}{1}", hgt, units);
                // elem.css({"height": hstr});
                elem.setAttribute("style", "height:" + hstr);
            }

            function setElementWidth(itm, wdth, units) {
                // var elem, wstr;
                // var elem = utils.getElemById(itm)[0];
                if (units === undefined) {
                    units = 'px';
                }
                // elem = document.getElementById(itm);
                // wstr = String.format("{0}{1}", wdth, units);
                // elem.css({"height": hstr});
            }

            function getElementDimension(itm, dim) {
                var elem = document.getElementById(itm),
                    ElemDim = dim === 'height' ? elem.clientHeight : elem.clientWidth;
                console.log(itm + ' ' + dim + ' is initially ' + ElemDim);
                return ElemDim;
            }

            function setElementDimension(itm, dim, value, units) {
                var elem, dimstr;
                if (units === undefined) {
                    units = 'px';
                }
                elem = document.getElementById(itm);
                dimstr = String.format("{0} : {1}{2}", dim, value, units);
                console.log("dim string : " + dimstr);
                elem.setAttribute("style", dimstr);
            }

            function getElemById(id) {
                return angular.element(document.getElementById(id));
            }

            function setVisible(itm, flexnone) {
                var elem = document.getElementById(itm);
                elem.visible = flexnone === 'block' ? 'visible' : 'none';
                elem.style.display = flexnone;
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

            function showLoading() {
                console.log("show loading");
                esri.show(loading);
            }

            function hideLoading(error) {
                console.log("hide loading");
                esri.hide(loading);
            }

            return {
                stringFormat : stringFormat,
                formatCoords : formatCoords,
                toFixedOne : toFixedOne,
                toFixed : toFixedTwo,
                getDocHeight : getDocHeight,
                getButtonHeight : getButtonHeight,
                getElemHeight : getElemHeight,
                setElementHeight : setElementHeight,
                setElementWidth : setElementWidth,
                setElementDimension : setElementDimension,
                getElementDimension : getElementDimension,
                getElemById : getElemById,
                setVisible : setVisible,
                showMap : showMap,
                geoLocate : geoLocate,
                showLoading : showLoading,
                hideLoading : hideLoading
            };
        })
        );
// }());
}).call(this);
