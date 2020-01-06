const superagent = require("superagent"); //发送网络请求获取DOM
const cheerio = require("cheerio"); //能够像Jquery一样方便获取DOM节点
const nodemailer = require("nodemailer"); //发送邮件的node插件
const ejs = require("ejs"); //ejs模版引擎
const fs = require("fs"); //文件读写
const http = require('http');
const https = require('https');
const path = require("path"); //路径配置
//配置项
// 今日日期
const today = new Date();

function getToday (decollator) {
  return today.getFullYear() + decollator + (today.getMonth() + 1) + decollator + today.getDate();
}

function getTodayEn() {
  let Months = ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May.', 'Jun.', 'Jul.', 'Aug.', 'Sept.', 'Oct.', 'Nov.', 'Dec.'];
  let weeks = ['Sun.', 'Mon.', 'Tues.', 'Wed.', 'Thur.', 'Fri.', 'Sat.'];
  
  return today.getDate()+ ' ' + Months[today.getMonth()] + ' ' + today.getFullYear() + ' ' + weeks[today.getDay()];
  
}

// 今日资源文件夹
let curResourceDir
//纪念日
let startDay = "2020/1/1";


//发送者邮箱厂家
let EmianService = "qq";
//发送者邮箱账户SMTP授权码
let EamilAuth = {
  user: "619650434@qq.com",
  pass: "yemthllglulhbgac"
};
//发送者昵称与邮箱地址
let EmailFrom = '"vince" <619650434@qq.com>';

//接收者邮箱地
let EmailTo = "292858831@qq.com";
//邮件主题
let EmailSubject = "一封暖暖的小邮件";

//每日发送时间
let EmailHour = 16;
let EmialMinminute = 01;



// 获取ONE内容
function getOneData(OneUrl) {
  return new Promise(function (resolve, reject) {
    superagent.get(OneUrl).end(function (err, res) {
      if (err) {
        reject(err);
      }
      let $ = cheerio.load(res.text);
      let selectItem = $("#carousel-one .carousel-inner .item");
      let todayOne = selectItem[0];
      let imgSrc = $(todayOne).find(".fp-one-imagen").attr("src");
      saveImgTolocal(imgSrc, curResourceDir, 'day_one.jpg');
      let todayOneData = {
        imgUrl: imgSrc,
        type: $(todayOne).find(".fp-one-imagen-footer").text().replace(/(^\s*)|(\s*$)/g, ""),
        text: $(todayOne).find(".fp-one-cita").text().replace(/(^\s*)|(\s*$)/g, "")
      };
      resolve(todayOneData)
    });
  })
}

// 获取天气提醒
function getWeatherTips(WeatherUrl) {
  return new Promise((resolve, reject) => {
    superagent.get(WeatherUrl).end(function (err, res) {
      if (err) {
        reject(err);
      }
      let threeDaysData = [];
      let weatherTip = "";
      let $ = cheerio.load(res.text);
      let tipObj = {};
      tipObj.temp = $('.wea_weather em').text().trim() + '℃';
      tipObj.desc = $('.wea_weather b').text().trim();
      tipObj.water = $('.wea_about span').text().trim();
      tipObj.win = $('.wea_about em').text().trim();
      tipObj.tips = $('.wea_tips em').text().trim();
      resolve(tipObj)
    });
  })
}

// 获取天气预报
function getWeatherData(WeatherUrl) {
  return new Promise((resolve, reject) => {
    superagent.get(WeatherUrl).end(function (err, res) {
      if (err) {
        reject(err);
      }
      let threeDaysData = [];
      let weatherTip = "";
      let $ = cheerio.load(res.text);
      $(".forecast .days").each(function (i, elem) {
        const SingleDay = $(elem).find("li");
        const imgSrc = $(SingleDay[1]).find("img").attr("src");
        // saveImgTolocal(imgSrc, );
        saveImgTolocal(imgSrc, curResourceDir, `weather${i + 1}.png`);
        threeDaysData.push({
          Day: $(SingleDay[0])
            .text()
            .replace(/(^\s*)|(\s*$)/g, ""),
          WeatherImgUrl: imgSrc,
          WeatherText: $(SingleDay[1])
            .text()
            .replace(/(^\s*)|(\s*$)/g, ""),
          Temperature: $(SingleDay[2])
            .text()
            .replace(/(^\s*)|(\s*$)/g, ""),
          WindDirection: $(SingleDay[3])
            .find("em")
            .text()
            .replace(/(^\s*)|(\s*$)/g, ""),
          WindLevel: $(SingleDay[3])
            .find("b")
            .text()
            .replace(/(^\s*)|(\s*$)/g, ""),
          Pollution: $(SingleDay[4])
            .text()
            .replace(/(^\s*)|(\s*$)/g, ""),
          PollutionLevel: $(SingleDay[4])
            .find("strong")
            .attr("class")
        });
      });
      resolve(threeDaysData)
    });
  });
}

