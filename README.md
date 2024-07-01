# 以图搜图增强版

## 描述

以图搜图增强版是一款Tampermonkey脚本，允许您使用本地文件、粘贴链接或点击网页图片的方式来进行以图搜图。它支持多种搜索引擎，包括Google Lens、TinEye、Yandex、Bing、搜狗、百度、trace、SauceNAO、IQDB、3DIQDB和ascii2d。

github: https://github.com/belingud/GM.UserScript

> 声明：本脚本允许在任何页面使用，但是不获取页面内容，除非使用点击网页图片的方式进行搜图。不在浏览器设置任何缓存和indexdb，如果使用本地文件进行以图搜图，会使用匿名临时云盘（目前使用0x0.st）上传后使用图片链接进行搜索。本脚本不会存储和发送任何图片链接，仅在打开新页面搜图时使用临时云盘的图片链接。

## 特点

- 选择图片来源：从本地文件、粘贴链接或点击网页图片中选择。
- 支持的搜索引擎：
  - Google Lens
  - TinEye
  - Yandex
  - Bing
  - 搜狗
  - 百度
  - trace.moe
  - SauceNAO
  - IQDB
  - 3DIQDB
  - ascii2d
- 本地化：支持英文和中文。

## 安装

1. 安装浏览器的Tampermonkey扩展。
2. 安装脚本：
   - greasyfork：https://greasyfork.org/zh-CN/scripts/498955-%E4%BB%A5%E5%9B%BE%E6%90%9C%E5%9B%BE%E5%A2%9E%E5%BC%BA%E7%89%88
   - 脚本猫：https://scriptcat.org/zh-CN/script-show-page/1943

## 使用方法

1. 点击Tampermonkey图标并从菜单中选择“Reverse Image Search”。
2. 选择图片来源：
    - 选择文件：上传本地文件。
    - 粘贴链接：粘贴图片链接。
    - 点击图片：点击当前网页上的图片。
3. 选择一个搜索引擎进行反向图像搜索。

点击扩展的初始界面：

![](https://gmuserscript.lte.ink/popup.png)

**选择文件**会打开文件管理器进行文件选择。
**粘贴链接**会打开输入框输入URL。

![](https://gmuserscript.lte.ink/pasteimg.png)

**点击图片**允许你点击网页中的图片标签(IMG标签)，但是如果标签不是一个IMG，或者图片上层有一个蒙版无法直接获取到标签，则会无效。

选择图片之后的状态：

![](https://gmuserscript.lte.ink/selected.png)

选择完图片之后可以点击选择搜索引擎打开新页面搜索。

## 本地化

脚本根据您的浏览器语言设置支持英文和中文。