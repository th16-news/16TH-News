var express = require('express');
var router = express.Router();

const middlewareGetUserInfo = require(__path_middlewares + 'get-user-info');

router.use('/', middlewareGetUserInfo, require('./home'));
router.use('/auth', require('./auth'));
router.use('/categories', require('./categories'));
router.use('/hashtags', require('./hashtags'));
router.use('/details', require('./details'));


module.exports = router;
