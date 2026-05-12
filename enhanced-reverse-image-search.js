// ==UserScript==
// @name           以图搜图增强版
// @name:en        Enhanced Reverse Image Search
// @namespace      https://github.com/belingud/GM.UserScript
// @version        1.4.0
// @description    以图搜图增强版，可以使用本地文件、粘贴链接、点击网页图片方式来搜图。支持谷歌Lens、TinEye、Yandex、Copyseeker、Bing、搜狗、百度、trace、SauceNAO、IQDB、3DIQDB、ascii2d搜索引擎。
// @description:en Enhanced Reverse image search. You can search images using local files, pasting links, and clicking web images. Supports Google Lens, TinEye, Yandex, Copyseeker, Bing, Sogou, Baidu, trace, SauceNAO, IQDB, 3DIQDB, ascii2d search engines.
// @icon           https://cdn.jsdelivr.net/gh/belingud/GM.UserScript@refs/heads/master/artwork/icon.png
// @author         belingud
// @license        BSD 3-Clause License
// @match          *://*/*
// @grant          GM_openInTab
// @grant          GM_registerMenuCommand
// @grant          GM_setValue
// @grant          GM_getValue
// @grant          GM_xmlhttpRequest
// @connect        uguu.se
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
            copyseeker: "Copyseeker",
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
            pasteImage: "Paste Image",
            clipboardEmpty: "No image found in clipboard.",
            pasteDialogTitle: "Paste Image",
            pasteDialogHint: "Press Ctrl+V  /  Long press here to paste",
            pasteDialogUploading: "Uploading...",
            pasteDialogCancel: "Cancel",
            copyseekerUrlOnly: "Copyseeker only supports http/https image URLs.",
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
            copyseeker: "Copyseeker",
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
            pasteImage: "粘贴图片",
            clipboardEmpty: "剪贴板中未找到图片。",
            pasteDialogTitle: "粘贴图片",
            pasteDialogHint: "按 Ctrl+V  /  手机长按此处粘贴",
            pasteDialogUploading: "上传中...",
            pasteDialogCancel: "取消",
            copyseekerUrlOnly: "Copyseeker 只支持 http/https 图片链接。",
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
    const menuSizeKey = "ris_menu_size";
    const minMenuWidth = 180;
    const minMenuHeight = 180;

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
            text: lang("copyseeker"),
            handler: async () => {
                selectedEngine = "Copyseeker";
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
        { text: lang("pasteImage"), handler: pasteImage, id: "paste-image" },
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
                top: max(10px, env(safe-area-inset-top));
                right: max(10px, env(safe-area-inset-right));
                z-index: 9999;
                width: min(240px, calc(100vw - 20px));
                min-width: 180px;
                min-height: 180px;
                max-width: calc(100vw - 20px);
                max-height: calc(100vh - 20px);
                max-height: calc(100dvh - 20px);
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
                box-sizing: border-box;
                overflow: hidden;
            }
            .ris-content {
                position: absolute;
                inset: 0;
                z-index: 1;
                padding: 16px;
                box-sizing: border-box;
                overflow: auto;
                overscroll-behavior: contain;
                -webkit-overflow-scrolling: touch;
                scrollbar-width: thin;
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
            .ris-option.ris-waiting {
                background: rgba(0, 122, 255, 0.12);
                color: #007AFF;
                font-weight: 600;
            }
            .ris-paste-overlay {
                position: fixed;
                inset: 0;
                background: rgba(0, 0, 0, 0.4);
                z-index: 2147483646;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .ris-paste-dialog {
                background: #fff;
                border-radius: 16px;
                padding: 24px 28px 18px;
                min-width: 260px;
                max-width: 320px;
                width: 90vw;
                box-shadow: 0 8px 32px rgba(0,0,0,0.18);
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 10px;
            }
            .ris-paste-dialog-title {
                font-size: 16px;
                font-weight: 700;
                color: #1d1d1f;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            }
            .ris-paste-area {
                width: 100%;
                min-height: 72px;
                border: 2px dashed #007AFF;
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #007AFF;
                font-size: 13px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                cursor: text;
                outline: none;
                box-sizing: border-box;
                padding: 12px;
                -webkit-user-select: text;
                user-select: text;
                text-align: center;
            }
            .ris-paste-area:focus {
                border-color: #0051a8;
                background: rgba(0,122,255,0.04);
            }
            .ris-paste-dialog-uploading {
                font-size: 13px;
                color: #86868b;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            }
            .ris-paste-dialog-cancel {
                background: none;
                border: none;
                color: #007AFF;
                font-size: 14px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                cursor: pointer;
                padding: 6px 12px;
                border-radius: 8px;
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
                position: sticky;
                bottom: 0;
                display: block;
                width: 100%;
                padding: 8px;
                margin-top: 8px;
                border: none;
                border-radius: 8px;
                background: rgba(245, 245, 247, 0.96);
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
            .ris-resize-handle {
                position: absolute;
                z-index: 1001;
                display: block;
                padding: 0;
                border: none;
                background: transparent;
                appearance: none;
                -webkit-appearance: none;
                pointer-events: auto;
                touch-action: none;
            }
            .ris-resize-handle[data-direction="n"] {
                top: 0;
                left: 14px;
                right: 14px;
                height: 7px;
                cursor: ns-resize;
            }
            .ris-resize-handle[data-direction="s"] {
                bottom: 0;
                left: 14px;
                right: 14px;
                height: 7px;
                cursor: ns-resize;
            }
            .ris-resize-handle[data-direction="e"] {
                top: 14px;
                right: 0;
                bottom: 14px;
                width: 7px;
                cursor: ew-resize;
            }
            .ris-resize-handle[data-direction="w"] {
                top: 14px;
                left: 0;
                bottom: 14px;
                width: 7px;
                cursor: ew-resize;
            }
            .ris-resize-handle[data-direction="ne"],
            .ris-resize-handle[data-direction="nw"],
            .ris-resize-handle[data-direction="se"],
            .ris-resize-handle[data-direction="sw"] {
                width: 18px;
                height: 18px;
            }
            .ris-resize-handle[data-direction="ne"] {
                top: 0;
                right: 0;
                cursor: nesw-resize;
            }
            .ris-resize-handle[data-direction="nw"] {
                top: 0;
                left: 0;
                cursor: nwse-resize;
            }
            .ris-resize-handle[data-direction="se"] {
                right: 0;
                bottom: 0;
                cursor: nwse-resize;
            }
            .ris-resize-handle[data-direction="sw"] {
                left: 0;
                bottom: 0;
                cursor: nesw-resize;
            }
            .ris-resize-handle[data-direction="sw"]::before {
                content: "";
                position: absolute;
                left: 4px;
                bottom: 4px;
                width: 10px;
                height: 10px;
                border-left: 2px solid rgba(0, 0, 0, 0.28);
                border-bottom: 2px solid rgba(0, 0, 0, 0.28);
                border-radius: 0 0 0 3px;
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
            @media (max-width: 480px), (max-height: 620px) {
                .ris-panel {
                    top: 8px;
                    right: 8px;
                    top: max(8px, env(safe-area-inset-top));
                    right: max(8px, env(safe-area-inset-right));
                    width: min(212px, calc(100vw - 16px));
                    max-width: calc(100vw - 16px);
                    max-height: calc(100vh - 64px);
                    max-height: calc(100dvh - 64px - env(safe-area-inset-bottom));
                    border-radius: 12px;
                    font-size: 12px;
                }
                .ris-content {
                    padding: 10px;
                }
                .ris-section-title {
                    font-size: 10px;
                    margin-bottom: 5px;
                    padding: 0 2px;
                }
                .ris-option {
                    padding: 6px 8px;
                    margin-bottom: 3px;
                    border-radius: 7px;
                    font-size: 12px;
                }
                .ris-divider {
                    margin: 8px 0;
                }
                .ris-drag-hint {
                    margin-top: 6px;
                    font-size: 10px;
                }
                .ris-close-btn {
                    padding: 7px;
                    margin-top: 6px;
                    font-size: 12px;
                }
                .ris-resize-handle[data-direction="ne"],
                .ris-resize-handle[data-direction="nw"],
                .ris-resize-handle[data-direction="se"],
                .ris-resize-handle[data-direction="sw"] {
                    width: 20px;
                    height: 20px;
                }
            }
            @media (max-height: 520px) {
                .ris-panel {
                    width: min(220px, calc(100vw - 16px));
                }
                .ris-content {
                    padding: 8px;
                }
                .ris-option {
                    padding: 5px 8px;
                    margin-bottom: 2px;
                }
                .ris-section-title {
                    margin-bottom: 4px;
                }
                .ris-divider {
                    margin: 6px 0;
                }
                .ris-drag-hint {
                    display: none;
                }
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
        applyMenuSize(menu, getMenuSize());
        document.body.appendChild(menu);

        const content = document.createElement("div");
        content.className = "ris-content";
        menu.appendChild(content);

        // Make the menu draggable
        makeDraggable(menu);

        // Image source options
        const sourceTitle = document.createElement("div");
        sourceTitle.className = "ris-section-title";
        sourceTitle.textContent = lang("selectImageSource");
        content.appendChild(sourceTitle);

        imageSources.forEach((source) => {
            const sourceOption = document.createElement("div");
            sourceOption.className = "ris-option";
            sourceOption.textContent = source.text;
            sourceOption.id = source.id;
            sourceOption.addEventListener("click", source.handler);
            content.appendChild(sourceOption);
        });

        // Divider between sections
        const divider = document.createElement("div");
        divider.className = "ris-divider";
        content.appendChild(divider);

        // Search engine buttons
        const engineTitle = document.createElement("div");
        engineTitle.className = "ris-section-title";
        engineTitle.textContent = lang("selectSearchEngine");
        content.appendChild(engineTitle);

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
            content.appendChild(engineOption);
        });

        // Add drag hint
        const dragHint = document.createElement("div");
        dragHint.className = "ris-drag-hint";
        dragHint.textContent = lang("dragHint");
        content.appendChild(dragHint);

        const closeButton = document.createElement("button");
        closeButton.className = "ris-close-btn";
        closeButton.textContent = lang("close");
        closeButton.addEventListener("click", () => {
            menu.remove();
        });
        content.appendChild(closeButton);

        ["n", "e", "s", "w", "ne", "nw", "se", "sw"].forEach((direction) => {
            const resizeHandle = document.createElement("button");
            resizeHandle.type = "button";
            resizeHandle.className = "ris-resize-handle";
            resizeHandle.dataset.direction = direction;
            resizeHandle.tabIndex = -1;
            resizeHandle.title = "Resize";
            resizeHandle.setAttribute("aria-label", "Resize menu");
            menu.appendChild(resizeHandle);
            makeResizable(menu, resizeHandle, direction);
        });
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

    // Handle paste image from clipboard
    function pasteImage() {
        imgType = "clipboard";

        const overlay = document.createElement("div");
        overlay.className = "ris-paste-overlay";

        const dialog = document.createElement("div");
        dialog.className = "ris-paste-dialog";

        const title = document.createElement("div");
        title.className = "ris-paste-dialog-title";
        title.textContent = lang("pasteDialogTitle");

        // Focusable paste target — supports Ctrl+V on desktop and long-press on mobile
        const pasteArea = document.createElement("div");
        pasteArea.className = "ris-paste-area";
        pasteArea.contentEditable = "true";
        pasteArea.textContent = lang("pasteDialogHint");

        const cancelBtn = document.createElement("button");
        cancelBtn.className = "ris-paste-dialog-cancel";
        cancelBtn.textContent = lang("pasteDialogCancel");

        dialog.appendChild(title);
        dialog.appendChild(pasteArea);
        dialog.appendChild(cancelBtn);
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);

        // Auto-focus so keyboard paste works immediately
        setTimeout(() => pasteArea.focus(), 50);

        const close = () => {
            overlay.remove();
            clearTimeout(timeout);
        };

        cancelBtn.addEventListener("click", close);
        overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });

        pasteArea.addEventListener("paste", async (event) => {
            const items = event.clipboardData && event.clipboardData.items;
            let imageBlob = null;
            if (items) {
                for (const item of items) {
                    if (item.type.startsWith("image/")) {
                        imageBlob = item.getAsFile();
                        break;
                    }
                }
            }

            if (!imageBlob) {
                close();
                showToast(lang("clipboardEmpty"), "error");
                return;
            }

            event.preventDefault();
            clearTimeout(timeout);

            // Show uploading state
            pasteArea.contentEditable = "false";
            pasteArea.textContent = "";
            const uploading = document.createElement("span");
            uploading.className = "ris-paste-dialog-uploading";
            uploading.textContent = lang("pasteDialogUploading");
            pasteArea.appendChild(uploading);
            cancelBtn.remove();

            const uploadFile = new File([imageBlob], "clipboard-image.png", { type: imageBlob.type });
            imageSrc = await getUploadedImageLink(uploadFile);
            overlay.remove();
            if (imageSrc) {
                markSelected("paste-image");
            }
        });

        const timeout = setTimeout(close, 30000);
    }

    // Perform image search
    async function searchImage() {
        if (!file && imgType === "file") {
            showToast(lang("pleaseSelectFile"), "error");
            return;
        }
        if (imgType === "file") {
            imageSrc = await getUploadedImageLink(file);
            hideLoading(); // Hide loading animation after getting the link
        }
        if (!imageSrc) {
            return;
        }
        if (selectedEngine === "Copyseeker") {
            triggerCopyseekerSearch(imageSrc);
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

    function triggerCopyseekerSearch(url) {
        if (!/^https?:\/\//i.test(url)) {
            showToast(lang("copyseekerUrlOnly"), "error");
            return;
        }

        try {
            GM_setValue("ris_copyseeker_image_url", url);
            GM_openInTab("https://copyseeker.net/", { active: true, insert: true, setParent: true });
        } catch (error) {
            console.log("[reverse image search] Copyseeker open error: ", error);
            showToast(lang("uploadError"), "error");
        }
    }

    async function uploadToUguu(file) {
        const formData = new FormData();
        formData.append("files[]", file, file.name || "image.png");
        const response = new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: "POST",
                url: "https://uguu.se/upload",
                data: formData,
                onload: function (response) {
                    if (response.status !== 200) {
                        reject(response.responseText);
                        return;
                    }
                    const resp = JSON.parse(response.responseText);
                    console.log("upload response: ", resp);
                    if (!resp.success || !resp.files || !resp.files[0] || !resp.files[0].url) {
                        reject(resp);
                        return;
                    }
                    resolve(resp.files[0].url);
                },
                onerror: function (response) {
                    reject(response);
                },
            });
        });
        return await response;
    }

    /**
     * 使用 Uguu 将文件转为链接搜图
     * @param {*} file
     */
    async function getUploadedImageLink(file) {
        try {
            return await uploadToUguu(file);
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

    function autoSubmitCopyseekerSearch() {
        if (!window.location.hostname.includes("copyseeker.net")) return;

        let imageUrl = "";
        try {
            imageUrl = GM_getValue("ris_copyseeker_image_url", "");
        } catch (error) {
            return;
        }
        if (!imageUrl) return;

        const selectors = [
            "input#url",
            'input[name="url"]',
            'input[type="url"]',
            'input[placeholder*="URL" i]',
            'input[placeholder*="image" i]',
            'input[placeholder*="address" i]',
            "textarea"
        ];

        function findInput() {
            for (const selector of selectors) {
                const input = document.querySelector(selector);
                if (input) return input;
            }
            return null;
        }

        function setInputValue(input, value) {
            const prototype = input instanceof HTMLTextAreaElement
                ? HTMLTextAreaElement.prototype
                : HTMLInputElement.prototype;
            const descriptor = Object.getOwnPropertyDescriptor(prototype, "value");
            if (descriptor && descriptor.set) {
                descriptor.set.call(input, value);
            } else {
                input.value = value;
            }
            input.dispatchEvent(new Event("input", { bubbles: true }));
            input.dispatchEvent(new Event("change", { bubbles: true }));
        }

        function submitInput(input) {
            const form = input.closest("form");
            if (form && typeof form.requestSubmit === "function") {
                form.requestSubmit();
                return;
            }

            const button = document.querySelector(".search-button")
                || document.querySelector('button[type="submit"]')
                || Array.from(document.querySelectorAll("button")).find((item) => /search|submit|搜|find/i.test(item.textContent || ""));

            if (button) {
                button.click();
                return;
            }

            input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", code: "Enter", bubbles: true }));
            input.dispatchEvent(new KeyboardEvent("keyup", { key: "Enter", code: "Enter", bubbles: true }));
        }

        let retries = 0;
        const retryLimit = 40;
        const timer = setInterval(() => {
            const input = findInput();
            if (!input) {
                if (++retries >= retryLimit) clearInterval(timer);
                return;
            }

            clearInterval(timer);
            setInputValue(input, imageUrl);
            GM_setValue("ris_copyseeker_image_url", "");
            setTimeout(() => submitInput(input), 200);
        }, 150);
    }

    function clampMenuSize(width, height, maxWidth, maxHeight) {
        return {
            width: Math.min(maxWidth, Math.max(minMenuWidth, width)),
            height: Math.min(maxHeight, Math.max(minMenuHeight, height)),
        };
    }

    function getViewportMenuBounds() {
        const viewportWidth = window.visualViewport?.width || window.innerWidth || document.documentElement.clientWidth || 240;
        const viewportHeight = window.visualViewport?.height || window.innerHeight || document.documentElement.clientHeight || 320;
        const bottomReserve = window.matchMedia && window.matchMedia("(max-width: 480px), (max-height: 620px)").matches ? 64 : 16;
        return {
            maxWidth: Math.max(minMenuWidth, viewportWidth - 16),
            maxHeight: Math.max(minMenuHeight, viewportHeight - bottomReserve),
        };
    }

    function getMenuSize() {
        try {
            const raw = GM_getValue(menuSizeKey, "");
            if (!raw) return null;
            const size = typeof raw === "string" ? JSON.parse(raw) : raw;
            const width = Number(size.width);
            const height = Number(size.height);
            if (!Number.isFinite(width) || !Number.isFinite(height)) return null;

            const bounds = getViewportMenuBounds();
            return clampMenuSize(width, height, bounds.maxWidth, bounds.maxHeight);
        } catch (error) {
            return null;
        }
    }

    function applyMenuSize(element, size) {
        if (!size) return;
        element.style.width = `${size.width}px`;
        element.style.height = `${size.height}px`;
    }

    function saveMenuSize(width, height) {
        try {
            GM_setValue(menuSizeKey, JSON.stringify({ width: Math.round(width), height: Math.round(height) }));
        } catch (error) {}
    }

    function resetMenuSize(element) {
        element.style.width = "";
        element.style.height = "";
        try {
            GM_setValue(menuSizeKey, "");
        } catch (error) {}
    }

    function makeResizable(element, handle, direction) {
        let startX = 0;
        let startY = 0;
        let startLeft = 0;
        let startTop = 0;
        let startWidth = 0;
        let startHeight = 0;
        let startRight = 0;
        let startBottom = 0;
        let currentSize = null;

        function getResizeBounds() {
            const viewportWidth = window.visualViewport?.width || window.innerWidth || document.documentElement.clientWidth || 240;
            const viewportHeight = window.visualViewport?.height || window.innerHeight || document.documentElement.clientHeight || 320;
            const bottomReserve = window.matchMedia && window.matchMedia("(max-width: 480px), (max-height: 620px)").matches ? 64 : 8;
            return {
                maxWidth: direction.includes("w")
                    ? Math.max(minMenuWidth, startRight - 8)
                    : Math.max(minMenuWidth, viewportWidth - startLeft - 8),
                maxHeight: direction.includes("n")
                    ? Math.max(minMenuHeight, startBottom - 8)
                    : Math.max(minMenuHeight, viewportHeight - startTop - bottomReserve),
            };
        }

        function onPointerMove(e) {
            e.preventDefault();
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            const bounds = getResizeBounds();
            let width = startWidth;
            let height = startHeight;

            if (direction.includes("e")) {
                width = startWidth + dx;
            } else if (direction.includes("w")) {
                width = startWidth - dx;
            }

            if (direction.includes("s")) {
                height = startHeight + dy;
            } else if (direction.includes("n")) {
                height = startHeight - dy;
            }

            currentSize = clampMenuSize(width, height, bounds.maxWidth, bounds.maxHeight);

            if (direction.includes("w")) {
                element.style.left = `${startRight - currentSize.width}px`;
            }
            if (direction.includes("n")) {
                element.style.top = `${startBottom - currentSize.height}px`;
            }
            element.style.width = `${currentSize.width}px`;
            element.style.height = `${currentSize.height}px`;
        }

        function onPointerUp() {
            document.removeEventListener("pointermove", onPointerMove);
            document.removeEventListener("pointerup", onPointerUp);
            if (currentSize) {
                saveMenuSize(currentSize.width, currentSize.height);
            }
        }

        handle.addEventListener("mousedown", (e) => {
            e.stopPropagation();
        });

        handle.addEventListener("pointerdown", (e) => {
            e.preventDefault();
            e.stopPropagation();

            const rect = element.getBoundingClientRect();
            startX = e.clientX;
            startY = e.clientY;
            startLeft = rect.left;
            startTop = rect.top;
            startWidth = rect.width;
            startHeight = rect.height;
            startRight = rect.right;
            startBottom = rect.bottom;
            currentSize = { width: startWidth, height: startHeight };

            element.style.left = `${startLeft}px`;
            element.style.top = `${startTop}px`;
            element.style.right = "auto";

            document.addEventListener("pointermove", onPointerMove, { passive: false });
            document.addEventListener("pointerup", onPointerUp);
        });

        handle.addEventListener("dblclick", (e) => {
            e.preventDefault();
            e.stopPropagation();
            resetMenuSize(element);
        });
    }

    function makeDraggable(element) {
        let pos1 = 0,
            pos2 = 0,
            pos3 = 0,
            pos4 = 0;
        element.onmousedown = dragMouseDown;

        function dragMouseDown(e) {
            e = e || window.event;
            if (e.target && e.target.closest && e.target.closest(".ris-resize-handle")) return;
            e.preventDefault();
            const rect = element.getBoundingClientRect();
            element.style.left = `${rect.left}px`;
            element.style.top = `${rect.top}px`;
            element.style.right = "auto";
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

    autoSubmitCopyseekerSearch();
})();
