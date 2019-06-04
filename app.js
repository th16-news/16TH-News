var createError = require('http-errors');
var express = require('express');
var expressLayouts = require('express-ejs-layouts');
var mongoose = require('mongoose');
var flash = require('connect-flash'); // phải có session
const session = require('express-session');
var moment = require('moment'); // chỉ file ejs

var path = require('path');
const validator = require('express-validator');
var passport = require('passport');

const pathConfig = require('./path');

global.__base = __dirname + '/';
global.__path_app = __base + pathConfig.folder_app + '/';
global.__path_public = __base + pathConfig.folder_public + '/';

global.__path_configs = __path_app + pathConfig.folder_configs + '/';
global.__path_helpers = __path_app + pathConfig.folder_helpers + '/';
global.__path_middlewares = __path_app + pathConfig.folder_middlewares + '/';
global.__path_models = __path_app + pathConfig.folder_models + '/';
global.__path_routes = __path_app + pathConfig.folder_routes + '/';
global.__path_schemas = __path_app + pathConfig.folder_schemas + '/';
global.__path_uploads= __path_app + pathConfig.folder_uploads + '/';
global.__path_validates = __path_app + pathConfig.folder_validates + '/';
global.__path_views = __path_app + pathConfig.folder_views + '/';
global.__path_uploads= __path_public + pathConfig.folder_uploads + '/';

global.__path_views_backend = __path_views + pathConfig.folder_module_backend + '/';
global.__path_views_frontend = __path_views + pathConfig.folder_module_frontend + '/';

const systemConfig = require(__path_configs + 'system');

mongoose.connect(`mongodb+srv://Hatomia:hatomiatruong@th16-news-vwlpp.gcp.mongodb.net/test?retryWrites=true`, { useNewUrlParser: true });

var app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//set port
var port = process.env.PORT || '3000';
app.listen(port);

// set session
app.use(session({
    secret: 'hatomia',
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 15*60*1000
    }
}));

// set passport
require(__path_configs + 'passport')(passport);
app.use(passport.initialize());
app.use(passport.session());

// set flash
app.use(flash());
app.use(function(req, res, next) {
  res.locals.messages = req.flash();
  next();
})
// use validator and custom
app.use(validator({
    customValidators: {
        isNotEqual: (value1, value2) => {
            return value1 !== value2;
        }
    }
}));
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', __path_views_backend + 'backend');


// serve static files such as images, CSS files, and JavaScript files
app.use(express.static(path.join(__dirname, 'public')));


//Local variable
app.locals.systemConfig = systemConfig;
app.locals.moment = moment;

//Setup router
app.use(`/${systemConfig.prefixWriter}`, require(__path_routes + 'backend/writer/index'));
app.use(`/${systemConfig.prefixEditor}`, require(__path_routes + 'backend/editor/index'));
app.use(`/${systemConfig.prefixAdministrator}`, require(__path_routes + 'backend/administrator/index'));
app.use(`/${systemConfig.prefixFrontend}`, require(__path_routes + 'frontend/index'));


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use( async (err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message; 
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  if (systemConfig.env == "dev") {
    res.status(err.status || 500);
    res.render(__path_views_backend + 'pages/error', { moduleTitle: 'ERROR PAGE', pageTitle: 'Page Not Found', setting_time_publish: false });
  }
  if (systemConfig.env == "production") {
    res.status(err.status || 500);
    res.render(__path_views_frontend + 'pages/error', {
      //top_post: false,
      pageTitle: 'ERROR PAGE',
      layout: __path_views_frontend + 'frontend'
    });
  }
});


module.exports = app;