const fs = require('fs');
const path = require('path');
const { upload } = require('../utils/upload');
let mail = async (ctx, next) => {
    console.log('执行模板')
    await ctx.render('index', global.oneData)
}

let uploadImg = async (ctx, next) => {
    try {
        const res = upload(ctx);
        ctx.body = {
            status: 'success',
            code: '200',
            msg: '上传成功',
            body: {
                path: res
            }
        }
    } catch (error) {
        ctx.body = {
            status: 'error',
            code: error,
            msg: '上传失败',
        }
    }
}

module.exports = {
    'GET /mail': mail,
    'POST /upload': uploadImg
};