// 发动邮件
function sendMail(HtmlData) {
  const template = ejs.compile(
    fs.readFileSync(path.resolve(__dirname, "email.ejs"), "utf8")
  );
  const html = template(HtmlData);

  let transporter = nodemailer.createTransport({
    service: EmianService,
    port: 465,
    secureConnection: true,
    auth: EamilAuth
  });

  let mailOptions = {
    from: EmailFrom,
    to: EmailTo,
    subject: EmailSubject,
    html: html
  };
  transporter.sendMail(mailOptions, (error, info = {}) => {
    if (error) {
      console.log(error);
      sendMail(HtmlData); //再次发送
    }
    console.log("邮件发送成功", info.messageId);
    console.log("静等下一次发送");
  });
}
// 创建文件夹
function createDir() {
  let curPath = `public/${todaystr}`;
  if (!fs.existsSync(curPath)) {
    fs.mkdirSync(curPath)
  }
  // 读取文件夹下的内容
  const files = fs.readdirSync(curPath);
  let dirNum = 0;
  files.forEach(function (item, index) {
    let stat = fs.lstatSync(curPath + "/" + item)
    if (stat.isDirectory()) {
      dirNum++
    }
  })
  let cDir = `${curPath}/${dirNum + 1}`
  if (!fs.existsSync(cDir)) {
    fs.mkdirSync(cDir)
  }
  return cDir
}

// 保存图片到本地
function saveImgTolocal(src, path, name) {

  var protocol = src.indexOf('https:') > -1 ? https : http
  protocol.get(src, function (res) {
    var imgData = "";
    res.setEncoding("binary"); //一定要设置response的编码为binary否则会下载下来的图片打不开

    res.on("data", function (chunk) {
      imgData += chunk;
    });

    res.on("end", function () {
      fs.writeFile(`${path}/${name}`, imgData, "binary", function (err) {
        if (err) {
          console.log(err)
          return console.log("down fail");
        }
        console.log("图片保存成功！");
      });
    });
  });
}
// 聚合
function getAllDataAndSendMail() {
  let HtmlData = {};
  // 今日资源文件夹
  curResourceDir = createDir()
  HtmlData['resourcePath'] = curResourceDir;
  // how long with
  let Months = ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May.', 'Jun.', 'Jul.', 'Aug.', 'Sept.', 'Oct.', 'Nov.', 'Dec.'];
  let weeks = ['Sun.', 'Mon.', 'Tues.', 'Wed.', 'Thur.', 'Fri.', 'Sat.'];
  let initDay = new Date(startDay);
  let lastDay = Math.floor((today - initDay) / 1000 / 60 / 60 / 24);
  HtmlData["lastDay"] = lastDay;

  HtmlData["todaystr"] = todaystr.replace(/-/g, "\/");
  HtmlData["todaystrEN"] = today.getDate()+ ' ' + Months[today.getMonth()] + ' ' + today.getFullYear() + ' ' + weeks[today.getDay()];
  

  Promise.all([getOneData(), getWeatherTips(), getWeatherData()]).then((data) => {
    console.log(data)
    HtmlData["todayOneData"] = data[0];
    HtmlData["weatherTip"] = data[1];
    HtmlData["threeDaysData"] = data[2];
    sendMail(HtmlData)
  }).catch(function (err) {
    getAllDataAndSendMail() //再次获取
    console.log('获取数据失败： ', err);
  })
}

console.log('**')
// let rule = new schedule.RecurrenceRule();
// rule.second = 10;
// console.log('NodeMail: 开始等待目标时刻...')
// let j = schedule.scheduleJob(rule, function () {
//   console.log("执行任务");
//   getAllDataAndSendMail();
// });

module.exports = {
  getOneData, getWeatherTips, getWeatherData, sendMail
}