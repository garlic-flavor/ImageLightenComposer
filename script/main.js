window.onload = () => {
    document.getElementById("button_lightest").onclick = () => {
        document.getElementById("result").innerHTML = '';
        document.getElementById("storage").innerHTML = '';
        let progress = document.getElementById("progress");
        progress.innerHTML = '';
        let btn_files = document.getElementById("image_files");
        if (btn_files === null || btn_files.files === null || btn_files.files.length == 0) {
            return;
        }
        var jobs = [];
        for (let file of btn_files.files) {
            let filetype = file.type;
            if (!filetype.startsWith("image/")) {
                console.log(file.name + " is not an image.");
                continue;
            }
            let span = document.createElement('span');
            span.innerText = '▶';
            span.className = "progress_" + file.name;
            progress.appendChild(span);
            jobs.push(loadToCanvas(file));
        }
        Promise.all(jobs).then(() => {
            processLightest().then(() => {
                console.log("done");
            });
        });
    };
    document.getElementById("button_save").onclick = () => {
        let results = document.getElementById("result").getElementsByTagName('canvas');
        if (results === null || results.length == 0) {
            return;
        }
        let canvas = results[0];
        let image = canvas.toDataURL('image/jpeg', 0.8).replace('image/jpeg', 'image/octet-stream');
        let link = document.createElement('a');
        link.download = 'canvas_image.jpg';
        link.href = image;
        link.click();
    };
};
function loadToCanvas(file) {
    return new Promise((resolve, reject) => {
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.addEventListener('load', () => {
            let canvas = document.createElement("canvas");
            canvas.className = "progress_" + file.name;
            let img = new Image();
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                let ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                resolve();
            };
            img.src = reader.result;
            let div = document.getElementById("storage");
            div.appendChild(canvas);
        });
        reader.addEventListener('error', () => {
            console.log("ERROR !!");
            console.log(reader.error);
            reject();
        });
    });
}
async function processLightest() {
    let div = document.getElementById("storage");
    let images = div.getElementsByTagName('canvas');
    if (images === null) {
        return;
    }
    let width = images[0].width;
    let height = images[0].height;
    let canvas = document.createElement("canvas");
    canvas.style = "width:100%;";
    canvas.width = width;
    canvas.height = height;
    let destctx = canvas.getContext('2d');
    let d = destctx.getImageData(0, 0, width, height);
    let lumi = Array(width * height).fill(0);
    let progress = document.getElementById('progress');
    for (var i = 0; i < images.length; i++) {
        let c = images[i];
        let ctx = c.getContext('2d');
        let src = ctx.getImageData(0, 0, width, height);
        for (var y = 0; y < height; y++) {
            for (var x = 0; x < width; x++) {
                let idx = y * width + x;
                let lumiDest = lumi[idx];
                let srcR = src.data[idx * 4];
                let srcG = src.data[idx * 4 + 1];
                let srcB = src.data[idx * 4 + 2];
                let lumiSrc = srcR + srcG + srcB;
                if (lumiDest <= lumiSrc) {
                    lumi[idx] = lumiSrc;
                    d.data[idx * 4] = srcR;
                    d.data[idx * 4 + 1] = srcG;
                    d.data[idx * 4 + 2] = srcB;
                    d.data[idx * 4 + 3] = 255;
                }
            }
        }
        console.log(c.className);
        let p = progress.getElementsByClassName(c.className);
        if (p !== null && 0 < p.length) {
            let span = p[0];
            span.innerHTML = '●';
            span.style = 'color:green';
            await redraw();
        }
    }
    destctx.putImageData(d, 0, 0);
    document.getElementById("result").appendChild(canvas);
}
async function redraw() {
    await new Promise(resolve => requestAnimationFrame(resolve));
    await new Promise(resolve => requestAnimationFrame(resolve));
}
export {};
//# sourceMappingURL=main.js.map