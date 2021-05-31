const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../controllers/UserController');
const JWTstrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;
const bcrypt = require('bcrypt');



passport.use(new LocalStrategy({usernameField: "username"},function(username, password, done){
    User.getUserByName(username).then( async (user)=>{
      
      if (!user) { return done(null, false); } 
      const match = await bcrypt.compare(password, user.password);
      if(match) {
        return done(null, user);
      }else{
        return done(null, false);
      }
    })
}))

passport.use(
    new JWTstrategy(
      {
        secretOrKey: 'TOP_SECRET',
        jwtFromRequest: ExtractJWT.fromUrlQueryParameter('secret_token')
      },
      async (token, done) => {
        try {
          return done(null, token.user);
        } catch (error) {
          done(error);
        }
      }
    )
  );


passport.serializeUser(function(user, done) {
    done(null, user._id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
});


