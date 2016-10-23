/*global exports */

var pusherRef = null,
    userNames = [
        {'name': 'Billie Sue', 'inuse': 0},
        {'name': 'Billy Bob', 'inuse': 0},
        {'name': 'Billy Joe', 'inuse': 0},
        {'name': 'Bobbie Sue', 'inuse': 0},
        {'name': 'Betty Lou', 'inuse': 0},
        {'name': 'Betty Jo', 'inuse': 0},
        {'name': 'Bobby Jo', 'inuse': 0},
        {'name': 'Bubba', 'inuse': 0},
        {'name': 'Bo', 'inuse': 0},
        {'name': 'Bocephus', 'inuse': 0},
        {'name': 'Buck', 'inuse': 0},
        {'name': 'Sue Ellen', 'inuse': 0},
        {'name': 'Bodean', 'inuse': 0},
        {'name': 'Jimbo', 'inuse': 0},
        {'name': 'Jim Bob', 'inuse': 0},
        {'name': 'Lirlene', 'inuse': 0},
        {'name': 'Linda Sue', 'inuse': 0},
        {'name': 'Lori Belle', 'inuse': 0},
        {'name': 'Duke', 'inuse': 0},
        {'name': 'Martha May', 'inuse': 0},
        {'name': 'Mary Beth', 'inuse': 0},
        {'name': 'Mary Ellen', 'inuse': 0},
        {'name': 'Mary Sue', 'inuse': 0},
        {'name': 'Joe Don', 'inuse': 0},
        {'name': 'Woody Buck', 'inuse': 0},
        {'name': 'Jed Clyde', 'inuse': 0},
    ],
    seqNo = 0,
    namesLength = userNames.length,
    wndNameSeqNo = 0;

exports.getAuth = function (req, res) {
    "use strict";
    console.log('getAuth');
    console.log('%s %s %s', req.method, req.url, req.path);
    console.log('req.body.socket_id is %s', req.body.socket_id);
    console.log('req.body.channel_name is %s', req.body.channel_name);
    var socketId = req.body.socket_id,
        channel = req.body.channel_name,
        auth = pusherRef.authenticate(socketId, channel);
    res.send(auth);
};

exports.setPusher = function (pshr) {
    "use strict";
    console.log("setPusher");
    pusherRef = pshr;
};

exports.getUserName = function (req, res) {
    "use strict";
    console.log("API getUserName");
    console.log('%s %s %s', req.method, req.url, req.path);
    if (seqNo === namesLength) {
        seqNo = 0;
        console.log("reset seqNo to zero");
    }
    console.log("return seqNo %s, name %s", seqNo, userNames[seqNo].name);
    res.json({'id' : seqNo, 'name' : userNames[seqNo].name});
    seqNo++;
};


exports.getUserId = function (req, res) {
    "use strict";
    console.log("API getUserId");
    console.log('%s %s %s', req.method, req.url, req.path);
    if (seqNo === namesLength) {
        seqNo = 0;
        console.log("reset seqNo to zero");
    }
    console.log("return seqNo %s ", seqNo);
    res.json({'id' : seqNo});
    seqNo++;
};

exports.getNextWindowSeqNo = function (req, res) {
    "use strict";
    console.log("API wndNameSeqNo");

    console.log("return wndNameSeqNo %s ", wndNameSeqNo);
    res.json({'wndNameSeqNo' : wndNameSeqNo});
    wndNameSeqNo++;
};
