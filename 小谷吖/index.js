const fetch = require('node-fetch')
const WebSocket = require('ws')
const fs = require('fs')

const ws = new WebSocket('ws://lamp.run:8083');

let proTemp = {}
if (fs.readFileSync('./proTemp.json')) {
  proTemp = JSON.parse(fs.readFileSync('./proTemp.json'))
}

ws.on('open', function open() {
  ws.send(JSON.stringify({"route": "login", "type": "小谷吖", "admin": false}));
});

ws.on('message', function message(data) {
  // console.log(JSON.parse(data));
  data = JSON.parse(data)
  switch (data.type) {
    case "getBookInfo":
      getBookInfo(data.value)
      break;
  
    default:
      break;
  }
});

// let messageTemp = msg.content.toString()
// console.log(messageTemp)
// messageTemp = JSON.parse(messageTemp)
// if (messageTemp.type == 'getBookInfo') {
//   getBookInfo(messageTemp.data)
// }

var myHeaders = {
  "jwt": "eyJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE2NjA5MTQxMzMsInN1YiI6IntcImlzdXVlZEF0XCI6MTY2MDkxNDEzMzI1MCxcIm9wZW5JZFwiOlwib2Myem01VE9KdVFxNVphMEVTWnFlTGdsV3NVc1wiLFwidXNlcklkXCI6MTYwMTAxfSIsImV4cCI6MTY2MTUxODkzM30.72HMiorLtkAUAWRvKCEtcZ08THl4uytn-ZnyDMmMXJE",
  "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 15_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.20(0x18001442) NetType/WIFI Language/zh_CN",
  "Content-Type": "application/json"
}


let isBusyIng = false

function getBookInfo(keyword) {
  if (!keyword) return
  console.log(`检查${keyword}`)
  if (proTemp[keyword] == "00000") {
    console.log(`[${keyword}]-没有对应书籍`)
    return
  }
  if (proTemp[keyword]) {
    checkKC(proTemp[keyword], keyword)
    return
  }
  if (isBusyIng) {
    setTimeout(() => {
      console.log(`[${keyword}]-休息等待重试中`)
    }, Math.random() * 500);
    return
  }
  // isBusyIng = true
  // setTimeout(() => {
  //   isBusyIng = false
  // }, 1000);
  
  var raw = JSON.stringify({
    "page": 1,
    "pageSize": 20,
    "orderBy": "",
    "orderType": "",
    "minPrice": null,
    "maxPrice": null,
    "isInStock": false,
    "categName": "",
    "keyword": keyword,
    "sign": randomString(32),
    "serverKey": "2016",
    "timestamp": 1660825240136
  });

  var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
  };

  fetch("https://api.xiaoguya.com:8442/product/pageList", requestOptions)
    .then(response => response.text())
    .then(result => {
      // console.log(result, keyword)
      if (result.includes('504 ')) {
        isBusyIng = true
        console.log(`[${keyword}]-网络错误稍后重试!`)
        setTimeout(() => {
          isBusyIng = false
        }, 2000);
        return
      }
      result = JSON.parse(result)
      if (result.data.list) {
        const dataTemp = result.data.list[0]
        proTemp[keyword] = dataTemp.id
        fs.writeFileSync('./proTemp.JSON', JSON.stringify(proTemp))
        checkKC(dataTemp.id, keyword)
      } else {
        proTemp[keyword] = "00000"
        console.log(`[${keyword}]-找不到对应书籍!`)
        fs.writeFileSync('./proTemp.JSON', JSON.stringify(proTemp))
      }
    })
    .catch(error => console.log('error', error));
}

function randomString (n) {const str = 'abcdefghijklmnopqrstuvwxyz9876543210';let tmp = '',i = 0,l = str.length;for (i = 0; i < n; i++) {tmp += str.charAt(Math.floor(Math.random() * l));}return tmp;}

let kcTemp = {}

function checkKC (proId, keyword) {
  if (kcTemp[proId]) {
    for (let index = 0; index < kcTemp[proId].data.spec_items.length; index++) {
      const element = kcTemp[proId].data.spec_items[index];
      if (element.stock > 0) {
        console.log(`[${proId}]-发现库存:${element.memo}`)
        yuxiadan(proId, element.id, keyword)
        return
      }
    }
    console.log(`[${keyword}]-没有库存`)
    return
  }
  var raw = JSON.stringify({
    "proId": proId,
    "serverKey": "2016",
    "sign": randomString(32),
    "timestamp": 1660834065017
  });

  var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
  };

  fetch("https://api.xiaoguya.com:8442/product/getSpecItems", requestOptions)
    .then(response => response.json())
    .then(result => {
      kcTemp[proId] = result
      setTimeout(() => {
        kcTemp[proId] = null
      }, 3000);
      for (let index = 0; index < result.data.spec_items.length; index++) {
        const element = result.data.spec_items[index];
        if (element.stock > 0) {
          console.log(`[${proId}]-发现库存:${element.memo}`)
          yuxiadan(proId, element.id, keyword)
          return
        }
      }
      console.log(`[${keyword}]-没有库存`)
    })
    .catch(error => console.log('error', error));
}

function yuxiadan (productId, specId, keyword) {
  console.log(`[${productId}]-准备下单`)
  var raw = JSON.stringify({
    "btdIds": null,
    "couponUserId": null,
    "items": `[{\"productId\":${productId},\"pcount\":1,\"specId\":${specId},\"bookTokenDetailIds\":\"\"}]`,
    "receiverId": 208608,
    "serverKey": "2016",
    "sign": randomString(32),
    "timestamp": 1660832975342,
    "useBtd": null
  });

  var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
  };

  fetch("https://api.xiaoguya.com:8442/order/settle", requestOptions)
    .then(response => response.json())
    .then(result => {
      const tokenStr = result.tokenStr
      // console.log(tokenStr)
      console.log(`[${productId}]-开始下单`)
      xiadan(productId, specId, tokenStr, keyword)
    })
    .catch(error => console.log('error', error));
}

function xiadan(productId, specId, tokenStr, keyword) {
  var raw = JSON.stringify({
    "couponUserId": null,
    "items": `[{\"productId\":${productId},\"pcount\":1,\"specId\":${specId},\"bookTokenDetailIds\":\"\"}]`,
    "memo": "",
    "postFee": 0,
    "receiverId": 208608,
    "serverKey": "2016",
    "shouldPayFee": 9.9,
    "sign": randomString(32),
    "timestamp": 1660832977948,
    "tokenStr": tokenStr
  });

  var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
  };

  fetch("https://api.xiaoguya.com:8442/order/submit", requestOptions)
    .then(response => response.json())
    .then(result => {
      console.log(result)
      console.log(`[${keyword}]-下单成功`)
      ws.send(JSON.stringify({"route": "submit", "type": "小谷吖", "value":[keyword]}));
    })
    .catch(error => console.log('error', error));
}


