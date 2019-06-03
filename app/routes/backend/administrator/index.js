var express = require('express');
var router = express.Router();

const middleAuthentication = require(__path_middlewares + 'auth');

router.use('/', middleAuthentication.administrator, require('./articles'));
router.use('/articles', require('./articles'));
router.use('/categories', require('./categories'));
router.use('/tags', require('./tags'));
router.use('/users', require('./users'));

module.exports = router;