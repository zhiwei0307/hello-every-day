const fs = require('fs');
const path = require('path');

let mail = async (ctx, next) => {
    console.log('执行模板')
    await ctx.render('index',global.oneData)
}

let uploadImg = async (ctx, next) => {
    console.log('上传',ctx)
    let file = ctx.request.files.file //获取post提交的数据
console.log(file)
    const reader = fs.createReadStream(file.path);
  let filePath = path.join('public/upload/') + `/${file.name}`;
  // 创建可写流
  const upStream = fs.createWriteStream(filePath);
  // 可读流通过管道写入可写流
  reader.pipe(upStream);
    ctx.body = {msg: '上传成功', code: '200', body:{}}
};

module.exports = {
    'GET /mail': mail,
    'POST /upload': uploadImg
};