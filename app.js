var express = require('express');
var expressLayouts = require('express-ejs-layouts');
var mongoose = require('mongoose');

var path = require('path');

const pathConfig = require('./path');

global.__base = __dirname + '/';
global.__path_app = __base + pathConfig.folder_app + '/';

global.__path_configs = __path_app + pathConfig.folder_configs + '/';
global.__path_helpers = __path_app + pathConfig.folder_helpers + '/';
global.__path_middleware = __path_app + pathConfig.folder_middleware + '/';
global.__path_models = __path_app + pathConfig.folder_models + '/';
global.__path_routes = __path_app + pathConfig.folder_routes + '/';
global.__path_schemas = __path_app + pathConfig.folder_schemas + '/';
global.__path_uploads= __path_app + pathConfig.folder_uploads + '/';
global.__path_validates = __path_app + pathConfig.folder_validates + '/';
global.__path_views = __path_app + pathConfig.folder_views + '/';

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
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', __path_views_backend + 'backend');

// serve static files such as images, CSS files, and JavaScript files
app.use(express.static(path.join(__dirname, 'public')));


//Local variable
app.locals.systemConfig = systemConfig;

//Setup router
app.use(`/${systemConfig.prefixWriter}`, require(__path_routes + 'backend/writer/index'));
app.use(`/${systemConfig.prefixEditor}`, require(__path_routes + 'backend/editor/index'));
app.use(`/${systemConfig.prefixAdministrator}`, require(__path_routes + 'backend/administrator/index'));



module.exports = app;