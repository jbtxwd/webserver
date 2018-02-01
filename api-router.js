var express = require('express');
var imageController = require('./api/image-controller');
var noticeController = require('./api/notice-controller');
var config = require('./config');
var bodyParser = require('body-parser');
var app=express();
var router = express.Router();

var multipart = require('connect-multiparty'); //在处理模块中引入第三方解析模块 
var multipartMiddleware = multipart();

router.get('/test',function(req,res){
	console.log("test ok");
	res.send('test ok');
});

router.post('/photo/upload',multipartMiddleware,function(req,res){
	console.log('start upload'); 
	imageController.upload(req,res);
});

router.post('/photo/setheadicon',function(req,res){
	console.log('start setheadicon'); 
	imageController.setHeadIcon(req,res);
});

router.post('/photo/deletephoto',function(req,res){
	console.log('start setheadicon'); 
	imageController.deletePhoto(req,res);
});

router.post('/photo/downloadphoto',function(req,res){
	console.log('start downloadphoto');
	imageController.downloadPhoto(req,res);
});

router.post('/photo/downloadheadphoto',function(req,res){
	console.log('start downloadheadphoto');
	imageController.downloadHeadPhoto(req,res);
});

router.post('/photo/downloadjson',function(req,res){
	console.log('start downloadjson');
	imageController.downloadJson(req,res);
});
router.post('/photo/downloadBigHeadPhoto',function(req,res){
	console.log('start downloadBigHeadPhoto');
	imageController.downloadBigHeadPhoto(req,res);
});

router.post('/photo/uploaddancegrouptexture',multipartMiddleware, function (req, res) {
    console.log('start uploaddancegrouptexture');
    imageController.uploaddancegrouptexture(req, res);
});

router.post('/photo/downloaddancegrouptexture', function (req, res) {
    console.log('start downloaddancegrouptexture');
    imageController.downloaddancegrouptexture(req, res);
});

router.post('/photo/deleteloaddancegrouptexture', function (req, res) {
    console.log('start deleteloaddancegrouptexture');
    imageController.deleteloaddancegrouptexture(req, res);
});

router.post('/notice/getnoticecontent', function (req, res) {
    noticeController.getnoticecontent(req, res);
});

router.post('/notice/getnoticeimage', function (req, res) {
    noticeController.getnoticeimage(req, res);
});
module.exports = router;