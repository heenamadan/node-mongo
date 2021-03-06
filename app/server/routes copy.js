
var CT = require('./modules/country-list');
var AM = require('./modules/account-manager');
var FB = require('./modules/read_dir');
var EM = require('./modules/email-dispatcher');
var multer = require('multer');
var path = require('path');
var express = require('express');
var router = express.Router();
var fs = require('fs');
var jwt = require('jsonwebtoken');

var isAuthenticated = function (req, res, next) {
	// if user is authenticated in the session, call the next() to call the next request handler 
	// Passport adds this method to request object. A middleware is allowed to add properties to
	// request and response objects
	if (req.isAuthenticated())
		return next();
	// if the user is not authenticated then redirect him to the login page
	res.redirect('/');
}

var postLogin = function(req, res) {
	AM.manualLogin(req.body['user'], req.body['pass'], function(e, o){
			console.log("in post---");
			if (!o){
				res.status(400).send(e);
			}	else{
				req.session.user = o;
				if (req.body['remember-me'] == 'true'){
					res.cookie('user', o.user, { maxAge: 900000 });
					res.cookie('pass', o.pass, { maxAge: 900000 });
				}
				res.status(200).send(o);
			}
		});
}

// List all files in a directory in Node.js recursively in a synchronous fashion
     var walkSync = function(dir, filelist) {
            var path = path || require('path');
            var fs = fs || require('fs'),
                files = fs.readdirSync(dir);
            filelist = filelist || [];
            files.forEach(function(file) {
                if (fs.statSync(path.join(dir, file)).isDirectory()) {
                    filelist = walkSync(path.join(dir, file), filelist);
                }
                else {
                    filelist.push(path.join(dir, file));
                }
            });
            return filelist;
        };


