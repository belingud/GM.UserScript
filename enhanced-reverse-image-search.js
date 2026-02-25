// ==UserScript==
// @name           以图搜图增强版
// @name:en        Enhanced Reverse Image Search
// @namespace      https://github.com/belingud/GM.search-by-image
// @version        1.1.2
// @description    以图搜图增强版，可以使用本地文件、粘贴链接、点击网页图片方式来搜图。支持谷歌Lens、TinEye、Yandex、Bing、搜狗、百度、trace、SauceNAO、IQDB、3DIQDB、ascii2d搜索引擎。
// @description:en Enhanced Reverse image search. You can search images using local files, pasting links, and clicking web images. Supports Google Lens, TinEye, Yandex, Bing, Sogou, Baidu, trace, SauceNAO, IQDB, 3DIQDB, ascii2d search engines.
// @icon           https://raw.githubusercontent.com/belingud/GM.UserScript/refs/heads/master/artwork/icon.png
// @author         belingud
// @license        BSD 3-Clause License
// @match          *://*/*
// @grant          GM_openInTab
// @grant          GM_registerMenuCommand
// @grant          GM_xmlhttpRequest
// @connect        tmpfiles.org
// ==/UserScript==

(function () {
    "use strict";

    // Define current language
    const currentLanguage = navigator.language.includes("zh") ? "zh" : "en";

    // Define translations
    const translations = {
        en: {
            selectImageSource: "Select Image Source:",
            selectSearchEngine: "Select Search Engine:",
            selectFile: "Select File",
            pasteURL: "Paste URL",
            clickImage: "Click Image",
            googleLens: "Google Lens",
            tinEye: "TinEye",
            yandex: "Yandex",
            "Lenso.ai": "Lenso.ai",
            bing: "Bing",
            sogou: "Sogou",
            baidu: "Baidu",
            trace: "trace",
            sauceNAO: "SauceNAO",
            IQDB: "IQDB",
            "3DIQDB": "3DIQDB",
            ascii2d: "ascii2d",
            close: "Close",
            loading: "Uploading...",
            pasteURLPrompt: "Paste image URL:",
            urlPasted: "URL pasted. Now choose a search engine.",
            clickAnyImage: "Click on any image on the page.",
            imageSelected: "Image selected. Now choose a search engine.",
            selectImageFirst: "Please select an image source first.",
            pleaseSelectFile: "Please select a file before clicking a search engine.",
            uploadError: "Upload failed, please try again or check your network.",
            dragHint: "Click and drag to move",
        },
        zh: {
            selectImageSource: "选择图片来源：",
            selectSearchEngine: "选择搜索引擎：",
            selectFile: "选择文件",
            pasteURL: "粘贴链接",
            clickImage: "点击图片",
            googleLens: "Google Lens",
            tinEye: "TinEye",
            yandex: "Yandex",
            "Lenso.ai": "Lenso.ai",
            bing: "必应",
            sogou: "搜狗",
            baidu: "百度",
            trace: "trace",
            sauceNAO: "SauceNAO",
            IQDB: "IQDB",
            "3DIQDB": "3DIQDB",
            ascii2d: "ascii2d",
            close: "关闭",
            loading: "图片上传中...",
            pasteURLPrompt: "粘贴图片链接：",
            urlPasted: "链接已粘贴。现在选择一个搜索引擎。",
            clickAnyImage: "点击页面上的任何图片。",
            imageSelected: "图片已选择。现在选择一个搜索引擎。",
            selectImageFirst: "请先选择图片来源。",
            pleaseSelectFile: "请先选择文件，然后再点击搜索引擎。",
            uploadError: "上传失败，请重试或检查网络。",
            dragHint: "点击空白处拖动",
        },
    };

    // Helper function for translations
    function lang(key) {
        return translations[currentLanguage][key];
    }

    let imageSrc = ""; // Image source URL
    let selectedEngine = ""; // Selected search engine
    let imgType = ""; // Image type
    let file = ""; // File object

    const searchUrl = {
        "Google Lens": `https://lens.google.com/uploadbyurl?url=\${url}`,
        TinEye: `https://www.tineye.com/search/?url=\${url}`,
        Yandex: `https://yandex.com/images/search?url=\${url}&rpt=imageview`,
        "Lenso.ai": `https://lenso.ai/en/search-by-url?url=\${url}`,
        Bing: `https://www.bing.com/images/search?q=imgurl:\${url}&view=detailv2&iss=sbi`,
        Sogou: `https://pic.sogou.com/ris?query=https%3A%2F%2Fimg03.sogoucdn.com%2Fv2%2Fthumb%2Fretype_exclude_gif%2Fext%2Fauto%3Fappid%3D122%26url%3D\${url}&flag=1&drag=0`,
        Baidu: `https://graph.baidu.com/details?isfromtusoupc=1&tn=pc&carousel=0&promotion_name=pc_image_shituindex&extUiData%5bisLogoShow%5d=1&image=\${url}`,
        Trace: `https://trace.moe/?url=\${url}`,
        SauceNAO: `https://saucenao.com/search.php?db=999&url=\${url}`,
        IQDB: `https://iqdb.org/?url=\${url}`,
        "3DIQDB": `https://3d.iqdb.org/?url=\${url}`,
        ascii2d: `https://ascii2d.net/search/url/\${url}`,
    };

    const searchEngines = [
        {
            text: lang("googleLens"),
            handler: async () => {
                selectedEngine = "Google Lens";
                await searchImage();
            },
        },
        {
            text: lang("tinEye"),
            handler: async () => {
                selectedEngine = "TinEye";
                await searchImage();
            },
        },
        {
            text: lang("yandex"),
            handler: async () => {
                selectedEngine = "Yandex";
                await searchImage();
            },
        },
        {
            text: lang("Lenso.ai"),
            handler: async () => {
                selectedEngine = "Lenso.ai";
                await searchImage();
            }
        },
        {
            text: lang("bing"),
            handler: async () => {
                selectedEngine = "Bing";
                await searchImage();
            },
        },
        // Sogou Image Search requires uploading to the Sogou server, otherwise it cannot search for images.
        // {
        //     text: lang("sogou"),
        //     handler: async () => {
        //         selectedEngine = "Sogou";
        //         await searchImage();
        //     },
        // },
        // Baidu Image Search is in a session, not sure how it works.
        // {
        //     text: lang("baidu"),
        //     handler: async () => {
        //         selectedEngine = "Baidu";
        //         await searchImage();
        //     },
        // },
        {
            text: lang("trace"),
            handler: async () => {
                selectedEngine = "Trace";
                await searchImage();
            },
        },
        {
            text: lang("sauceNAO"),
            handler: async () => {
                selectedEngine = "SauceNAO";
                await searchImage();
            },
        },
        {
            text: lang("IQDB"),
            handler: async () => {
                selectedEngine = "IQDB";
                await searchImage();
            },
        },
        {
            text: lang("3DIQDB"),
            handler: async () => {
                selectedEngine = "3DIQDB";
                await searchImage();
            },
        },
        {
            text: lang("ascii2d"),
            handler: async () => {
                selectedEngine = "ascii2d";
                await searchImage();
            },
        },
    ];

    const imageSources = [
        { text: lang("selectFile"), handler: selectFile, id: "select-file" },
        { text: lang("pasteURL"), handler: pasteURL, id: "paste-url" },
        { text: lang("clickImage"), handler: clickImage, id: "click-image" },
    ];

    // Register the main command in the Tampermonkey menu
    GM_registerMenuCommand("Reverse Image Search", openMenu);

    // Inject Apple-style CSS (called once)
    function injectStyles() {
        if (document.getElementById("ris-styles")) return;
        const style = document.createElement("style");
        style.id = "ris-styles";
        style.textContent = `
            .ris-panel {
                position: fixed;
                top: 10px;
                right: 10px;
                z-index: 9999;
                min-width: 220px;
                max-width: 240px;
                padding: 16px;
                background: rgba(255, 255, 255, 0.82);
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
                border: 1px solid rgba(0, 0, 0, 0.1);
                border-radius: 14px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08);
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                color: #1d1d1f;
                font-size: 13px;
                line-height: 1.4;
            }
            .ris-section-title {
                font-size: 11px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                color: #86868b;
                margin-bottom: 8px;
                padding: 0 4px;
            }
            .ris-option {
                display: block;
                width: 100%;
                box-sizing: border-box;
                padding: 8px 12px;
                margin-bottom: 4px;
                border: none;
                border-radius: 8px;
                background: rgba(0, 0, 0, 0.04);
                color: #1d1d1f;
                font-size: 13px;
                font-family: inherit;
                text-align: center;
                cursor: pointer;
                transition: background 0.18s ease, color 0.18s ease, transform 0.1s ease;
            }
            .ris-option:hover {
                background: rgba(0, 0, 0, 0.08);
            }
            .ris-option:active {
                transform: scale(0.97);
                background: rgba(0, 0, 0, 0.12);
            }
            .ris-option.ris-selected {
                background: #007AFF;
                color: #fff;
                font-weight: 600;
            }
            .ris-divider {
                height: 1px;
                background: rgba(0, 0, 0, 0.08);
                margin: 12px 0;
            }
            .ris-drag-hint {
                font-size: 11px;
                color: #86868b;
                text-align: center;
                font-style: italic;
                margin-top: 10px;
            }
            .ris-close-btn {
                display: block;
                width: 100%;
                padding: 8px;
                margin-top: 8px;
                border: none;
                border-radius: 8px;
                background: rgba(0, 0, 0, 0.04);
                color: #86868b;
                font-size: 13px;
                font-family: inherit;
                cursor: pointer;
                transition: background 0.18s ease, color 0.18s ease;
            }
            .ris-close-btn:hover {
                background: rgba(0, 0, 0, 0.08);
                color: #1d1d1f;
            }
            .ris-loading {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(255, 255, 255, 0.75);
                backdrop-filter: blur(8px);
                -webkit-backdrop-filter: blur(8px);
                border-radius: 14px;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                z-index: 1000;
            }
            .ris-spinner {
                width: 28px;
                height: 28px;
                border: 3px solid rgba(0, 122, 255, 0.2);
                border-top-color: #007AFF;
                border-radius: 50%;
                animation: ris-spin 0.8s linear infinite;
            }
            .ris-loading-text {
                margin-top: 8px;
                font-size: 12px;
                color: #86868b;
            }
            .ris-toast {
                position: fixed;
                bottom: 24px;
                left: 50%;
                transform: translateX(-50%);
                padding: 10px 20px;
                border-radius: 10px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                font-size: 13px;
                color: #fff;
                z-index: 10000;
                backdrop-filter: blur(12px);
                -webkit-backdrop-filter: blur(12px);
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
                animation: ris-toast-in 0.3s ease;
            }
            .ris-toast-success { background: rgba(52, 199, 89, 0.9); }
            .ris-toast-error { background: rgba(255, 59, 48, 0.9); }
            @keyframes ris-spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            @keyframes ris-toast-in {
                from { opacity: 0; transform: translateX(-50%) translateY(10px); }
                to { opacity: 1; transform: translateX(-50%) translateY(0); }
            }
        `;
        document.head.appendChild(style);
    }

    // Function to create and open the menu
    function openMenu() {
        // Remove any existing menu
        const existingMenu = document.getElementById("reverse-image-search-menu");
        if (existingMenu) {
            existingMenu.remove();
        }

        injectStyles();

        const menu = document.createElement("div");
        menu.id = "reverse-image-search-menu";
        menu.className = "ris-panel";
        document.body.appendChild(menu);

        // Make the menu draggable
        makeDraggable(menu);

        // Image source options
        const sourceTitle = document.createElement("div");
        sourceTitle.className = "ris-section-title";
        sourceTitle.textContent = lang("selectImageSource");
        menu.appendChild(sourceTitle);

        imageSources.forEach((source) => {
            const sourceOption = document.createElement("div");
            sourceOption.className = "ris-option";
            sourceOption.textContent = source.text;
            sourceOption.id = source.id;
            sourceOption.addEventListener("click", source.handler);
            menu.appendChild(sourceOption);
        });

        // Divider between sections
        const divider = document.createElement("div");
        divider.className = "ris-divider";
        menu.appendChild(divider);

        // Search engine buttons
        const engineTitle = document.createElement("div");
        engineTitle.className = "ris-section-title";
        engineTitle.textContent = lang("selectSearchEngine");
        menu.appendChild(engineTitle);

        searchEngines.forEach((engine) => {
            const engineOption = document.createElement("div");
            engineOption.className = "ris-option";
            engineOption.textContent = engine.text;
            engineOption.addEventListener("click", async () => {
                if (imgType === "file" && file) {
                    showLoading(menu); // Show loading animation
                }
                await engine.handler();
            });
            menu.appendChild(engineOption);
        });

        // Add drag hint
        const dragHint = document.createElement("div");
        dragHint.className = "ris-drag-hint";
        dragHint.textContent = lang("dragHint");
        menu.appendChild(dragHint);

        const closeButton = document.createElement("button");
        closeButton.className = "ris-close-btn";
        closeButton.textContent = lang("close");
        closeButton.addEventListener("click", () => {
            menu.remove();
        });
        menu.appendChild(closeButton);
    }

    // Handle select file
    function selectFile() {
        imgType = "file";
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.addEventListener("change", (event) => {
            file = event.target.files[0];
            markSelected("select-file");
        });
        input.click();
    }

    // Handle paste URL
    function pasteURL() {
        imgType = "url";
        const url = prompt(lang("pasteURLPrompt"));
        if (url) {
            imageSrc = url;
            markSelected("paste-url");
        }
    }

    // Handle click image
    function clickImage() {
        imgType = "page";
        document.body.addEventListener("click", function handleClick(event) {
            if (event.target.tagName === "IMG") {
                imageSrc = event.target.src;
                document.body.removeEventListener("click", handleClick);
                markSelected("click-image");
                event.preventDefault(); // Prevent default link behavior
            }
        });
    }

    // Perform image search
    async function searchImage() {
        if (!file && imgType === "file") {
            showToast(lang("pleaseSelectFile"), "error");
            return;
        }
        if (imgType === "file") {
            imageSrc = await getTmpImgLink(file);
            hideLoading(); // Hide loading animation after getting the link
        }
        if (!imageSrc) {
            return;
        }
        let tmp;
        if (selectedEngine !== "ascii2d") {
            tmp = encodeURIComponent(imageSrc);
        } else {
            tmp = imageSrc;
        }
        let target = searchUrl[selectedEngine].replace("${url}", tmp);
        GM_openInTab(target, { active: true, insert: true, setParent: true });
    }

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

    /**
     * Mark the selected image source with a green checkmark.
     * @param {string} id - The id of the selected image source.
     */
    let selectedSourceId = null; // Store the ID of the currently selected source

    function markSelected(id) {
        if (selectedSourceId) {
            const prevElement = document.getElementById(selectedSourceId);
            if (prevElement) {
                prevElement.classList.remove("ris-selected");
            }
        }

        const element = document.getElementById(id);
        if (element) {
            element.classList.add("ris-selected");
        }

        selectedSourceId = id;
    }

    /**
     * Show loading animation
     * @param {HTMLElement} menu - The menu element
     */
    function showLoading(menu) {
        const loadingDiv = document.createElement("div");
        loadingDiv.id = "loading-animation";
        loadingDiv.className = "ris-loading";

        const spinner = document.createElement("div");
        spinner.className = "ris-spinner";
        loadingDiv.appendChild(spinner);

        const text = document.createElement("div");
        text.className = "ris-loading-text";
        text.textContent = lang("loading");
        loadingDiv.appendChild(text);

        menu.appendChild(loadingDiv);
    }

    /**
     * Hide loading animation
     */
    function hideLoading() {
        const loadingDiv = document.getElementById("loading-animation");
        if (loadingDiv) {
            loadingDiv.remove();
        }
    }

    function showToast(message, type) {
        const toast = document.createElement("div");
        toast.className = `ris-toast ${type === "success" ? "ris-toast-success" : "ris-toast-error"}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    function makeDraggable(element) {
        let pos1 = 0,
            pos2 = 0,
            pos3 = 0,
            pos4 = 0;
        element.onmousedown = dragMouseDown;

        function dragMouseDown(e) {
            e = e || window.event;
            e.preventDefault();
            // get the mouse cursor position at startup:
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            // call a function whenever the cursor moves:
            document.onmousemove = elementDrag;
        }

        function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();
            // calculate the new cursor position:
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            // set the element's new position:
            element.style.top = element.offsetTop - pos2 + "px";
            element.style.left = element.offsetLeft - pos1 + "px";
        }

        function closeDragElement() {
            // stop moving when mouse button is released:
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }
})();
