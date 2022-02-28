window.onload = function () {
  chrome.runtime.sendMessage({ name: 'onunload', msg: {} }, function (response) {
  });
};
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {

  if (request.cmd == 'provider') {
    chrome.storage.local.get({ current: {} }, function (item) {
      if (request.mode == 'self') {

        let schedule
        eval(item.current.provider_html)
        let result
        try {
          result = scheduleHtmlProvider()
          if (typeof result.then === 'function') {
            result.then(function (ob) {
              result = ob.json
              saveData(result,request.mode)
            })
          } else {
            saveData(result,request.mode)
          }
          if (typeof result != 'string') { throw Error('Provider函数需返回一个字符串') }
        } catch (err) {
          console.error(err)
          console.error('此时scheduleHtmlProvider解析出的结果为' + result)

          // console.log(\"%c provider --> %c parser\", \"color:red;font-size:38px;\", \"color:red;font-size:38px;\");

          console.log("%c+------------------",
            `font-size: 30px;width:100%;
      background-image: url('http://cnbj1.fds.api.xiaomi.com/statics/AISchedule/bitmap_provider%20run%20fails.png?GalaxyAccessKeyId=5151729087601&Expires=9223372036854775807&Signature=PvlwLgpTShVWZHLM1iL0rc66knA=');
      background-size: contain ;
      background-repeat: no-repeat;
      color: transparent;`);
          return
          // return alert('您的scheduleHtmlProvider函数出错了，请看console输出')
        }
      } else {
        chrome.storage.local.get({ html: '' }, function (item) {

          saveData(item.html,request.mode)

        })
      }
      // 保存数据
      function saveData(result,mode) {

        chrome.storage.local.set({ html: result }, function () {
          // alert('获取html成功,请继续编写courseHtmlParser函数');
          if (mode == 'self') {

            win = window.open('', 'provider', 'scrollbars=yes,resizable=1,modal=false,alwaysRaised=yes');  //打开新的空白窗口
            win.document.write(`<body>${result}</body>`);
            win.document.close()
          }
          try {
            let $ = cheerio.load(result, { xmlMode: true })
            eval(item.current.parser)

            schedule = scheduleHtmlParser(result)
          } catch (err) {

            console.error(err)
            console.error('此时scheduleHtmlParser解析出的结果为' + schedule)
            console.log("%c+------------------",
              `font-size: 30px;width:100%;
      background-image: url('http://cnbj1.fds.api.xiaomi.com/statics/AISchedule/bitmap_provider%20run%20successfully.png?GalaxyAccessKeyId=5151729087601&Expires=9223372036854775807&Signature=q6OBK528yNynN2FVzzKQ/GBDAto=');
      background-size: contain ;
      background-repeat: no-repeat;
      color: transparent;`);
            console.log("%c+------------------",
              `font-size: 30px;width:100%;
      background-image: url('http://cnbj1.fds.api.xiaomi.com/statics/AISchedule/parser.png?GalaxyAccessKeyId=5151729087601&Expires=9223372036854775807&Signature=02lgEdsAO6X4iriMSGC5OKwS22Q=');
      background-size: contain ;
      background-repeat: no-repeat;
      color: transparent;`);

            // console.log(\"%c provider --> %c parser\", \"color:green;font-size:38px;\", \"color:red;font-size:38px;\");
            return
            // return alert('您的scheduleHtmlParser出错了，请看console输出')

          }
          // 通知background 去检测结果

          if (!testParser(schedule)) {
            console.log("%c+------------------",
              `font-size: 30px;width:100%;
  background-image: url('http://cnbj1.fds.api.xiaomi.com/statics/AISchedule/bitmap_provider%20run%20successfully.png?GalaxyAccessKeyId=5151729087601&Expires=9223372036854775807&Signature=q6OBK528yNynN2FVzzKQ/GBDAto=');
  background-size: contain ;
  background-repeat: no-repeat;
  color: transparent;`);
            console.log("%c+------------------",
              `font-size: 30px;width:100%;
  background-image: url('http://cnbj1.fds.api.xiaomi.com/statics/AISchedule/parser.png?GalaxyAccessKeyId=5151729087601&Expires=9223372036854775807&Signature=02lgEdsAO6X4iriMSGC5OKwS22Q=');
  background-size: contain ;
  background-repeat: no-repeat;
  color: transparent;`);
          } else {
            chrome.runtime.sendMessage({ name: 'testParser', msg: schedule }, function (response) {
            })
          }
        });
      }

    })
  };
  if (request.cmd == 'testParser') {
    let response = request.value
    let schedule = request.schedule
    if (response.status == 200) {
      // alert('scheduleHtmlParser通过测试啦，赶快点击右键上传函数吧')
      // console.log(\"%c provider --> %c parser\", \"color:green;font-size:38px;\", \"color:green;font-size:38px;\");
      console.log("%c+------------------",
        `font-size: 30px;width:100%;
      background-image: url('http://cnbj1.fds.api.xiaomi.com/statics/AISchedule/bitmap_all%20run%20successfully.png?GalaxyAccessKeyId=5151729087601&Expires=9223372036854775807&Signature=U2L5UtGw0RHVFkhpqc3+rP4PzUI=');
      background-size: contain ;
      background-repeat: no-repeat;
      color: transparent;`);
      win = window.open('', 'parser', 'scrollbars=yes,resizable=1,modal=false,alwaysRaised=yes');  //打开新的空白窗口
      win.document.write(`
      <!DOCTYPE html>
      <html lang="en">

      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Document</title>
          <style>
  pre {outline: 1px solid #ccc; padding: 5px; margin: 5px; }
  .string { color: green; }
  .number { color: darkorange; }
  .boolean { color: blue; }
  .null { color: magenta; }
  .key { color: red; }
     </style>
      </head>
      <body>
      <pre>   <code>${  JSON.stringify(schedule, null, 2).replace(/(\"(\\\\u[a-zA-Z0-9]{4}|\\\\[^u]|[^\\\\\"])*\"(\\s*:)?|\\b(true|false|null)\\b|-?\\d+(?:\\.\\d*)?(?:[eE][+\\-]?\\d+)?)/g, function (match) {
        var cls = 'number';
        if (/^\"/.test(match)) {
          if (/:$/.test(match)) {
            cls = 'key';
          } else {
            cls = 'string';
          }
        } else if (/true|false/.test(match)) {
          cls = 'boolean';
        } else if (/null/.test(match)) {
          cls = 'null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
      })} </code></pre>
           </body>

      </html>
   `);
      win.document.close()

    } else {
      console.warn("得出的结果格式不对哦,错误原因：" + response.data);
    }

  };
  sendResponse('done')
});