

exports.index = function(req, res){
  console.log("exports.index");
  res.send('index');
};

exports.indexchannel = function(req, res){
  console.log("exports.indexchannel");
  var name = req.params.name;
  console.log(name);
  res.send('/' + name);
};

exports.partials = function (req, res) {
  console.log("exports.partials");
  var name = req.params.name;
  console.log(name);
  res.send('partials/' + name);
};

exports.templates = function (req, res) {
console.log("exports.templates");
var name = req.params.name;
console.log(name);
res.send('Templates/' + name + '.jade');
};
.send
