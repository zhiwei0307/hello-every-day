
let mail = async (ctx, next) => {
    console.log('执行模板')
    await ctx.render('index',global.oneData)
};

module.exports = {
    'GET /mail': mail
};