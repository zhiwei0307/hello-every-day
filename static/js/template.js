
var node = document.getElementById('main');

/**
*Base64字符串转二进制
*/
function dataURLtoBlob(dataurl) {
    var arr = dataurl.split(','),
    mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]),
    n = bstr.length,
    u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], {
        type: mime
    });
}

domtoimage.toPng(node)
    .then(function (dataUrl) {
        // var img = new Image();
        // img.src = dataUrl;
        // document.body.appendChild(img);
        let formData = new FormData();
        var blob = dataURLtoBlob(dataUrl);
        console.log(blob)
        formData.append("file", blob, `day-one-${parseInt(Date.now()/1000)}.png`);
        console.log(formData)
        $.ajax({
            type: 'POST',
            contentType: false, 
            processData: false,
            url: 'http://localhost:3000/upload',
            data: formData,
            dataType: 'JSON',
            success: function (response) {
                // TODO
                console.log(response)
            }
        });
    })
    .catch(function (error) {
        console.error('oops, something went wrong!', error);
    });
// domtoimage.toJpeg(node, { quality: 0.95 })
//     .then(function (dataUrl) {
//         var link = document.createElement('a');
//         link.download = 'my-image-name.jpeg';
//         link.href = dataUrl;
//         link.click();
//     });

// domtoimage.toBlob(node)
//     .then(function (blob) {
//         window.saveAs(blob, 'my-node.png');
//     });