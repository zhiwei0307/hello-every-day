
let mail = async (ctx, next) => {
    console.log('执行模板')
    await ctx.render('index',global.oneData)
}

let uploadImg = async (ctx, next) => {
    console.log('上传')
    ctx.body = {msg: 'koa upload demo', code: '200', body:{}}
};

module.exports = {
    'GET /mail': mail,
    'POST /upload': uploadImg
};