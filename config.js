var path = require('path');
var config = {
  // debug 为 true 时，用于本地调试
  debug: false,
  host: '123.206.210.77', //域名
  field_max: 50000,
  field_min: 1000,
  port: 9000,
  // 文件上传配置
  upload_temp: './public/temp',
  upload: path.join(__dirname, './public/images'),
  upload_real: './public/images',
  photo_max:25,//每个玩家最大的存储数量
  keys:{
      '101':'2eaaad0b65be07ece7bb4991b960da22',
  },
};
module.exports = config;