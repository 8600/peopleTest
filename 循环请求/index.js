var request = require('request');


function getData () {
  var options = {
    'method': 'POST',
    'url': 'https://appointment-backend-cdn.dataesb.com/api/appointment/pub_add/',
    'headers': {
      'content-type': 'application/json;charset=UTF-8',
      'unionid': 'oF-BrwGnGfL7isjeKyqjcyjkABTw',
      'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.20(0x18001442) NetType/WIFI Language/zh_CN',
      'origin': 'https://appointment-users.dataesb.com'
    },
    body: '{"subLibId":"36","scheduleId":1386321,"children":0,"card":"220721200108124812","cardType":"IDCARD","name":"白玉松","phone":"15577502394","childrenConfig":false,"code":""}'
  
  };
  request(options, function (error, response) {
    if (error) throw new Error(error);
    console.log(response.body);
  });
}

setInterval(() => {
  getData()
}, 800);