module.exports = function(passport) {

	var storage = multer.diskStorage({

	destination: function(req, file, callback) {
		callback(null, '/Users/heena.madan/nodejs/uploads')
	},
	filename: function(req, file, callback) {
		console.log(file)
		callback(null, Date.now() + "-" + file.originalname)
	}
});

	//path.extname(file.originalname)

// main login page //
	router.get('/', function(req, res){
		console.log("sign in called--");
		/*if(req.session.page_views){
      req.session.page_views++;
      res.send("You visited this page " + req.session.page_views + " times");
   } else {
      req.session.page_views = 1;
      res.send("Welcome to this page for the first time!");
   }*/


	// check if the user's credentials are saved in a cookie //
		if (req.cookies.user == undefined || req.cookies.pass == undefined) {
			res.render('login', { title: 'Hello - Please Login To Your Account' });
		}	else{
			console.log("in get---");
	// attempt automatic login //
			AM.autoLogin(req.cookies.user, req.cookies.pass, function(o){
				if (o != null){
				    req.session.user = o;
					res.redirect('/home');
				}	else{
					res.render('login', { title: 'Hello - Please Login To Your Account' });
				}
			});
		}
	});
	
	/*router.post('/', function(req, res){
		AM.manualLogin(req.body['user'], req.body['pass'], function(e, o){
			console.log("in post---");
			if (!o){
				res.status(400).send(e);
			}	else{
				req.session.user = o;

			    res.json({ token: jwt.sign({ email: o.user, fullName: o.name, _id: o._id }, 'RESTFULAPIs') });
				
				if (req.body['remember-me'] == 'true'){
					res.cookie('user', o.user, { maxAge: 900000 });
					res.cookie('pass', o.pass, { maxAge: 900000 });
				}
				res.status(200).send(o);
			}
		});
	//postLogin(req, res);
	});
*/


router.post('/', function(req, res){
	var username=req.body['user'];
	var pass=req.body['pass'];
		AM.manualLoginTest(username, pass, function(e, o){
			console.log("in post---");
			if (!o){
				res.status(400).send(e);
			} else{
			req.session.user = o;
			var token = jwt.sign({ email: o.email,  name: o.user }, 'RESTFULAPIs');
			console.log("token--"+jwt.sign({ email: o.email,  name: o.user }, 'RESTFULAPIs'));
			console.log("email name-"+ o.email);
			console.log("pass-"+ o.pass);
			console.log("user name-"+ o.user);
			req.session.token = token;
		 return res.json({ token: jwt.sign({ email: o.email, name: o.user }, 'RESTFULAPIs') });
			}
			//es.status(200).send(o);
		
		});
	//postLogin(req, res);
	});

	
	
// logged-in user homepage //
	
	router.get('/home', function(req, res) {
		if (req.session.user == null){
	// if user is not logged-in redirect back to login page //
			res.redirect('/');
		}	else{
			console.log("---->>"+req.session.user._id);
			res.render('home', {
				title : 'Control Panel',
				countries : CT,
				udata : req.session.user
			});
		}
	});


	router.get('/upload', function(req, res) {
		res.render('upload-form', {  title: 'upload files'});
	});


	router.post('/home', function(req, res){
		if (req.session.user == null){
			res.redirect('/');
		}	else{
			console.log("id-->"+req.session.user._id);
			AM.updateAccount({
				id		: req.session.user._id,
				name	: req.body['name'],
				email	: req.body['email'],
				pass	: req.body['pass'],
				country	: req.body['country']
			}, function(e, o){
				if (e){
					res.status(400).send('error-updating-account');
				}	else{
					req.session.user = o;
			// update the user's login cookies if they exists //
					if (req.cookies.user != undefined && req.cookies.pass != undefined){
						res.cookie('user', o.user, { maxAge: 900000 });
						res.cookie('pass', o.pass, { maxAge: 900000 });	
					}
					res.status(200).send('ok');
				}
			});
		}
	});

	router.post('/logout', function(req, res){
		res.clearCookie('user');
		res.clearCookie('pass');
		req.session.destroy(function(e){ res.status(200).send('ok'); });
	})
	
// creating new accounts //
	
	router.get('/signup', function(req, res) {
		res.render('signup', {  title: 'Signup', countries : CT });
	});
	
	router.post('/signup', function(req, res){
		AM.addNewAccount({
			name 	: req.body['name'],
			email 	: req.body['email'],
			user 	: req.body['user'],
			pass	: req.body['pass'],
			country : req.body['country'],
			loginFrom : "web"
		}, function(e){
			if (e){
				res.status(400).send(e);
			}	else{
				res.status(200).send('ok');
			}
		});
	});

// password reset //

	router.post('/lost-password', function(req, res){
	// look up the user's account via their email //
		AM.getAccountByEmail(req.body['email'], function(o){
			if (o){
				EM.dispatchResetPasswordLink(o, function(e, m){
				// this callback takes a moment to return //
				// TODO add an ajax loader to give user feedback //
					if (!e){
						res.status(200).send('ok');
					}	else{
						for (k in e) console.log('ERROR : ', k, e[k]);
						res.status(400).send('unable to dispatch password reset');
					}
				});
			}	else{
				res.status(400).send('email-not-found');
			}
		});
	});

	router.get('/reset-password', function(req, res) {
		var email = req.query["e"];
		var passH = req.query["p"];
		AM.validateResetLink(email, passH, function(e){
			if (e != 'ok'){
				res.redirect('/');
			} else{
	// save the user's email in a session instead of sending to the client //
				req.session.reset = { email:email, passHash:passH };
				res.render('reset', { title : 'Reset Password' });
			}
		})
	});
	
	router.post('/reset-password', function(req, res) {
		var nPass = req.body['pass'];
	// retrieve the user's email from the session to lookup their account and reset password //
		var email = req.session.reset.email;
	// destory the session immediately after retrieving the stored email //
		req.session.destroy();
		AM.updatePassword(email, nPass, function(e, o){
			if (o){
				res.status(200).send('ok');
			}	else{
				res.status(400).send('unable to update password');
			}
		})
	});
	
// view & delete accounts //
	
	router.get('/print', function(req, res) {
		AM.getAllRecords( function(e, accounts){
			res.render('print', { title : 'Account List', accts : accounts });
		})
	});

	router.get('/showfiles', function(req, res) {
		var fileList = walkSync("/Users/heena.madan/nodejs/uploads",[]);
		res.render('showfiles', { title : 'File List', files : fileList });
	});

	
	
	router.post('/delete', function(req, res){
		AM.deleteAccount(req.body.id, function(e, obj){
			if (!e){
				res.clearCookie('user');
				res.clearCookie('pass');
				req.session.destroy(function(e){ res.status(200).send('ok'); });
			}	else{
				res.status(400).send('record not found');
			}
	    });
	});
	
	router.get('/reset', function(req, res) {
		AM.delAllRecords(function(){
			res.redirect('/print');	
		});
	});


	/*router.post('/file', function(req, res) {
		console.log("kkkll");
	var upload = multer({
		storage: storage
	}).single('upl')
	upload(req, res, function(err) {
		res.end('File is uploaded')
	})
});*/


	router.post('/fileUpload', function(req, res) {
		
	var upload = multer({
		storage: storage,
		fileFilter: function(req, file, callback) {
			var ext = path.extname(file.originalname)
			if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
				return callback(res.end('Only images are allowed'), null)
				//alert("Only images are allowed");
			}
			callback(null, true)
		}
	}).single('upl')
	upload(req, res, function(err) {
		//res.end('File is uploaded')
		if (err){
				res.status(400).send(err);
			}	else{
				res.status(200).send('ok');
			}
	})
});


	//Passport Router
