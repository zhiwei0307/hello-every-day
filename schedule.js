const schedule = require('node-schedule');
const fs = require('fs');
const path = require('path');
const ejs = require('ejs');

const { getMailData } = require('./utils');
const sendEmail = require('./nodemailer');
//当地拼音,需要在下面的墨迹天气url确认
const local = "zhengzhou";
// 爬取数据的url
const OneUrl = "http://wufazhuce.com/";
const WeatherUrl = "https://tianqi.moji.com/weather/china/henan/" + local;

module.exports = function () {
	return;
	console.log('NodeMail: 开始等待目标时刻...')
	//定时任务
	schedule.scheduleJob('10 * * * * *', async () => {
		let ejsModelObject = await getMailData(OneUrl, WeatherUrl);
		const template = ejs.compile(fs.readFileSync(path.resolve(__dirname, 'views/mail.ejs'), 'utf8'));
		const html = template(ejsModelObject);
		sendEmail(html)
	});
}