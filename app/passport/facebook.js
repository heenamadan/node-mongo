var FacebookStrategy = require('passport-facebook').Strategy;
var User = require('../models/user');
var fbConfig = require('./fb.js');


module.exports = function(passport) {

    passport.use('facebook', new FacebookStrategy({
        clientID        : '1123596914332099',
        clientSecret    : 'aa20ae08a8136de3a659a262e92dfd78',
        profileFields: ['id', 'email', 'name', 'photos','displayName'],
        callbackURL     : 'http://localhost:3002/login/facebook/callback'
    },

    // facebook will send back the tokens and profile
    function(access_token, refresh_token, profile, done) {

    	console.log('profile', profile);

		// asynchronous
		process.nextTick(function() {

			// find the user in the database based on their facebook id
	        User.findOne({ 'fb.id' : profile.id }, function(err, user) {
	        	console.log("profile id---->"+profile.id);
	        	//db.getCollection('users').find({"fb.id" : "1042480182470899"})

	        	// if there is an error, stop everything and return that
	        	// ie an error connecting to the database
	            if (err)
	                return done(err);

				// if the user is found, then log them in
	            if (user) {
	                return done(null, user); // user found, return that user
	            } else {
	                // if there is no user found with that facebook id, create them
	                var newUser = new User();
	               

					// set all of the facebook information in our user model
	                newUser.fb.id    = profile.id; // set the users facebook id	                
	                newUser.fb.access_token = access_token; // we will save the token that facebook provides to the user	                
	                newUser.fb.name  = profile.displayName;
	                console.log("name-->"+profile.displayName);
	                newUser.fb.firstName  = profile.name.givenName;
	                newUser.fb.lastName = profile.name.familyName; // look at the passport user profile to see how names are returned
	                //newUser.fb.email = profile.emails[0].value; // facebook can return multiple emails so we'll take the first
					newUser.fb.email = profile.email;
					emails: [
                    {value:profile._json.email, type:'home'}
                ];
                newUser.fb.email = profile.emails[0].value;
                console.log(newUser.fb.email);
					// save our user to the database
	                newUser.save(function(err) {
	                    if (err)
	                        throw err;
	                    // if successful, return the new user
	                    return done(null, newUser);
	                });
	            }

	        });
        });

    }));

};
