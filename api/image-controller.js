var fs = require("fs");
var formidable = require("formidable");
var path = require('path');
var md5 = require('MD5');
var dataFormat = require('dataformat');
var bodyParser = require('body-parser');
var config = require('../config');

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

var setHeadIcon=function(req,res)
{
	var first = req.body.serverid;
	var second=Math.floor(parseInt(req.body.playerid) / config.field_max);
	var third = Math.floor(parseInt(req.body.playerid) % config.field_max / config.field_min);
	console.log(req.body.serverid);
	var save_folder = config.upload_real + "/" +first.toString()+ "/"+second.toString() + "/" + third.toString();
	var save_path = save_folder+"/"+ req.body.serverid.toString()+"_"+req.body.playerid.toString()+"_"+req.body.index.toString()+".jpg";
	var json_path = save_folder+"/"+ req.body.serverid.toString()+"_"+req.body.playerid.toString()+".json";
	fs.exists(json_path,function(exists)
	{
		if(exists)
		{
			fs.readFile(json_path,'utf8',function(err,data)
			{
				if(!err)
				{
					var result=JSON.parse(data);
					result.headicon=req.body.index.toString();
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
				//var readStream=fs.createReadStream(save_path);
				//readStream.pipe(res);
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


var downloadHeadPhoto = function(req,res)
{
	var serverid = req.body.serverid;
	var playerid=req.body.playerid;
	var index;
	var first = serverid;
	var second=Math.floor(parseInt(playerid) / config.field_max);
	var third = Math.floor(parseInt(playerid) % config.field_max / config.field_min);
	var save_folder = config.upload_real + "/" +first.toString()+ "/"+second.toString() + "/" + third.toString();
	var json_path = save_folder+"/"+ serverid.toString()+"_"+playerid.toString()+".json";

	fs.exists(json_path,function(exists)//先读取json中headicon是哪个
	{
		if(exists)
		{
			fs.readFile(json_path,'utf8',function(err,data)
			{
				if(err)
				{
					saveResult(res,'false');
					console.log("读取玩家json信息失败,serverid="+serverid);
				}
				else
				{
					//var finalJson=data;
					var result=JSON.parse(data);
					if(result.headicon!='0')
					{
						index=result.headicon;

						if(serverid && playerid && index)
						{
							var save_path = save_folder+"/"+serverid.toString()+"_"+playerid.toString()+"_"+index.toString()+".jpg";
							console.log(save_path);
							fs.exists(save_path,function(exists)
							{
								if(exists)
								{
									fs.readFile(save_path,function(err,data)
									{
										res.setHeader("Content-Type", "image/jpg");
										res.writeHead(200, "Ok");
										res.write(data,"binary"); //格式必须为 binary，否则会出错
										res.end();
									});
								}
								else 
									saveResult(res,'false');
							});
						}
					}
					else
					{
						saveResult(res,'false');
						console.log("玩家没设置headicon");
					}
				}
			});
		}
		else//从未上传头像
		{
			saveResult(res,'false');
			console.log("从未上传头像");
		}
	});


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
							//var jsonData = JSON.parse(data);
							finalJson=data;
							saveResult(res,finalJson);
						}
					});
				}
				else //不存在，创建
				{
					var array=new Array();
					for(i=0;i<config.photo_max;i++)
					{
						array[i]='0';
					}
					var jsondata = {data:array,headicon:0};
					finalJson = JSON.stringify(jsondata);			
					//fs.writeFile(json_path, finalJson,function(err)
					//{
    				//	if(err)
    	 			//		console.log('写文件操作失败');
    				//	else 
    				//		console.log('写文件操作成功');
					//});
					saveResult(res,finalJson);
				}
			});
		}
	}
}

function saveResult(res,data)
{
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

exports.upload=upload;
exports.setHeadIcon=setHeadIcon;
exports.deletePhoto=deletePhoto;
exports.downloadPhoto=downloadPhoto;
exports.downloadJson=downloadJson;
exports.downloadHeadPhoto=downloadHeadPhoto;