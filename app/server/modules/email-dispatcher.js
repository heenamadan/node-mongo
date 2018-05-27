
var EM = {};
module.exports = EM;
//npm install --save gmail-send
//var EM=module.exports={};

//var nodemailer = require('nodemailer');

EM.server = require("emailjs/email").server.connect(
{
	host 	    : process.env.EMAIL_HOST || 'smtp.gmail.com',
	user 	    : process.env.EMAIL_USER || 'heena.madan4@gmail.com',
	password    : process.env.EMAIL_PASS || 'password',
	ssl		    : true
});


EM.dispatchResetPasswordLink = function(account, callback)
{
  EM.server.send({
    from         : process.env.EMAIL_FROM || 'heena.madan4@gmail.com',
    to           : account.email,
    subject      : 'Password Reset',
    text         : 'something went wrong... :(',
    attachment   : EM.composeEmail(account)
  }, callback );
}


/*EM.dispatchResetPasswordLink = function(account, callback)
{
var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'heena.madan4@gmail.com', // Your email id
            pass: 'password' // Your password
        }
    });

	var mailOptions = {
  from: 'heena.madan4@gmail.com',
  to: account.email,
  subject      : 'Password Reset',
  text         : 'something went wrong... :(',
  //text   : EM.composeEmail(account)
};
console.log(mailOptions.to);

	transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});

}*/



EM.composeEmail = function(o)
{
	var link = 'http://localhost:3002/reset-password?e='+o.email+'&p='+o.pass;
  console.log("password-->"+ o.pass);
	var html = "<html><body>";
		html += "Hi "+o.name+",<br><br>";
		html += "Your username is <b>"+o.user+"</b><br><br>";
		html += "<a href='"+link+"'>Click here to reset your password</a><br><br>";
		html += "Cheers,<br>";
		html += "Heena";
		html += "</body></html>";
	return  [{data:html, alternative:true}];
}