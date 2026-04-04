## 1. UI Updates

- [x] 1.1 Add "Paste Image" option to `imageSources` array with `pasteImage` handler
- [x] 1.2 Add translation keys for paste image UI text (en: "Paste Image", zh: "粘贴图片")
- [x] 1.3 Add "paste-image" id to the option element for selection styling

## 2. Core Implementation

- [x] 2.1 Implement `pasteImage()` function using `navigator.clipboard.read()`
- [x] 2.2 Handle clipboard read success and extract image Blob
- [x] 2.3 Handle clipboard read failure with user-friendly messages
- [x] 2.4 Reuse existing `getTmpImgLink()` function to upload clipboard image
- [x] 2.5 Call `markSelected("paste-image")` after successful paste

## 3. Error Handling

- [x] 3.1 Display toast when clipboard is empty (no image found)
- [x] 3.2 Display toast when clipboard permission is denied
- [x] 3.3 Handle upload errors via existing error handling in `getTmpImgLink()`
