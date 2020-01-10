/**
 * 文件上传工具类
 */
const fs = require('fs');
const path = require('path');
const QINIU = {
    accessKey: 'HsARJlkg2PVFc7bKP3orSVgFdmzzd8vTTEO_U59Q',
    secretKey: 'SF1MKGEdPbTx5dAjAtE88IWcYsRQDvWqM8fIThX4',
    bucket: 's-zw',
    uploadURL: 's-zw.s3-cn-north-1.qiniucs.com'
}
/**
 * 同步创建文件目录
 * @param {*} dirname 目录绝对地址
 */
const mkdirsSync = (dirname) => {
    if (fs.existsSync(dirname)) {
        return true
    } else {
        if (mkdirsSync(path.dirname(dirname))) {
            fs.mkdirSync(dirname)
            return true
        }
    }
    return false;
}
//获取上传文件的后缀名
function getSuffix(fileName) {
    return fileName.split('.').pop()
}

// 重命名
function Rename(fileName) {
    return Math.random().toString(32).substr(4) + '.' + getSuffix(fileName)
}
// 删除文件
const removeTemFile = (path) => {
    fs.unlink(path, (err) => {
        if (err) {
            throw err
        }
    })
}
// 上传文件到服务
const uploadFile = (ctx, options) => {
    console.log(ctx.req.headers, options)

    const mkdirResult = mkdirsSync(options.path)
    if (!mkdirResult) {
        return
    }
    let file = ctx.request.files.file //获取post提交的数据

    const reader = fs.createReadStream(file.path);
    let filePath = path.join('public/upload/') + `/${file.name}`;
    // 创建可写流
    const upStream = fs.createWriteStream(filePath);
    // 可读流通过管道写入可写流
    reader.pipe(upStream);
    return { filePath: filePath }
}

// 上传到七牛
export const upToQiniu = (filePath, key) => {
    const accessKey = QINIU.accessKey
    const secretKey = QINIU.secretKey
    const mac = new qiniu.auth.digest.Mac(accessKey, secretKey)
    const options = {
        scope: QINIU.bucket
    }
    const putPolicy = new qiniu.rs.PutPolicy(options)
    const uploadToken = putPolicy.uploadToken(mac)

    const config = new qiniu.conf.Config()
    // 空间对应的机房 一定要按自己属区Zone对象
    config.zone = qiniu.zone.Zone_z1
    const localFile = filePath
    const formUploader = new qiniu.form_up.FormUploader(config)
    const putExtra = new qiniu.form_up.PutExtra()
    // 文件上传
    return new Promise((resolved, reject) => {
        formUploader.putFile(uploadToken, key, localFile, putExtra, function (respErr, respBody, respInfo) {
            if (respErr) {
                reject(respErr)
            } else {
                resolved(respBody)
            }
        })
    })
}

const upload = async (ctx) => {
    // 图片上传路径
    let filePath = path.join('public/upload/');
    // 获取上传图片
    const result = uploadFile(ctx, {
        fileType: 'image',
        path: filePath
    })
    console.log(result, '图片信息');
    //   // 上传到七牛
    // 	 const qiniu = await upToQiniu(imgPath, result.imgKey)
    //   // 上传到七牛之后 删除原来的缓存文件
    // 	 removeTemFile(imgPath)
    return result.filePath
}

module.exports = {
    upload, removeTemFile
}