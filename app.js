// 导入koa，和koa 1.x不同，在koa2中，我们导入的是一个class，因此用大写的Koa表示:
const Koa = require('koa');

// 导入controller middleware:
const controller = require('./controller');
const schedule = require('./schedule');
const bodyParser = require('koa-bodyparser');

const app = new Koa();
console.log('??', schedule())
// log request URL:
app.use(async (ctx, next) => {
    console.log(`Process ${ctx.request.method} ${ctx.request.url}...`);
    await next();
});

// parse request body:
app.use(bodyParser());

// add controllers:
app.use(controller('controller'));

// 在端口3000监听:
app.listen(3000);
console.log('app started at port 3000...');