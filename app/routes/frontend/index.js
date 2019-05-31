var express = require('express');
var router = express.Router();

router.use('/', require('./home'));
router.use('/auth', require('./auth'));
router.use('/categories', require('./categories'));
router.use('/hashtags', require('./hashtags'));
router.use('/details', require('./details'));


module.exports = router;
