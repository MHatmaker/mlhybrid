/*global console, require, alert*/
console.log("in MapLinkrApp");

require(['bootstrap'], function (bootstrap) {
    "use strict";
    // alert('in MapLinkrApp, require bootstrap');

    window.onload = function () {
        console.log("window loaded, now bootstrap");
        bootstrap.start();
    }
  // $(document).ready(function() {
  //   var tHithere = "Hi there. It's now $time";
  //   $('body').append(template.render(tHithere, {time: new Date()}));
  // });
});
