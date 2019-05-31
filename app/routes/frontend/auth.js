var express = require('express');
var router = express.Router();

var passport = require('passport');
const bcrypt = require('bcrypt');


const StringHelpers = require(__path_helpers + 'strings');
const FileHelpers = require(__path_helpers + 'files');
const UserModel = require(__path_models + 'users');
const systemConfig = require(__path_configs + 'system');
const notify = require(__path_configs + 'notify');


const folderView = __path_views_frontend + 'pages/auth/';
const layoutFrontend = __path_views_frontend + 'frontend';
const linkIndex = StringHelpers.formatLink('/' + systemConfig.prefixFrontend + '/');
const linkLogin = StringHelpers.formatLink('/' + systemConfig.prefixFrontend + '/auth/login/');

const uploadAvatar = FileHelpers.upload('avatar', 'users/');


router.get('/logout', (req, res, next) => {
    req.logout();
    res.redirect(linkLogin);
});

router.get('/login', (req, res, next) => {
    if (req.isAuthenticated()) res.redirect(linkIndex);
    res.render(`${folderView}login`, {
        layout: layoutFrontend,
        errors: null,
        pageTitle: 'login'
    });
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
    res.render(`${folderView}register`, {
        layout: layoutFrontend,
        errors: null,
        pageTitle: 'register'
    });
})

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
            errors: errors,
            pageTitle: 'register'
        });
    }
});


router.get('/info', (req, res, next) => {
    UserModel.getUser(req.user.id).then((user) => { 
        let date = null;
        if (user.dob != null && user.dob != undefined && user.dob.toString().length > 9) {
            date = StringHelpers.getDate(user.dob.toString());
        }
        res.render(`${folderView}info`, {
            layout: layoutFrontend,
            errors: null,
            user,
            date,
            pageTitle: 'info'
        });
    });    
});


router.post('/info', async (req, res, next) => {
    uploadAvatar(req, res, async (errUpload) => {
        req.body = JSON.parse(JSON.stringify(req.body));
        let input = Object.assign(req.body);
        let message = '';
        if (errUpload) {
            if (errUpload.code == 'LIMIT_FILE_SIZE') {
                errUpload = notify.ERROR_FILE_LIMIT;
            }
            if (req.file != undefined) {
                FileHelpers.remove('public/uploads/users/', req.file.filename);
            }
            message = errUpload;
            UserModel.getUser(req.user.id).then((user) => { 
                let date = null;
                if (user.dob != null && user.dob != undefined && user.dob.toString().length > 9) {
                    date = StringHelpers.getDate(user.dob.toString());
                }
                user.avatar = input.image_old;
                res.render(`${folderView}info`, {
                    layout: layoutFrontend,
                    errors: [notify.ERROR_INFO, message],
                    user,
                    date,
                    pageTitle: 'info'
                });
            });    
        } else {
            let count = 0;
            await UserModel.countUsersRegister(input, 'username').then((number) => {
                if (number <= 1) count++;///////?
            })
            await UserModel.countUsersRegister(input, 'email').then((number) => {
                if (number <= 1) count++;///////?
            })

            if (count == 2) {
                if (req.file == undefined) {
                    input.avatar = input.image_old;
                } else {
                    input.avatar = req.file.filename;
                    FileHelpers.remove('public/uploads/users/', input.image_old);
                }

                input.id = req.user.id;
                UserModel.saveUser(input, { task: 'edit-info' }).then(() => { //edit info
                    res.redirect(linkIndex);
                });
            } else {
                if (req.file != undefined) {
                    FileHelpers.remove('public/uploads/users/', req.file.filename);
                }
                UserModel.getUser(req.user.id).then((user) => { 
                    let date = null;
                    if (user.dob != null && user.dob != undefined && user.dob.toString().length > 9) {
                        date = StringHelpers.getDate(user.dob.toString());
                    }
                    user.avatar = input.image_old;
                    res.render(`${folderView}info`, {
                        layout: layoutFrontend,
                        errors: [notify.ERROR_INFO],
                        user,
                        date,
                        pageTitle: 'info'
                    });
                });    
            }
        }
    })
});

router.get('/forget-password', (req, res, next) => {
    res.render(`${folderView}forget-password`, {
        layout: layoutFrontend,
        errors: null,
        pageTitle: 'forget-password'
    });
});

router.post('/forget-password', (req, res, next) => {
    req.body = JSON.parse(JSON.stringify(req.body));
    let input = Object.assign(req.body);

    UserModel.getUserByUsernameForgetPassword(input.username).then((users) => {
        let user = users[0];
        if (user === undefined || user.length == 0) {
            res.render(`${folderView}forget-password`, {
                layout: layoutFrontend,
                errors: [notify.ERROR_FORGET_PASSWORD],
                pageTitle: 'forget-password'
            });
        } else {
            if (input.email == user.email) {
                // Gửi mail và đổi mật khẩu ...
                console.log(1);
            } else {
                res.render(`${folderView}forget-password`, {
                    layout: layoutFrontend,
                    errors: [notify.ERROR_FORGET_PASSWORD],
                    pageTitle: 'forget-password'
                });
            }
        }
    })
});


/*router.get('/no-permission', middleGetUserInfo, middleGetCategoryForMenu, middleArticleRandom, function(req, res, next) {
  res.render(`${folderView}no-permission`, { layout: layoutFrontend, top_post: false, pageTitle: 'login' });
});*/

module.exports = router;
