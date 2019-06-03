module.exports = (req, res, next) => {
    let userInfo = {};
    if (req.isAuthenticated()) {
        userInfo = req.user; //truyền ra views
    }
    res.locals.userInfo = userInfo;
    next();
}