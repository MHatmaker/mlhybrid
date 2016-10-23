#!/bin/env node
//  OpenShift sample Node application

/*global require, console */
/*global process */
/*global readFileSync */
/*global module */
/*jslint nomen: true*/
/*global __dirname */

var express = require('express'),
    fs      = require('fs'),
    favicon = require('static-favicon'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    http = require('http'),
    path = require('path'),
    socketio  = require('socket.io'),
    Pusher = require('pusher'),
    pusher,
    MasherNodeAppj,
    routesHtml,
    api,
    resource,
    app_id,
    app_key,
    app_secret,
    MasherNodeApp;

//     nodemailer = require("nodemailer");
//     smtpTransport = require('nodemailer-smtp-transport');

routesHtml = require('./routes/index.js');
api = require('./routes/api');
//     contact = require('./routes/contact');  // Contact Form

resource = require('express-resource');

app_id = '40938';
app_key = '5c6bad75dc0dd1cec1a6';
app_secret = '54546672d0196be97f6a';

pusher = new Pusher({appId: app_id, key: app_key, secret: app_secret});

api.setPusher(pusher);

/**
 *  Define the sample application.
 */
MasherNodeApp = function () {
    "use strict";
    //  Scope.
    var self = this;


    /*  ================================================================  */
    /*  Helper functions.                                                 */
    /*  ================================================================  */

    /**
     *  Set up server IP address and port # using env variables/defaults.
     */
    self.setupVariables = function () {
        //  Set the environment variables we need.
        self.ipaddress = process.env.OPENSHIFT_NODEJS_IP  || '127.0.0.1';
        self.port      = process.env.OPENSHIFT_NODEJS_PORT || 3035;
        console.log('listen on:');
        console.log(self.port);
        console.log(self.ipaddress);

        if (self.ipaddress === "undefined") {
            //  Log errors on OpenShift but continue w/ 127.0.0.1 - this
            //  allows us to run/test the app locally.
            console.warn('No OPENSHIFT_NODEJS_IP var, using 127.0.0.1');
            self.ipaddress = "127.0.0.1";
        }
    };


    /**
     *  Populate the cache.
     */
    self.populateCache = function () {
        if (!self.zcache) {
            self.zcache = {
                'index.html': ''
            };
        }

        //  Local cache for static content.
        self.zcache['index.html'] = fs.readFileSync('./index.html');
    };


    /**
     *  Retrieve entry (content) from cache.
     *  @param {string} key  Key identifying content to retrieve from cache.
     */
    self.cache_get = function (key) {
        return self.zcache[key];
    };


    /**
     *  terminator === the termination handler
     *  Terminate server on receipt of the specified signal.
     *  @param {string} sig  Signal to terminate on.
     */
    self.terminator = function (sig) {
        if (typeof sig === "string") {
            console.log('%s: Received %s - terminating sample app ...', Date(Date.now()), sig);
            process.exit(1);
        }
        console.log('%s: Node server stopped.', Date(Date.now()));
    };


    /**
     *  Setup termination handlers (for exit and a list of signals).
     */
    self.setupTerminationHandlers = function () {
        //  Process on exit and signals.
        process.on('exit', function () {
            self.terminator();
        });

        // Removed 'SIGPIPE' from the list - bugz 852598.
        ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
             'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
            ].forEach(function (element, index, array) {
            process.on(element, function () {
                self.terminator(element);
            });
        });
    };


    /*  ================================================================  */
    /*  App server functions (main app logic here).                       */
    /*  ================================================================  */

    /**
     *  Create the routing table entries + handlers for the application.

urls = (
    '/', 'Index',
  '/leaflet/?', 'Leaflet',
  '/arcgis/?', 'ArcGIS',
  '/googlemap/?', 'GoogleMap',
  '/pusher/auth/?', 'AuthHandler'
)
     */


    self.createRoutes = function () {
        self.routes = { };

        self.routes['/asciimo'] = function (req, res) {
            var link = "http://i.imgur.com/kmbjB.png";
            res.send("<html><body><img src='" + link + "'></body></html>");
        };
        self.routes['/'] = routesHtml.index;
        //self.routes['partials/SystemSelector'] = routesHtml.partials;
        self.routes['/partials/:name'] = routesHtml.partials;
        self.routes['/templates/:name'] = routesHtml.templates;
        self.routes['/indexchannel/:name'] = routesHtml.indexchannel;

        // self.routes['/'] = function(req, res) {
            // res.setHeader('Content-Type', 'text/html');
            // res.send(self.cache_get('index.html') );
        // };

        // JSON API
        self.routes['/username'] = api.getUserName;
        self.routes['/userid'] = api.getUserId;
        self.routes['/wndseqno'] = api.getNextWindowSeqNo;

        // self.routes['/pusher/auth'] = api.getAuth;

        self.app.post('/pusher/auth', function (req, res) {
            console.log('getAuth');
            console.log('%s %s %s', req.method, req.url, req.path);
            console.log('req.body.socket_id is %s', req.body.socket_id);
            console.log('req.body.channel_name is %s', req.body.channel_name);
            var socketId = req.body.socket_id,
                channel = req.body.channel_name,
                auth = pusher.auth(socketId, channel);
            res.send(auth);
        });
        // self.app.post('/contact', contact.process);  // Contact form route


        // self.routes['/api/MarkdownSimple/:id'] = api.getDoc;

        // redirect all others to the index (HTML5 history)
        self.routes['*'] = routesHtml.index;
    };


    /**
     *  Initialize the server (express) and create the routes and register
     *  the handlers.
     */
    self.initializeServer = function () {
        var r;
        self.app = express(); //.createServer();
        self.initSomeOptions();
        self.createRoutes();

        //  Add handlers for the app (from the routes).
        for (r in self.routes) {
            if (self.routes.hasOwnProperty(r)) {
                self.app.get(r, self.routes[r]);
            }
        }
        // self.initDB();
        console.log("server is initialized");
    };

    self.initSomeOptions = function () {
        self.app.set('views', __dirname + '/views');
        // self.app.set('view engine', 'jade');
        self.app.set('view options', {
            layout: false
        });

        self.app.use(favicon());
        self.app.use(logger('dev'));
        //app.use(bodyParser());
        self.app.use(bodyParser.json());
        self.app.use(bodyParser.urlencoded());
        //app.use(methodOverride());
        self.app.use(cookieParser());
        // app.use(express.static(path.join(__dirname, 'public')));
        self.app.use(express.static(__dirname + '/www'));
        //self.app.use(self.app.router);    DEPRECATED
    };


    /**
     *  Initializes the sample application.
     */
    self.initialize = function () {
        self.setupVariables();
        self.populateCache();
        self.setupTerminationHandlers();

        // Create the express server and routes.
        self.initializeServer();
    };
    /*
    self.initDB = function() {
        // Make our db accessible to our router
        self.app.use(function(req,res,next){
            req.db = db;
            next();
        });
    };
    */
        // / catch 404 and forwarding to error handler
       /*  self.app.use(function(req, res, next) {
            var err = new Error('Not Found');
            err.status = 404;
            next(err);
        });
    };
    */

    /**
     *  Start the server (starts up the sample application).
     */
    self.start = function () {
        //  Start the app on the specific interface (and port).
        console.log("now start");
        /*
        self.app.listen(self.port, self.ipaddress, function() {
            console.log('%s: Node server started on %s:%d ...',
                        Date(Date.now() ), self.ipaddress, self.port);
        });
         */
        var server = self.app.listen(self.port, self.ipaddress),
            io = require('socket.io').listen(server);

        io.sockets.on('connection', function (socket) {
            console.log('io.sockets.on is connecting?');
        });
    };

};   /*  Sample Application.  */



/**
 *  main():  Main code.
 */
var zapp = new MasherNodeApp();
zapp.initialize();
module.exports = zapp.app;
zapp.start();
