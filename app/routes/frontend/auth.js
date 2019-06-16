var express = require('express');
var router = express.Router();

var nodemailer = require('nodemailer');

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
const linkLogout = StringHelpers.formatLink('/' + systemConfig.prefixFrontend + '/auth/logout/');
const linkChangePassword = StringHelpers.formatLink('/' + systemConfig.prefixFrontend + '/auth/change-password/');


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
    console.log(input)

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

router.get('/forget-password', (req, res, next) => {
    res.render(`${folderView}forget-password`, {
        layout: layoutFrontend,
        errors: null,
        pageTitle: 'forget-password'
    });
});

router.post('/change-password', async (req, res, next) => {
    req.body = JSON.parse(JSON.stringify(req.body));
    let input = Object.assign(req.body);

    let isValidPassword = null;
    if (input.password != undefined && input.password != null) {
        await UserModel.countUsersRegister(input, 'password').then((number) => {
            if (number == 0) {
                isValidPassword = true;
            } else {
                isValidPassword = false;
            }
        })
    }

    UserModel.getUserByUsernameForgetPassword(input.username).then((users) => {
        let user = users[0];
        if (user === undefined || user.length == 0) {
            if (input.pageTitle == 'forget-password') {
                res.render(`${folderView}forget-password`, {
                    layout: layoutFrontend,
                    errors: [notify.ERROR_FORGET_PASSWORD],
                    pageTitle: 'forget-password'
                });
            } else if (input.pageTitle == 'change-password') {
                res.render(`${folderView}change-password`, {
                    layout: layoutFrontend,
                    errors: [notify.ERROR_CHANGE_PASSWORD],
                    pageTitle: 'change-password'
                });
            }
        } else {
            if (input.email == user.email) {
                // Gửi mail và đổi mật khẩu
                var transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: 'th16news@gmail.com',
                        pass: 'dangkhoihoaitam'
                    }
                });
                if (isValidPassword == true) {
                    console.log('true')
                    var mailOptions = {
                        from: 'th16news@gmail.com',
                        to: user.email,
                        subject: 'Mail xác nhận',
                        html: `<h2>Mật khẩu thay đổi thành công</h2>`    
                    };
                    transporter.sendMail(mailOptions, function(error, info) {
                        if (error) {
                        console.log(error);
                        } else {
                        console.log('Email sent: ' + info.response);
                        }
                    });
                    input.id = user.id;
                    UserModel.saveUser(input, { task: 'edit-password' }).then(() => { //edit-password
                        res.redirect(linkLogout);
                    });
                } else if (isValidPassword == null) {
                    console.log('null')
                    var mailOptions = {
                        from: 'th16news@gmail.com',
                        to: user.email,
                        subject: 'Mail yêu cầu nhập mật khẩu mới nếu muốn thay đổi',
                        html: `<link rel="stylesheet" href="frontend/css/signup_style.css">
                                <div class="signup-form">
                                    <form action="/auth/change-password" method="post">
                                        <h2>Change Password</h2>
                                        <p class="hint-text">Change your password</p>
                                        <div class="form-group">
                                            <div class="input-group">
                                                <div class="input-group-prepend">
                                                    <div class="input-group-text">
                                                        Nhập password mới
                                                    </div>
                                                </div>
                                                <input type="password" class="form-control" name="password" placeholder="Password" required="required">
                                            </div>
                                        </div>
                                        <div class="form-group">
                                            <input name="username" value='${user.username}' type="hidden"/>
                                            <input name="email" value='${user.email}' type="hidden"/>
                                            <input name="pageTitle" value='${input.pageTitle}' type="hidden"/>
                                            <button type="submit" class="btn btn-success btn-lg btn-block signup-btn">Gửi</button>
                                        </div>
                                    </form>
                                </div>`
                        };
    
                      
                      transporter.sendMail(mailOptions, function(error, info) {
                        if (error) {
                          console.log(error);
                        } else {
                          console.log('Email sent: ' + info.response);
                        }
                    });
                } else if (isValidPassword == false) {
                    console.log('false')
                    var transporter = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                          user: 'th16news@gmail.com',
                          pass: 'dangkhoihoaitam'
                        }
                    });
    
                    var mailOptions = {
                        from: 'th16news@gmail.com',
                        to: user.email,
                        subject: 'Mail yêu cầu nhập lại mật khẩu mới khác nếu muốn thay đổi',
                        html: `<link rel="stylesheet" href="frontend/css/signup_style.css">
                                <div class="signup-form">
                                    <form action="/auth/change-password" method="post">
                                        <h2>Change Password</h2>
                                        <p class="hint-text">Change your password</p>
                                        <div class="form-group">
                                            <div class="input-group">
                                                <div class="input-group-prepend">
                                                    <div class="input-group-text">
                                                        Nhập password mới
                                                    </div>
                                                </div>
                                                <input type="password" class="form-control" name="password" placeholder="Password" required="required">
                                            </div>
                                        </div>
                                        <div class="form-group">
                                            <input name="username" value='${user.username}' type="hidden"/>
                                            <input name="email" value='${user.email}' type="hidden"/>
                                            <input name="pageTitle" value='${input.pageTitle}' type="hidden"/>
                                            <button type="submit" class="btn btn-success btn-lg btn-block signup-btn">Gửi</button>
                                        </div>
                                    </form>
                                </div>`
                        };
    
                      
                      transporter.sendMail(mailOptions, function(error, info) {
                        if (error) {
                          console.log(error);
                        } else {
                          console.log('Email sent: ' + info.response);
                        }
                    });
                } 
            } else {
                if (input.pageTitle == 'forget-password') {
                    res.render(`${folderView}forget-password`, {
                        layout: layoutFrontend,
                        errors: [notify.ERROR_FORGET_PASSWORD],
                        pageTitle: 'forget-password'
                    });
                } else if (input.pageTitle == 'change-password') {
                    res.render(`${folderView}change-password`, {
                        layout: layoutFrontend,
                        errors: [notify.ERROR_CHANGE_PASSWORD],
                        pageTitle: 'change-password'
                    });
                }
            }
        }
    })
});


router.get('/change-password', (req, res, next) => {
    res.render(`${folderView}change-password`, {
        layout: layoutFrontend,
        errors: null,
        pageTitle: 'change-password'
    });
});


router.get('/no-permission', /*middleGetUserInfo, middleGetCategoryForMenu, middleArticleRandom,*/ function(req, res, next) {
  res.render(`${folderView}no-permission`, { 
      layout: layoutFrontend, 
      pageTitle: 'ERROR PAGE' 
    });
});

module.exports = router;
