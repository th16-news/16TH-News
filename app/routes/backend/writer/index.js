var express = require('express');
var router = express.Router();

router.use('/', require('./articles'));

module.exports = router;