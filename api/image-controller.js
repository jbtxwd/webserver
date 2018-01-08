var fs = require("fs");
var formidable = require("formidable");
var path = require('path');
var md5 = require('MD5');
var dataFormat = require('dataformat');
var bodyParser = require('body-parser');
var config = require('../config');
var images = require("images");
//上传图片
var upload = function(req,res)
{
	fs.readFile(req.files.file.path, function(err, data) 
	{
		var textureMD5 = req.body.textureMD5;
		var serverid = req.body.serverid;
		var playerid=req.body.playerid;
		var index = req.body.index;
		if(!err && textureMD5==md5(data))
		{
			if(serverid && playerid)
			{
				var first = serverid;
				var second=Math.floor(parseInt(playerid) / config.field_max);
				var third = Math.floor(parseInt(playerid) % config.field_max / config.field_min);
				var tmp_path=req.files.file.path;
				console.log('save md5=='+textureMD5);
				var save_folder = config.upload_real + "/" +first.toString()+ "/"+second.toString() + "/" + third.toString();
				var save_path = save_folder+"/"+serverid.toString()+"_"+playerid.toString()+"_"+index.toString()+".jpg";
				var json_path = save_folder+"/"+ serverid.toString()+"_"+playerid.toString()+".json";
				if(mkdirsSync(save_folder,0777)) 
				{
					fs.rename(tmp_path, save_path, function(err) 
					{
  						if (err) 
  						{
  							saveResult(res,'false');
  							console.log("upload photon err");
  						}
  						else 
  						{
  							saveJson(index,textureMD5,json_path);
     						saveResult(res,'true');
  						}
					});
				}
				else 
					saveResult(res,'false');
			}
			else 
				saveResult(res,'false');
		}
		else 
			saveResult(res,'false');
	});
};

var setHeadIcons=function(req,res)//设置小头像
{
	var first = req.body.serverid;
	var second=Math.floor(parseInt(req.body.playerid) / config.field_max);
	var third = Math.floor(parseInt(req.body.playerid) % config.field_max / config.field_min);
	console.log("setHeadIcons");
	var save_folder = config.upload_real + "/" +first.toString()+ "/"+second.toString() + "/" + third.toString();
	var bigTexture_path = save_folder+"/"+ req.body.serverid.toString()+"_"+req.body.playerid.toString()+"_"+req.body.index+".jpg";
	var save_path = save_folder+"/"+ req.body.serverid.toString()+"_"+req.body.playerid.toString()+"_headicon.jpg";
	var json_path = save_folder+"/"+ req.body.serverid.toString()+"_"+req.body.playerid.toString()+".json";
	fs.exists(bigTexture_path,function(exists)//大图存在
	{
		if(exists)
		{
			console.log("exists"+save_path);
			images(bigTexture_path).size(config.headicon_size,config.headicon_size).save(save_path,{quality : 70});
			images.gc();

			fs.readFile(save_path, function(err, buf) 
			{
  				fs.exists(json_path,function(exists)//保存json
				{
					if(exists)
					{
						fs.readFile(json_path,'utf8',function(err,data)
						{
							if(!err)
							{
								var result=JSON.parse(data);
								result.headicon=md5(buf);
								result.headiconindex=req.body.index;
								var final=JSON.stringify(result);
								console.log(final);
								fs.writeFile(json_path,final,function(err)
								{
									saveResult(res,'true');
								})
							}
						})
					}	
					else
					{
						console.log("json not exists!!!!="+json_path);
						saveResult(res,'false');
					}
				});
			});
		}	
		else
		{
			console.log("json not exists!!!!="+json_path);
			saveResult(res,'false');
		}
	});
}

