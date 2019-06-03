const StringHelpers = require(__path_helpers + 'strings');
const systemConfig = require(__path_configs + 'system');
const UserModel = require(__path_models + 'users');
const linkLogin = StringHelpers.formatLink('/' + systemConfig.prefixFrontend + `/auth/login/`);
const linkNoPermission = StringHelpers.formatLink('/' + systemConfig.prefixFrontend + `/auth/no-permission/`);

let writer = (req, res, next) => {
    if (req.isAuthenticated()) {
        UserModel.getUser(req.user.id).then((user) => {
            if (user.status == "Hoạt động" && user.position == 'Phóng viên') {
                next();
            } else {
                res.redirect(linkNoPermission);
            }
        })
    } else {
        res.redirect(linkLogin);
    }
}

let editor = (req, res, next) => {
    if (req.isAuthenticated()) {
        UserModel.getUser(req.user.id).then((user) => {
            if (user.status == "Hoạt động" && user.position == 'Biên tập viên') {
                next();
            } else {
                res.redirect(linkNoPermission);
            }
        })
    } else {
        res.redirect(linkLogin);
    }
}


let administrator = (req, res, next) => {
    if (req.isAuthenticated()) {
        UserModel.getUser(req.user.id).then((user) => {
            if (user.status == "Hoạt động" && user.position == 'Quản trị viên') {
                next();
            } else {
                res.redirect(linkNoPermission);
            }
        })
    } else {
        res.redirect(linkLogin);
    }
}

module.exports = {
    writer,
    editor,
    administrator
}