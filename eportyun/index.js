var fs = require('fs');
var request = require('request');
var readline = require('readline');
var rl = readline.createInterface(process.stdin,process.stdout);

let idList = fs.readFileSync('./id.txt').toString()

idList = idList.split('\r\n')

function runTest () {
  for (let index = 0; index < idList.length; index++) {
    const element = idList[index];
    if (element) {
      setTimeout(() => {
        var options = {
          'method': 'GET',
          'url': 'http://4pl.eportyun.com/xd/wxPushCtnByBill?id=' + element + '&tagRebrush=0',
          'headers': {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36',
          }
        };
        request(options, function (error, response) {
          if (error) throw new Error(error);
          console.log(response.body);
          if (response.body.includes('成功')) {
            process.stdout.write('\x07');
          }
        });
      }, index * 500);
    }
  }
}


rl.question('请输入请求间隔，默认3000: ',function(answer){
  answer = answer || 3000
  setInterval(() => {
    runTest()
  }, answer);
});
process.stdout.write('\x07')
