var fs = require("fs");
var formidable = require("formidable");
var path = require('path');
var md5 = require('MD5');
var dataFormat = require('dataformat');
var bodyParser = require('body-parser');
var config = require('../config');
var images = require("images");

var getnoticecontent = function(req,res)
{
    var reqmd5 = req.body.md5;
   
    
    var save_path = config.upload_notice + "/notice.txt";
    console.log(save_path);
    fs.exists(save_path,function(exists)
    {
        if(exists)//存在，读取
        {
            fs.readFile(save_path,'utf8',function(err,data)
            {
                if(err)
                {
                    saveResult(res,"none");
                }
                else
                {
                    console.log(reqmd5+"----"+md5(data));
                    if(reqmd5==md5(data))
                    {
                        saveResult(res,"same");
                    }
                    else
                    {
                        saveResult(res,data);
                    }
                }
            });
        }
        else //不存在，创建
        {
            saveResult(res,"none");
        }
    });
};

var getnoticeimage = function(req,res)
{
    var reqmd5 = req.body.md5;
    console.log(reqmd5);
    
    var save_path = config.upload_notice + "/notice.png";
    console.log(save_path);
    fs.exists(save_path,function(exists)
    {
        if(exists)//存在，读取
        {
            fs.exists(save_path,function(exists)
            {
                if(exists)
                {
                    fs.readFile(save_path,function(err,data)
                    {
                        if(reqmd5==md5(data))
                        {
                            saveResult(res,'same');
                        }
                        else
                        {
                            res.setHeader("Content-Type", "image/png");
                            res.writeHead(200, "Ok");
                            res.write(data,"binary"); //格式必须为 binary，否则会出错
                            console.log("下载舞团团徽成功");
                            res.end();
                        }
                    });
                }
                else
                {
                    saveResult(res,'none');
                }
            });
        }
        else //不存在，创建
        {
            saveResult(res,"none");
        }
    });
};

function saveResult(res,data)
{
	res.writeHead(200);
	res.write(data);
	res.end();
}
exports.getnoticecontent=getnoticecontent;
exports.getnoticeimage=getnoticeimage;