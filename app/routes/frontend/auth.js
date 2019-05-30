var express = require('express');
var router = express.Router();

var passport = require('passport');
const bcrypt = require('bcrypt');


const StringHelpers = require(__path_helpers + 'strings');
const UserModel = require(__path_models + 'users');
const systemConfig = require(__path_configs + 'system');
const notify = require(__path_configs + 'notify');


const folderView = __path_views_frontend + 'pages/auth/';
//const layoutLogin = __path_views_frontend + 'login';
const layoutFrontend = __path_views_frontend + 'frontend';
const linkIndex = StringHelpers.formatLink('/' + systemConfig.prefixFrontend + '/');
const linkLogin = StringHelpers.formatLink('/' + systemConfig.prefixFrontend + '/auth/login/');


router.get('/logout', (req, res, next) => {
    req.logout();
    res.redirect(linkLogin);
});

router.get('/login', (req, res, next) => {
    if (req.isAuthenticated()) res.redirect(linkIndex);
    //let item = { email: '', password: ''};
    let errors = null;

    res.render(`${folderView}login`, { layout: layoutFrontend, errors/*, item*/ });
});

router.post('/login', (req, res, next) => {
    if (req.isAuthenticated()) res.redirect(linkIndex);
    passport.authenticate('local', {
        successRedirect: linkIndex,
        failureRedirect: linkLogin,
        failureFlash: true
    })(req, res, next);
});

router.get('/register', (req, res, next) => {
    res.render(`${folderView}register`, { layout: layoutFrontend, errors: null });
});

router.post('/register', async (req, res, next) => {
    req.body = JSON.parse(JSON.stringify(req.body));
    let input = Object.assign(req.body);
    bcrypt.hash(input.password, 10, (err, hash) => {
        input.password = hash;
    })

    let count = 0;
    if (input.password == input.confirm_password) count++;
    await UserModel.countUsersRegister(input, 'username').then((number) => {
        if (number == 0) count++;
    })
    await UserModel.countUsersRegister(input, 'email').then((number) => {
        if (number == 0) count++;
    })
    await UserModel.countUsersRegister(input, 'password').then((number) => {
        if (number == 0) count++;
    })
    if (count == 4) {
        UserModel.saveUser(input, { task: 'add' }).then(() => { //add
            res.redirect(linkIndex);
        });
    } else {//no add
        let errors = [];
        if (input.password != input.confirm_password) errors = errors.concat([notify.ERROR_CONFIRM_PASSWORD]);
        if ((input.password == input.confirm_password && count == 3) || (count < 3)) errors = errors.concat([notify.ERROR_REGISTER]);
        res.render(`${folderView}register`, {
            layout: layoutFrontend,
            errors: errors
        });
    }
});


router.get('/info', (req, res, next) => {
    res.render(`${folderView}info`, { layout: layoutFrontend });
});

router.get('/change-password', (req, res, next) => {
    res.render(`${folderView}change-password`, { layout: layoutFrontend });
});

router.get('/forget-password', (req, res, next) => {
    res.render(`${folderView}forget-password`, { layout: layoutFrontend });
});


/*router.get('/no-permission', middleGetUserInfo, middleGetCategoryForMenu, middleArticleRandom, function(req, res, next) {
  res.render(`${folderView}no-permission`, { layout: layoutFrontend, top_post: false });
});*/





module.exports = router;
