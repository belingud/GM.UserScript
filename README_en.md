# Enhanced Reverse Image Search

Description

Enhanced Reverse Image Search is a Tampermonkey script that allows you to search images using various methods such as local files, pasted links, or clicking on web images. It supports multiple search engines including Google Lens, TinEye, Yandex, Bing, Sogou, Baidu, trace, SauceNAO, IQDB, 3DIQDB, and ascii2d.

github: https://github.com/belingud/GM.UserScript

> Disclaimer: This script is allowed to be used on any page, but does not fetch the page content unless you click on the webpage image to search the image. It does not set any cache or indexdb in the browser, if you use a local file to search for images, it will be uploaded using an anonymous temporary cloud drive (currently using 0x0.st) and then searched using the image link. This script will not store or send any image link, only use the image link of the temporary cloud disk when opening a new page to search images.

## Features

- Select Image Source: Choose from local files, pasted URLs, or clicking images on the web.
- Search Engines Supported:
  - Google Lens
  - TinEye
  - Yandex
  - Bing
  - SouGou
  - Baidu
  - trace.moe
  - SauceNAO
  - IQDB
  - 3DIQDB
  - ascii2d
- Localization: Supports both English and Chinese.

## Installation
1. Install Tampermonkey extension for your browser.
2. Install script:
  - greasyfork: https://greasyfork.org/zh-CN/scripts/498955-%E4%BB%A5%E5%9B%BE%E6%90%9C%E5%9B%BE%E5%A2%9E%E5%BC%BA%E7%89%88
  - script cat: https://scriptcat.org/zh-CN/script-show-page/1943 


## Usage

1. Click the Tampermonkey icon and select "Reverse Image Search" from the menu.
2. Choose an image source:
    - Select File: Upload a local file.
    - Paste URL: Paste an image URL.
    - Click Image: Click an image on the current webpage.
3. Choose a search engine to perform the reverse image search.

Click on the initial screen of the extension:
![init screen](https://gmuserscript.lte.ink/popup_en.png)

**Select File** will open file manager for select.
**Paste URL** will open a promot to input image url.
![Paste URL](https://gmuserscript.lte.ink/pasteimg_en.png)

**Click Image** allows you to click on image tags (IMG tags) in a web page, but will not work if the tag is not an IMG or if there is a mask on the top layer of the image that doesn't allow direct access to the tag.

The state of the image after it has been selected:
![selected](https://gmuserscript.lte.ink/selected_en.png)

After selecting the image you can click on Select Search Engine to open a new page for searching.


## Localization

The script supports English and Chinese based on your browser's language settings.