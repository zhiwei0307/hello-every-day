//引入模块 nodemailer
const nodemailer = require('nodemailer')

const config = {
    // 163邮箱 为smtp.163.com
    host: 'smtp.qq.com',//这是qq邮箱
    secureConnection: true, // use SSL
    secure: true,
    //端口
    port: 465,
    auth: {
        // 发件人邮箱账号
        user: '619650434@qq.com',
        //发件人邮箱的授权码 这里可以通过qq邮箱获取 并且不唯一
        pass: 'yemthllglulhbgac'
    }
}

const transporter = nodemailer.createTransport(config)

const mail = {
    // 发件人 邮箱  '昵称<发件人邮箱>'
    from: '"zw" <619650434@qq.com>',
    // 主题
    subject: '测试小邮件',
    // 收件人 的邮箱 可以是其他邮箱 不一定是qq邮箱
    to: 'sunzhiwei107@qq.com',
    // 内容
    text: '测试',
    //这里可以添加html标签
    html: null
}
module.exports = function (html) {
    mail.html = html
    transporter.sendMail(mail, function (error, info) {
        if (error) {
            return console.log("邮件发送失败", error);
        }
        transporter.close()
        console.log('mail sent:', info)
        console.log('mail sent:', info.response)
    })
}
