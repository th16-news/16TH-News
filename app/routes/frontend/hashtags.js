var express = require('express');
var router = express.Router();

const folderView = __path_views_frontend + 'pages/hashtags/';
const layoutFrontend = __path_views_frontend + 'frontend';

const pageTitle = 'hashtags';


router.get('/', (req, res, next) => {
    res.render(`${folderView}index`, { layout: layoutFrontend, errors: null, pageTitle });
});

module.exports = router;