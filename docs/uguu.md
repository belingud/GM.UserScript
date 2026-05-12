
### Endpoint

You may POST an array of files to **https://uguu.se/upload**, by default you will get a json response.

If you want a response in something else than json you add a flag to specify what format you want, for example **https://uguu.se/upload?output=csv**.

Valid response types are: json, csv, text, html and gyazo.

### Curl Example

curl -i -F files\[\]=@yourfile.jpeg https://uguu.se/upload

Example:

```shell
curl -i -F 'files[]=@icon.jpeg' https://uguu.se/upload    
HTTP/2 200 
server: nginx
date: Tue, 12 May 2026 03:38:45 GMT
content-type: application/json; charset=UTF-8
strict-transport-security: max-age=31536000; includeSubDomains; preload
cache-control: no-cache
strict-transport-security: max-age=31536000; includeSubDomains; preload

{
    "success": true,
    "files": [
        {
            "hash": "573d545f9f1d5a63",
            "filename": "HQcjAtiN.jpeg",
            "url": "https:\/\/n.uguu.se\/HQcjAtiN.jpeg",
            "size": 161122,
            "dupe": false
        }
    ]
}
```