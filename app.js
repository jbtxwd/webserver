var config = require('./config');
var express = require('express');
var apiRouter=require('./api-router');
var bodyparser=require('body-parser');
var cluster=require('cluster');
var numcpus=require('os').cpus().length;
var http = require('http'); 
var app=express();

app.use(express.static('public'));
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());
app.use('/',apiRouter);

if(cluster.isMaster)
{
	console.log("master start....");
	for(var i=0;i<numcpus;i++){
		cluster.fork();
	}

	cluster.on('listening',function(worker,address){
		console.log('listening:worker'+worker.process.pid+',port:'+address.port);
	});

	cluster.on('exit',function(worker,address,signal){
		console.log('worker'+worker.process.pid +'died');
		cluster.fork();
	});
}
else
{
	var server = app.listen(config.port, function () 
	{
  		var host = server.address().address;
  		var port = server.address().port;
  		console.log('app listening at http://%s:%s', host, port);
	});
}

module.exports = app;