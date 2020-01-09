const superagent = require("superagent"); //发送网络请求获取DOM
const cheerio = require("cheerio"); //能够像Jquery一样方便获取DOM节点
const fs = require("fs"); //文件读写
const http = require('http');
const https = require('https');
//配置项
// 今日日期时间戳
const today = new Date();

/**
 * 获取今天日期
 * @param decollator 分割符,默认'-';
 */
function getToday(decollator = '-') {
	const y = today.getFullYear(), m = today.getMonth(), d = today.getDate();
	return y + decollator + (m > 8 ? m + 1 : '0' + (m + 1)) + decollator + (d > 9 ? d : '0' + d);
}

// 引文格式日期
function getTodayEn() {
	let Months = ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May.', 'Jun.', 'Jul.', 'Aug.', 'Sept.', 'Oct.', 'Nov.', 'Dec.'];
	let weeks = [
		{
			"cn": "星期日",
			"en": "Sunday",
			"enShort": 'Sun.'
		}, {
			"cn": "星期一",
			"en": "Monday",
			"enShort": 'Mon.'
		}, {
			"cn": "星期二",
			"en": "Tuesday",
			"enShort": 'Tues.'
		}, {
			"cn": "星期三",
			"en": "Wednesday",
			"enShort": 'Wed.'
		}, {
			"cn": "星期四",
			"en": "Thursday",
			"enShort": 'Thur.'
		}, {
			"cn": "星期五",
			"en": "Friday",
			"enShort": 'Fri.'
		}, {
			"cn": "星期六",
			"en": "Saturday",
			"enShort": 'Sat.'
		}
	];

	return {
		y: today.getFullYear(),
		m: Months[today.getMonth()],
		d: today.getDate(),
		w: weeks[today.getDay()],
		d_m_y: today.getDate() + ' ' + Months[today.getMonth()] + ' ' + today.getFullYear()
	}

}

/**
 * 获取开始日期距离今天的天数
 * @param initDay 初始日期,默认'2020/01/01';
 */
function distDays(initDay = '2020/01/01') {
	if (isNaN(initDay)) {
		initDay = new Date(initDay);
	}
	return Math.ceil((today - initDay) / 1000 / 60 / 60 / 24);
}

// 获取ONE内容
function getOneData(OneUrl, savePath) {
	return new Promise(function (resolve, reject) {
		superagent.get(OneUrl).end(function (err, res) {
			if (err) {
				reject(err);
			}
			let $ = cheerio.load(res.text);
			let selectItem = $("#carousel-one .carousel-inner .item");
			let todayOne = selectItem[0];
			let imgSrc = $(todayOne).find(".fp-one-imagen").attr("src");
			runSaveImgSync(imgSrc, savePath, 'day_one.jpg');
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
function getWeatherData(WeatherUrl, savePath) {
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
				runSaveImgSync(imgSrc, savePath, `weather${i + 1}.png`);
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

// 创建文件夹
function createFolder() {
	let curPath = `static/images/spider/${getToday()}`;
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

/**
 * 保存图片到本地
 * @param src 网络图片地址；
 * @param path 图片保存路径；
 * @param name 图片保存名称；
 */
async function runSaveImgSync(src, path, name) {
	await requestImage(src, path, name);
}
// 请求图片并返回图片数据
function requestImage(src, path, name) {
	const protocol = src.indexOf('https:') > -1 ? https : http
	return new Promise((resolve, reject) => {
		protocol.get(src, res => {
			let imgData = "";
			res.setEncoding("binary"); //一定要设置response的编码为binary否则会下载下来的图片打不开
			res.on("data", function (chunk) {
				imgData += chunk;
			});
			res.on("end", function () {
				fs.writeFileSync(`${path}/${name}`, imgData, "binary" );
				resolve(imgData)
			});
		});
	})
}


// 返回获取的数据；
function getMailData(OneUrl, WeatherUrl) {
	const folder = createFolder()
	return new Promise((resolve, reject) => {
		Promise.all([getOneData(OneUrl, folder), getWeatherTips(WeatherUrl), getWeatherData(WeatherUrl, folder)]).then(res => {
			let ejsModelObject = {
				oneData: res[0],
				weatherTip: res[1],
				weatherData: res[2],
				distDays: distDays(),
				todaysEn: getTodayEn(),
				resourcePath: folder
			}
			resolve(ejsModelObject);
		}).catch(err => {
			reject(err);
		})
	})
}

module.exports = {
	getOneData,
	getWeatherTips,
	getWeatherData,
	getToday,
	getTodayEn,
	createFolder,
	distDays,
	getMailData
}