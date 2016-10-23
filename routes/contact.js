
// var nodemailer = require('nodemailer');
// var smtpTransport = require('nodemailer-smtp-transport');
// var clipboard = require('ngClipboard');

// var clipboard = require('clipboard');

// sendgrid password Qv9ffUVFcI5Y
// sendgrid username Arcadian

// var transporter = nodemailer.createTransport(smtpTransport({
/* 

var transporter = nodemailer.createTransport({
    transport:'SMTP',
    options: {
        host:'127.0.0.1',
        service:'MashoverSMTPService'
    }
});
 */

/*  
    host: 'localhost',
    port: 25 //,
    // auth: {
        // user: 'username',
        // pass: 'password'
    // }
});
*/

/* 
    {
    service: 'Gmail',
    auth: {
        user: 'gmail.user@gmail.com',  //'Michael.Hatmaker@gmail.com',
        pass: 'userpass'              //'Kahalani'
    }
});
    */

var mailOptions = {
    from: 'Mash Over ✔ <Michael.Hatmaker@gmail.com>', // sender address
    to: 'bar@blurdybloop.com, baz@blurdybloop.com', // list of receivers
    subject: 'Hello ✔', // Subject line
    text: 'Hello world ✔', // plaintext body
    html: '<b>MashOver user has sent you a link to a great map ✔</b>' // html body
};



function process(req, res) {
    console.log('I Made it to Express');

    console.log('%s %s %s', req.method, req.url, req.path);
    console.log('req.body.name %s', req.body.name);
    console.log('req.body.email is %s', req.body.email);
    console.log('req.body.message is %s', req.body.message);
    
    mailOptions.to = req.body.email;
    mailOptions.text = req.body.message;
    
    clipboard.write(mailOptions.text);
/*     
    // nodemailer.sendmail = true;
    transporter.sendMail(mailOptions, function(error, info){
    if(error){
        console.log(error);
    }else{
        console.log('Message sent: ' + info.response);
    }
});
 */
}
exports.process = process;