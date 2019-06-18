var express = require('express');
var router = express.Router();

var nodemailer = require('nodemailer');
var passport = require('passport');
const bcrypt = require('bcrypt');
var crypto = require('crypto');


const StringHelpers = require(__path_helpers + 'strings');
const FileHelpers = require(__path_helpers + 'files');
const UserModel = require(__path_models + 'users');
const systemConfig = require(__path_configs + 'system');
const notify = require(__path_configs + 'notify');


const folderView = __path_views_frontend + 'pages/auth/';
const layoutFrontend = __path_views_frontend + 'frontend';
const linkIndex = StringHelpers.formatLink('/' + systemConfig.prefixFrontend + '/');
const linkLogin = StringHelpers.formatLink('/' + systemConfig.prefixFrontend + '/auth/login/');
const linkReset = StringHelpers.formatLink('/' + systemConfig.prefixFrontend + '/auth/reset/');
const linkForgetPassword = StringHelpers.formatLink('/' + systemConfig.prefixFrontend + '/auth/forget-password/');
const linkAdjourn = StringHelpers.formatLink('/' + systemConfig.prefixFrontend + '/auth/adjourn/');



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

    await UserModel.getAllUsersByEmail(input.email).then(async (users) => {
        let user = users[0];
        if ((user == undefined || user.length == 0) && input.password == input.confirm_password) {
            const salt = await bcrypt.genSalt(10)
            input.password = await bcrypt.hash(input.password, salt)
            UserModel.saveUser(input, { task: 'add' }).then(() => { //add
                res.redirect(linkIndex);
            });
        } else {
            let errors = [];
            if (input.password != input.confirm_password) {
                errors = errors.concat([notify.ERROR_CONFIRM_PASSWORD]);
            }
            if (input.username != user.username || (user != undefined && user.length != 0)) {
                errors = errors.concat([notify.ERROR_REGISTER]);
            }
            res.render(`${folderView}register`, {
                layout: layoutFrontend,
                errors: errors,
                pageTitle: 'register'
            });
        }
    })
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

            UserModel.getAllUsersByEmail(input.email).then(async (users) => {
                let user = users[0];
                if (user == undefined || user.length == 0 || user.email == req.user.email) { //valid
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
                } else { //invalid
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
            })
        }
    })
});

router.get('/adjourn', (req, res, next) => {
    UserModel.getUser(req.user.id).then((user) => { 
        let date = null;
        if (user.renewal_date != null && user.renewal_date != undefined && user.renewal_date.toString().length > 9) {
            date = StringHelpers.getDate(user.renewal_date.toString());
        } 
        res.render(`${folderView}adjourn`, {
            layout: layoutFrontend,
            errors: null,
            is_request: user.request_adjourn,
            date,
            pageTitle: 'adjourn'
        });
    });    
});


router.post('/adjourn', async (req, res, next) => {
    await UserModel.saveUser(req.user, { task: 'edit-request-adjourn' }).then(() => { 
        res.redirect(linkAdjourn)
    }); 
});


router.get('/forget-password', (req, res, next) => {
    res.render(`${folderView}forget-password`, {
        layout: layoutFrontend,
        errors: null,
        pageTitle: 'forget-password'
    });
});

router.post('/forget-password', async (req, res, next) => {
    var token;
    await crypto.randomBytes(20, (err, buf) => {
        token = buf.toString('hex');
    });
    let user;
    await UserModel.getAllUsersByEmail(req.body.email).then((users) => {
        user = users[0];
    })
    if (user == undefined || user.length == 0) {
        return res.redirect(linkForgetPassword);
    }
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000;

    await UserModel.saveUser(user, { task: 'edit-token' }).then(() => { })
    var smtpTransport = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'th16news@gmail.com',
            pass: 'dangkhoihoaitam'
        }
    });
    var mailOptions = {
        to: user.email,
        from: 'th16news@gmail.com',
        subject: 'Reset Password',
        text: 'http://' + req.headers.host + '/auth/reset/' + token + '\n\n'
    }
    smtpTransport.sendMail(mailOptions, (err) => {})
    res.redirect(linkForgetPassword);

})

router.get('/reset/:token', (req, res) => {
    UserModel.getAllUsersByToken(req.params.token, { $gt: Date.now() }).then((users) => {
        let user = users[0];
        if (user == undefined || user.length == 0) {
            return res.redirect(linkForgetPassword);
        }
        res.render(`${folderView}reset`, {
            layout: layoutFrontend,
            errors: null,
            pageTitle: 'reset',
            token: req.params.token
        });
    })
})

router.post('/reset/:token', async (req, res) => {

    let user;
    await UserModel.getAllUsersByToken(req.params.token, { $gt: Date.now() }).then((users) => {
        user = users[0];
        if (user == undefined || user.length == 0) {
            return res.redirect(linkReset);
        }
    })
    if (req.body.password == req.body.confirm_password) {
        const salt = await bcrypt.genSalt(10)
        user.password = await bcrypt.hash(req.body.password, salt);
        await UserModel.saveUser(user, { task: 'edit-password' }).then(() => {
            res.redirect(linkLogin);
        });
    } else {
        return res.render(`${folderView}reset`, {
            layout: layoutFrontend,
            errors: [notify.ERROR_CONFIRM_PASSWORD],
            pageTitle: 'reset',
            token: req.params.token
        });
    }

    var smtpTransport = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'th16news@gmail.com',
            pass: 'dangkhoihoaitam'
        }
    });
    var mailOptions = {
        to: user.email,
        from: 'th16news@gmail.com',
        subject: 'Your password has been changed',
        text: 'Password for your account ' + user.email + ' has been changed'
    }
    smtpTransport.sendMail(mailOptions, (err) => {})

    res.redirect(linkReset);
})


router.get('/no-permission', function(req, res, next) {
  res.render(`${folderView}no-permission`, { 
      layout: layoutFrontend, 
      pageTitle: 'ERROR PAGE' 
    });
});

module.exports = router;
