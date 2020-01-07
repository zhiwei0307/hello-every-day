// 导入koa，和koa 1.x不同，在koa2中，我们导入的是一个class，因此用大写的Koa表示:
const Koa = require('koa');

// 导入controller middleware:
const controller = require('./controller');
const schedule = require('./schedule');
const views = require('koa-views');
const bodyParser = require('koa-bodyparser');
const path = require('path');
const serve = require('koa-static');
const C = require('child_process');
const { getMailData } = require('./utils');
const app = new Koa();
//配置需要渲染的文件路径及文件后缀
app.use(views(path.join(__dirname,'./views'),{
    extension:'ejs'
}))
app.use(serve(__dirname, 'static'));

// const local = "zhengzhou";
// // 爬取数据的url
// const OneUrl = "http://wufazhuce.com/";
// const WeatherUrl = "https://tianqi.moji.com/weather/china/henan/" + local;
// getMailData(OneUrl, WeatherUrl).then(res => {
//     global.oneData = res;
//     C.exec("start http://localhost:3000/mail");
// });
// log request URL:
schedule();
app.use(async (ctx, next) => {
    // console.log(`Process ${ctx.request.method} ${ctx.request.url}...`)
    await next();
});

// parse request body:
app.use(bodyParser());

// add controllers:
app.use(controller('controller'));

// 在端口3000监听:
app.listen(3000);
console.log('app started at port 3000...');