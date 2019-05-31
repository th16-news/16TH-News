var express = require('express');
var router = express.Router();

const folderView = __path_views_frontend + 'pages/details/';
const layoutFrontend = __path_views_frontend + 'frontend';

const pageTitle = 'details';

router.get('/', (req, res, next) => {
    res.render(`${folderView}index`, { layout: layoutFrontend, errors: null, pageTitle });
});

module.exports = router;