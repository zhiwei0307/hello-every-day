const schedule = require('node-schedule');
const fs = require('fs');
const path = require('path');
const ejs = require('ejs');

const { getOneData, getWeatherTips, getWeatherData, getDateIndex, getToday, sendEmail } = require('./utils');
//当地拼音,需要在下面的墨迹天气url确认
const local = "zhengzhou";
// 爬取数据的url
const OneUrl = "http://wufazhuce.com/";
const WeatherUrl = "https://tianqi.moji.com/weather/china/henan/" + local;

module.exports = function () {
    console.log('NodeMail: 开始等待目标时刻...')
    //定时任务
    schedule.scheduleJob('10 * * * * *', async () => {
      
      const [oneData, weatherTip, weatherData] = await Promise.all([getOneData(OneUrl), getWeatherTips(WeatherUrl), getWeatherData(WeatherUrl)]);
      const dateIndex = getDateIndex();
      const today = getToday();
      const template = ejs.compile(fs.readFileSync(path.resolve(__dirname, 'views/index.ejs'), 'utf8'));
      let ejsModelObject = {
        oneData: oneData,
        weatherTip,
        weatherData: weatherData,
        dateIndex: dateIndex,
        today: today,
      }
      console.log('定时', ejsModelObject)
      const html = template(ejsModelObject);
    //   sendEmail(html)
    });
  }