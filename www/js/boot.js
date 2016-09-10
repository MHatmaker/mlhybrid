console.log("in boot");

require(['app'], function(app) {
    alert('in boot, require app');
  // $(document).ready(function() {
  //   var tHithere = "Hi there. It's now $time";
  //   $('body').append(template.render(tHithere, {time: new Date()}));
  // });
});
