const UserModel = require(__path_models + 'users');
const notify = require(__path_configs + 'notify');
const bcrypt = require('bcrypt');
var LocalStrategy = require('passport-local').Strategy;

module.exports = (passport) => {
  passport.use(new LocalStrategy(
    (username, password, done) => {
      UserModel.getUserByUsername(username).then((users) => {
        let user = users[0];
        if (user === undefined || user.length == 0) {
          return done(null, false, { message: notify.ERROR_LOGIN });
        } else {
          bcrypt.genSalt(10, function (err, salt) {
            bcrypt.hash(password, salt, function (err, hash) {
              bcrypt.compare(password, user.password, function (err, res) {
                  if (res) {
                    return done(null, user);
                  } else {
                    return done(null, false, { message: notify.ERROR_LOGIN });
                  }
              })
            })
          })
        }
      })
    }
  ));

  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser((id, done) => {
    UserModel.getUser(id, null).then((user) => {
      done(null, user);
    })
  })
}