var express = require('express');
var router = express.Router();

const middleAuthentication = require(__path_middlewares + 'auth');

router.use('/', middleAuthentication.writer, require('./articles'));
router.use('/articles', require('./articles'));

module.exports = router;