var deletePhoto=function(req,res)
{
	var serverid = req.body.serverid;
	var playerid=req.body.playerid;
	var index = req.body.index;
	if(serverid && playerid && index)
	{
		var first = serverid;
		var second=Math.floor(parseInt(playerid) / config.field_max);
		var third = Math.floor(parseInt(playerid) % config.field_max / config.field_min);
		var save_folder = config.upload_real + "/" +first.toString()+ "/"+second.toString() + "/" + third.toString();
		var save_path = save_folder+"/"+serverid.toString()+"_"+playerid.toString()+"_"+index.toString()+".jpg";
		var json_path = save_folder+"/"+ serverid.toString()+"_"+playerid.toString()+".json";

		fs.unlink(save_path, function(err) 
  		{
  			if(err)
  				console.log(err.toString());
  		});
  		saveJson(index,'0',json_path);
  		saveResult(res,'true');
	}
}

function saveJson(index,value,filepath)
{
	fs.exists(filepath,function(exists)
	{
		if(exists)//存在，写入
		{
			fs.readFile(filepath,'utf8',function(err,data){
				if(err)
					console.log("false");
				else
				{
					var result=JSON.parse(data);
					if(index>result.data.length)
					{
						for(i=result.data.length;i<index;i++)
						{
							result.data[i]='0';
						}
					}
					result.data[index-1]=value;
					if( result.headicon==index && value=='0')
						result.headicon='0';
					var final=JSON.stringify(result);
					fs.writeFile(filepath,final,function(err){
						if(err)
							console.log('---');
						else 
							console.log('------');
					})
				}
			});
		}
		else //不存在，创建
		{
			var array=new Array();
			for(i=0;i<config.photo_max;i++)
			{
				if(i+1==index)
					array[i]=value;
				else
					array[i]='0';
			}
			var jsondata = {data:array,headicon:0};
			var final = JSON.stringify(jsondata);

			fs.writeFile(filepath, final,function(err){
    			if(err)
    	 			console.log('写文件操作失败');
    			else 
    				console.log('写文件操作成功');
			});
		}
	});
}

var downloadPhoto = function(req,res)
{
	var serverid = req.body.serverid;
	var playerid=req.body.playerid;
	var index = req.body.index;
	if(index==10086)
	{
		console.log('10086');
	}
	var textureMD5 = req.body.textureMD5;
	if(serverid && playerid && index)
	{
		var first = serverid;
		var second=Math.floor(parseInt(playerid) / config.field_max);
		var third = Math.floor(parseInt(playerid) % config.field_max / config.field_min);
		var save_folder = config.upload_real + "/" +first.toString()+ "/"+second.toString() + "/" + third.toString();
		var save_path = save_folder+"/"+serverid.toString()+"_"+playerid.toString()+"_"+index.toString()+".jpg";

		fs.exists(save_path,function(exists)
		{
			if(exists)
			{
				fs.readFile(save_path,function(err,data)
				{
					console.log('download md5 ='+md5(data));
					if(textureMD5 &&md5(data) == textureMD5)   
					{
						saveResult(res,"same");
					}
					else 
					{
						res.setHeader("Content-Type", "image/jpg");
						res.writeHead(200, "Ok");
						res.write(data,"binary"); //格式必须为 binary，否则会出错
						res.end();
					}
				});
			}
			else 
				saveResult(res,'false');
		});
	}
}

var downloadBigHeadPhoto = function(req,res)//下载头像对应的大图
{
	var serverid = req.body.serverid;
	var playerid=req.body.playerid;
	//var index;
	var first = serverid;
	var second=Math.floor(parseInt(playerid) / config.field_max);
	var third = Math.floor(parseInt(playerid) % config.field_max / config.field_min);
	var save_folder = config.upload_real + "/" +first.toString()+ "/"+second.toString() + "/" + third.toString();
	var json_path = save_folder+"/"+ serverid.toString()+"_"+playerid.toString()+".json";

	//index=config.headicon_index;
	if(mkdirsSync(save_folder,0777)) 
	{
		fs.exists(json_path,function(exists)
		{
			if(exists)//存在，写入
			{
				fs.readFile(json_path,'utf8',function(err,data)
				{
					if(err)
					{
						console.log("false");
						saveResult(res,'false');
					}
					else
					{
						var jsonData = JSON.parse(data);
						var index = jsonData.headiconindex;

						if(serverid && playerid)
						{
							var save_path = save_folder+"/"+serverid.toString()+"_"+playerid.toString()+"_"+index+".jpg";
							fs.exists(save_path,function(exists)
							{
								if(exists)
								{
									fs.readFile(save_path,function(err,data)
									{
										res.setHeader("Content-Type", "image/jpg");
										res.writeHead(200, "Ok");
										res.write(data,"binary"); //格式必须为 binary，否则会出错
										console.log("下载头像成功");
										res.end();
									});
								}
								else
								{
									saveResult(res,'false');
								}
							});
						}
					}
				});
			}
			else //不存在，返回false
			{
				saveResult(res,'false');
			}
		});
	}
}

