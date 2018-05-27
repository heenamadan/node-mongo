
var http = require('http');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');//formdata
var errorHandler = require('errorhandler');
var cookieParser = require('cookie-parser');
var MongoStore = require('connect-mongo')(session);
var nodemailer = require('nodemailer');
var multer = require('multer');
var mongoose = require('mongoose');
//var mongoose = require('mongoose');
var Q= require('q');//custom promise
// Configuring Passport
var passport = require('passport');
var util              =     require('util');

//var FacebookStrategy  =     require('passport-facebook').Strategy;

var app = express();


app.locals.pretty = true;
app.set('port', process.env.PORT || 3002);
app.set('views', __dirname + '/app/server/views');
app.set('view engine', 'jade');
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(require('stylus').middleware({ src: __dirname + '/app/public' }));
app.use(express.static(__dirname + '/app/public'));
//app.use(multer);
 //build mongo database connection url //

var dbHost = process.env.DB_HOST || 'localhost'
var dbPort = process.env.DB_PORT || 27017;
var dbName = process.env.DB_NAME || 'node-login';

var dbURL = 'mongodb://'+dbHost+':'+dbPort+'/'+dbName;
if (app.get('env') == 'live'){
// prepend url with authentication credentials // 
	dbURL = 'mongodb://'+process.env.DB_USER+':'+process.env.DB_PASS+'@'+dbHost+':'+dbPort+'/'+dbName;
}
mongoose.connect(dbURL);


app.use(session({
	secret: 'faeb4453e5d14fe6f6d04637f78077c76c73d1b4',
	proxy: true,
	resave: true,
	saveUninitialized: true,
	store: new MongoStore({ url: dbURL })
	})
);


app.use(passport.initialize());
app.use(passport.session());



// Initialize Passport
var initPassport = require('./app/passport/init');
initPassport(passport);


/*passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

// Use the FacebookStrategy within Passport.

app.use(passport.session());*/

/*function add(){
	var a,b,c;
	a=5,b=6;
	c=a+b;
}
var disp_promise = Q.denodeify(add);
var promise=Add;
promise.then{console.log("test promise");}
*/



var routes = require('./app/server/routes')(passport);
//var routes = require('./app/server/index')(passport);
app.use('/', routes);

http.createServer(app).listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});

module.exports = app;

