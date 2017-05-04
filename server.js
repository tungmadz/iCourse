//get all the tools we need
var express     = require('express');
var app         = express();
var port        = process.env.PORT || 8080;
var mongoose    = require('mongoose');
var passport    = require('passport');
var flash       = require('connect-flash');

var morgan      = require('morgan');
var cookieParser= require('cookie-parser');
var bodyParser  = require('body-parser');
var session     = require('express-session');

var configDB    = require('./config/database.js');

//configuration
mongoose.connect(configDB.url);

// pass passport for configuration
require('./config/passport')(passport);

// set up our express application
app.use(morgan('dev'));
app.use(cookieParser());
//app.use(bodyParser());
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

app.set('view engine','ejs');

//required for passport ilovescotchscotchyscotchscotch
app.use(session({secret: 'secret-string'}));
app.use(passport.initialize());
app.use(passport.session());    //persistent login session
app.use(flash());               //use connect-flash for flash messages stored in session

//routes
require('./app/routes.js')(app,passport);// load our routes and pass in our app and fully configured passport

//launch
app.listen(port);
console.log('The magic happens on port ' +port);