var downloadHeadPhoto = function(req,res)
{
	var serverid = req.body.serverid;
	var playerid=req.body.playerid;
	//var index;
	var first = serverid;
	var second=Math.floor(parseInt(playerid) / config.field_max);
	var third = Math.floor(parseInt(playerid) % config.field_max / config.field_min);
	var save_folder = config.upload_real + "/" +first.toString()+ "/"+second.toString() + "/" + third.toString();
	var json_path = save_folder+"/"+ serverid.toString()+"_"+playerid.toString()+".json";

	//index=config.headicon_index;

	if(serverid && playerid)
	{
		var save_path = save_folder+"/"+serverid.toString()+"_"+playerid.toString()+"_headicon.jpg";
		fs.exists(save_path,function(exists)
		{
			if(exists)
			{
				fs.readFile(save_path,function(err,data)
				{
					res.setHeader("Content-Type", "image/jpg");
					res.writeHead(200, "Ok");
					res.write(data,"binary"); //格式必须为 binary，否则会出错
					console.log("下载头像成功");
					res.end();
				});
			}
			else
			{
				saveResult(res,'false');
			}
		});
	}
}

var downloadJson=function(req,res)
{
	var serverid = req.body.serverid;
	var playerid=req.body.playerid;
	var finalJson;
	if(serverid && playerid)
	{
		var first = serverid;
		var second=Math.floor(parseInt(playerid) / config.field_max);
		var third = Math.floor(parseInt(playerid) % config.field_max / config.field_min);
		var save_folder = config.upload_real + "/" +first.toString()+ "/"+second.toString() + "/" + third.toString();
		var json_path = save_folder+"/"+ serverid.toString()+"_"+playerid.toString()+".json";
		console.log(json_path);
		if(mkdirsSync(save_folder,0777)) 
		{
			fs.exists(json_path,function(exists)
			{
				if(exists)//存在，写入
				{
					fs.readFile(json_path,'utf8',function(err,data)
					{

						if(err)
							console.log("false");
						else
						{
							var jsonData = JSON.parse(data);
							jsonData.photomax=config.photo_max;
							var final=JSON.stringify(jsonData);
							saveResult(res,final);
						}
					});
				}
				else //不存在，创建
				{
					console.log("创建json,playerid="+playerid);
					var array=new Array();
					for(i=0;i<config.photo_max;i++)
					{
						array[i]='0';
					}
					var jsondata = {data:array,headicon:0,photomax:config.photo_max};
					finalJson = JSON.stringify(jsondata);			
					//fs.writeFile(json_path, finalJson,function(err)
					//{
    				//	if(err)
    	 			//		console.log('写文件操作失败');
    				//	else 
    				//		console.log('写文件操作成功');
					//});
					console.log("creat json = "+finalJson);
					saveResult(res,finalJson);
				}
			});
		}
	}
}

function saveResult(res,data)
{
	res.writeHead(200);
	res.write(data);
	res.end();
}

//创建多层文件夹 同步
function mkdirsSync(dirname, mode)
{
    if(fs.existsSync(dirname))
    {
        return true;
    }
    else
    {
        if(mkdirsSync(path.dirname(dirname), mode))
        {
            fs.mkdirSync(dirname, mode);
            return true;
        }
    }
}

