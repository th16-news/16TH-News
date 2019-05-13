var express = require('express');
var router = express.Router();

const folderView = __path_views_backend + 'pages/administrator/articles/';

router.get('/', (req, res, next) => {
    res.render(`${folderView}list`);
})

module.exports = router;