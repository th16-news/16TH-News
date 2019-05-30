var express = require('express');
var router = express.Router();

router.use('/', require('./home'));
router.use('/auth', require('./auth'));


module.exports = router;
