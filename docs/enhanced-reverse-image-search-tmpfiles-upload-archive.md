# enhanced-reverse-image-search 旧上传函数记录

以下函数来自 `enhanced-reverse-image-search.js`。上传接口切换到 Uguu 后，旧的 tmpfiles.org 上传实现已从脚本中移除，这里仅保存历史记录。

```js
async function uploadToTmpFiles(file) {
    const formData = new FormData();
    formData.append("file", file);
    const response = new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
            method: "POST",
            url: "https://tmpfiles.org/api/v1/upload",
            data: formData,
            headers: {
                "X-Client": "tampermonkey-enhanced-reverse-image-search",
            },
            onload: function (response) {
                if (response.status !== 200) {
                    reject(response.responseText);
                    // {"status":"success","data":{"url":"https://tmpfiles.org/19972538/winter_bg.jpg"}}
                }
                const resp = JSON.parse(response.responseText);
                console.log("upload response: ", resp);
                let url = resp.data.url;
                if (url.startsWith("http://tmpfiles.org") || url.startsWith("https://tmpfiles.org")) {
                    url = url.replace(/^https?:\/\/tmpfiles\.org/, "https://tmpfiles.org/dl");
                }
                resolve(url);
            },
            onerror: function (response) {
                reject(response);
            },
        });
    });
    return await response;
}

/**
 * 使用临时网盘来将文件转为链接搜图
 * @param {*} file
 */
async function getTmpImgLink(file) {
    try {
        return await uploadToTmpFiles(file);
    } catch (error) {
        console.log("[reverse image search] upload error: ", error);
        showToast(lang("uploadError"), "error");
    }
}
```
