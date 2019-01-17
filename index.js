
var schedule = require('node-schedule');
var express = require('express');
var app = express();
var mysql = require('mysql');
var jwt = require('jsonwebtoken')
var bodyParser = require('body-parser')
var nodemailer = require("nodemailer");

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "sampleDb"
});

app.use(bodyParser.urlencoded({extended:true}));

con.connect(function(err) {
  if (err) {
  	throw err;
  	console.log(err)
  }	
  console.log("Connected!");
});

async function main(n, msg){
	var email
	var sql = "SELECT * FROM doctor_master where ID="+n;
	con.query(sql,function(err,result){
		if(err) throw err;
		email = result[0].email
		console.log("kjne "+email)
		let transporter = nodemailer.createTransport({
		service:'gmail',
		auth: {
		  user: 'megha9673@gmail.com', 
		  pass: ''
		}
		});
		console.log(email)
		let mailOptions = {
			from: 'megha9673@gmail.com', // sender address
			to: email, // list of receivers
			subject: "Hello ✔", // Subject line
			text: msg, // plain text body
			html: '<p>Your html here</p>'
		};
		console.log(mailOptions)
		transporter.sendMail(mailOptions, function (err, info) {
			if(err)
			 console.log('err')
			else
			 console.log("email sent");
		});
	})	



}

async function patient_mail(n){
	var email;
	var sql = "SELECT * FROM patient_master WHERE id="+n;
	con.query(sql,function(err,result){
		if(err) throw err;
		email = result[0].email
		console.log(result)
		console.log('email jdnrdf   '+email)
	})

	let transporter = nodemailer.createTransport({
		service:'gmail',
		auth: {
		  user: 'megha9673@gmail.com', 
		  pass: ''
		}
	});

	let mailOptions = {
	from: 'megha9673@gmail.com', // sender address
	to: email, // list of receivers
	subject: "Hello ✔", // Subject line
	text: "Your feedback is pending.", // plain text body
	html: '<p>Your html here</p>'
	};

	transporter.sendMail(mailOptions, function (err, info) {
		if(err)
		 console.log(err)
		else
		 console.log("email sent");
	});
}
/************************************************************************************************************************************/ 

schedule.scheduleJob('* * * * 4', function(){
	console.log('The answer to life, the universe, and everything!');
	var sql = "SELECT * FROM consultation_master"
	con.query(sql, function (err, result) {
    	if (err) throw err;
    	console.log(result);
    	console.log(result[0].status);
    	var d1 = new Date();
    	result.forEach(function(r){
    		if(r.status==0){
    			var d2 = r.consultation_date
    			var timeDiff = Math.abs(d2.getTime() - d1.getTime());
				var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
				if(diffDays >28 ){
					main(r.doctor_id,"feedback not filled");
				}
				else{
					patient_mail(r.patient_id).catch(console.error);
					console.log('send')
				}
    		}
    	})
    });

});



/***********************************************************************************************************************************/

app.get('/home',function(req,res){
	console.log('11111111')
	res.json({
    	'message': 'registered'
    })
})

app.post('/api/register/doctor',function(req,res){
	console.log('222222222')
	var sql = "INSERT INTO doctor_master (email, password, name) VALUES ('"+req.body.email+"', '"+req.body.password+"','"+ req.body.full_name+"')";
	con.query(sql, function (err, result) {
    	if (err) throw err;
    	console.log("1 record inserted");
    });
    res.json({
    	'message': 'registered'
    })

})

app.post('/api/register/patient',function(req,res){
	var sql = "INSERT INTO patient_master (email, password, name) VALUES ('"+req.body.email+"', '"+req.body.password+"','"+ req.body.full_name+"')";
	con.query(sql, function (err, result) {
    	if (err) throw err;
    	console.log("1 record inserted");
    });
    res.json({
    	'message': 'registered'
    })

})

app.post('/api/consult',function(req,res){
	var sql = "INSERT INTO consultation_master (doctor_id, patient_id, status) VALUES ('"+req.query.d_id+"', '"+req.query.p_id+"', 0)";
	con.query(sql, function (err, result) {
    	if (err) throw err;
    	console.log("1 record inserted");
    });
    res.json({
    	'message': 'registered'
    })
})

app.post('/api/feedback',function(req,res){
	var sql = "SELECT status from consultation_master WHERE doctor_id="+req.query.d_id+" and patient_id="+req.query.p_id;
	con.query(sql, function (err, result) {
    	if (err) throw err;
    	result.status = 1
    });

	main(req.query.d_id,req.body.response)
	res.json('response send to doctor')
})

app.listen(3000)