//上传舞团团徽
var uploaddancegrouptexture = function(req,res)
{
	fs.readFile(req.files.file.path, function(err, data) 
	{
		//var textureMD5 = req.body.textureMD5;
		var serverid = req.body.serverid;
		var groupid=req.body.groupid;
		//var index = req.body.index;
		if(!err)
		{
			if(serverid && groupid)
			{
				var first = serverid;
				var second=Math.floor(parseInt(groupid) / config.field_max);
				var third = Math.floor(parseInt(groupid) % config.field_max / config.field_min);
				var tmp_path=req.files.file.path;
                //console.log('save md5=='+textureMD5);
                var save_folder = config.upload_groupimagepath + "/" + first.toString() + "/" + second.toString() + "/" + third.toString();
				var save_path = save_folder+"/"+serverid.toString()+"_"+groupid.toString()+".jpg";
				//var json_path = save_folder+"/"+ serverid.toString()+"_"+groupid.toString()+".json";
				if(mkdirsSync(save_folder,0777)) 
				{
					fs.rename(tmp_path, save_path, function(err) 
					{
  						if (err) 
  						{
  							saveResult(res,'false');
  							console.log("upload photon err");
  						}
  						else 
  						{
  							//saveJson(index,textureMD5,json_path);
     						saveResult(res,'true');
  						}
					});
				}
				else 
					saveResult(res,'false');
			}
			else 
				saveResult(res,'false');
		}
		else 
			saveResult(res,'false');
	});
};


//下载舞团团徽
var downloaddancegrouptexture = function(req,res)
{
	var serverid = req.body.serverid;
	var groupid=req.body.playerid;
	//var index;
	var first = serverid;
	var second=Math.floor(parseInt(groupid) / config.field_max);
    var third = Math.floor(parseInt(groupid) % config.field_max / config.field_min);
    var save_folder = config.upload_groupimagepath + "/" + first.toString() + "/" + second.toString() + "/" + third.toString();
	//var json_path = save_folder+"/"+ serverid.toString()+"_"+groupid.toString()+".json";

	//index=config.headicon_index;

	if(serverid && groupid)
	{
		var save_path = save_folder+"/"+serverid.toString()+"_"+groupid.toString()+".jpg";
		fs.exists(save_path,function(exists)
		{
			if(exists)
			{
				fs.readFile(save_path,function(err,data)
				{
					res.setHeader("Content-Type", "image/jpg");
					res.writeHead(200, "Ok");
					res.write(data,"binary"); //格式必须为 binary，否则会出错
					console.log("下载舞团团徽成功");
					res.end();
				});
			}
			else
			{
				saveResult(res,'false');
			}
		});
	}
};

//删除舞团团徽
var deleteloaddancegrouptexture = function(req,res)
{
    var serverid = req.body.serverid;
    var groupid = req.body.groupid;
    //var index = req.body.index;
    if (serverid && groupid) {
        var first = serverid;
        var second = Math.floor(parseInt(groupid) / config.field_max);
        var third = Math.floor(parseInt(groupid) % config.field_max / config.field_min);
        var save_folder = config.upload_groupimagepath + "/" + first.toString() + "/" + second.toString() + "/" + third.toString();
        var save_path = save_folder + "/" + serverid.toString() + "_" + groupid.toString() +".jpg";
        //var json_path = save_folder + "/" + serverid.toString() + "_" + groupid.toString() + ".json";

        fs.unlink(save_path, function (err) {
            if (err)
                console.log(err.toString());
        });
        saveJson(index, '0', json_path);
        saveResult(res, 'true');
    }
};
exports.upload=upload;
exports.setHeadIcon=setHeadIcons;
exports.deletePhoto=deletePhoto;
exports.downloadPhoto=downloadPhoto;
exports.downloadJson=downloadJson;
exports.downloadHeadPhoto=downloadHeadPhoto;
exports.downloadBigHeadPhoto=downloadBigHeadPhoto;
exports.uploaddancegrouptexture=uploaddancegrouptexture;
exports.downloaddancegrouptexture=downloaddancegrouptexture;
exports.deleteloaddancegrouptexture=deleteloaddancegrouptexture;