/*router.get('/auth/facebook', passport.authenticate('facebook'));
router.get('/auth/facebook/callback',
  passport.authenticate('facebook', { 
       successRedirect : '/', 
       failureRedirect: '/login' 
  }),
  function(req, res) {
    res.redirect('/');
  });*/


	router.get('/dashboard', function(req, res){
  res.header('Cache-Control', 'no-cache');

  res.render('dashboard', {
    username: req.session.user
  });
});


	// route for facebook authentication and login
	// different scopes while logging in
	router.get('/login/facebook', 
		passport.authenticate('facebook', { scope : 'email' }
	));

	// handle the callback after facebook has authenticated the user
	router.get('/login/facebook/callback',
		passport.authenticate('facebook', {
			successRedirect : '/facebook',
			failureRedirect : '/'
		})
	);

	router.get('/login/twitter', 
		passport.authenticate('twitter'));

router.get('/login/twitter/callback',
		passport.authenticate('twitter', {
			successRedirect : '/twitter',
			failureRedirect : '/'
		})
	);

router.get('/twitter', isAuthenticated, function(req, res){
		res.render('twitter', { user: req.user });
	});

router.get('/facebook', isAuthenticated, function(req, res){
	//console.log("isAuthenticated" + isAuthenticated);
	console.log("user------>"+req.user);
	AM.addNewAccount({
		//_id : req.user.id,
			name 	: req.user.fb.firstName + " "+ req.user.fb.lastName,
			email 	: req.user.fb.email,
			user 	: req.user.fb.firstName,
			pass	: "",
			country : "",
			loginFrom : "fb"
		}, function(e){
			console.log("adding to accounts collection..");
		});

	AM.manualLogin(req.user.fb.firstName, "" ,function(e, o){
		//console.log(o.firstName);
			//console.log("in post---"+o.name +"---"+o.user +"---"+o.email);

			if (!o){
				res.status(400).send(e);
			}	else{
				console.log("-->"+ o);
				req.session.user = o;
				res.redirect('/home');
				//res.status(200).send(o);
			}
		});
	


	/*AM.addNewAccount({
			name 	: profile.displayName,
			email 	: profile.email,
			user 	: profile.displayName,
			pass	: "",
			country : ""
		}, function(e){
			if (e){
				res.status(400).send(e);
			}	else{
				res.status(200).send('ok');
			}
		});*/

		//res.render('home', { user: req.user });
		//req.session.user = req.user;
		//req.session.fb= "fb";
		//postLogin(req, res);
		
	});
	
	


	router.get('*', function(req, res) { res.render('404', { title: 'Page Not Found'}); });

return router;
};

