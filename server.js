//setup Dependencies
var connect = require('connect')
    , express = require('express')
    , io = require('socket.io')
//    , amqp = require('amqp')
    , rabbit = require('rabbit.js')
    , port = (process.env.PORT || 8081);

//Setup Express
var server = express.createServer();
server.configure(function(){
    server.set('views', __dirname + '/views');
    server.set('view options', { layout: false });
    server.use(connect.bodyParser());
    server.use(express.cookieParser());
    server.use(express.session({ secret: "shhhhhhhhh!"}));
    server.use(connect.static(__dirname + '/static'));
    server.use(server.router);
});

//setup the errors
server.error(function(err, req, res, next){
    if (err instanceof NotFound) {
        res.render('404.jade', { locals: { 
                  title : '404 - Not Found'
                 ,description: ''
                 ,author: ''
                 ,analyticssiteid: 'XXXXXXX' 
                },status: 404 });
    } else {
        res.render('500.jade', { locals: { 
                  title : 'The Server Encountered an Error'
                 ,description: ''
                 ,author: ''
                 ,analyticssiteid: 'XXXXXXX'
                 ,error: err 
                },status: 500 });
    }
});
server.listen(port);

//amqp
//var rconn = amqp.createConnection({ host: 'localhost' });
//rconn.on('ready', function () {
//    var client_exchange = rconn.exchange("S24Demo.PubSub.Client", {
//        autoDelete: false,
//        durable: true,
//        type: 'topic',
//        passive: 'true'
//    });
//    rconn.exchange("S24Demo.PubSub.Server", {
//        autoDelete: false,
//        durable: true,
//        type: 'fanout'
//    });
//    //Setup Socket.IO
//    var socket = io.listen(server);
//    socket.sockets.on('connection', function(client){
//      var queue_entity = rconn.queue("entity_server" + client.id, {
//        durable: false,
//        exclusive: true
//      }, function(){
//        queue_entity.bind('S24Demo.PubSub.Server', '#');
//      });
//      client.on('bank:update', function(bank){
//        client_exchange.publish("#", bank, { type: 'S24Demo_Entity_Bank:S24Demo'});
//      });
//
//      queue_entity.subscribe(function(message, headers, deliveryInfo){
//        client.emit('bank:from_server', message);
//      });
//
//      client.on('disconnect', function(){
//        queue_entity.destroy();
//        console.log('Client Disconnected.');
//      });
//    });
//});

///////////////////////////////////////////
//              Routes                   //
///////////////////////////////////////////

/////// ADD ALL YOUR ROUTES HERE  /////////

server.get('/', function(req,res){
  res.render('index.jade', {
    locals : { 
              title : 'Your Page Title'
             ,description: 'Your Page Description'
             ,author: 'Your Name'
             ,analyticssiteid: 'XXXXXXX' 
            }
  });
});


//A Route for Creating a 500 Error (Useful to keep around)
server.get('/500', function(req, res){
    throw new Error('This is a 500 Error');
});

//The 404 Route (ALWAYS Keep this as the last route)
server.get('/*', function(req, res){
    throw new NotFound;
});

function NotFound(msg){
    this.name = 'NotFound';
    Error.call(this, msg);
    Error.captureStackTrace(this, arguments.callee);
}


var context = rabbit.createContext();
context.on('ready', function() {
    var socket = io.listen(server);
        socket.sockets.on('connection', function(client){
            var req = context.socket('REQ');
        req.connect("entities", function(){
            //nothing
            req.write(JSON.stringify({welcome: 'rabbit.js'}), 'utf8');
        });
        req.on("data", function(msg){
            console.log(msg);
        });
    });
});


console.log('Listening on http://0.0.0.0:' + port );
