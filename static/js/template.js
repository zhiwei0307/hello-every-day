
var node = document.getElementById('main');

domtoimage.toPng(node)
    .then(function (dataUrl) {
        var img = new Image();
        img.src = dataUrl;
        document.body.appendChild(img);
        $.post('http://localhost:3000/upload', {}, function(res) {
            console.log(res)
        }, 'JSON')
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