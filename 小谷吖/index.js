import amqp from 'amqplib';
import fetch from 'node-fetch';

var rabbitmq = {
  hostname: "rabbitmq.port.run",
  port: "5672",
  username: "小谷吖",
  password: "UFVbNHbVUkmb",
  authMechanism: "AMQPLAIN",
  pathname: "/",
  durable: true,
  ssl: {
    enabled: false
  }
}
const open = amqp.connect(rabbitmq)
var q = '小谷吖';
open.then(function(conn) {
  return conn.createChannel();
}).then(function(ch) {
  return ch.assertQueue(q, {durable: true}).then(function(ok) {
    return ch.consume(q, function(msg) {
      let messageTemp = msg.content.toString()
      console.log(messageTemp)
      messageTemp = JSON.parse(messageTemp)
      if (messageTemp.type == 'getBookInfo') {
        getBookInfo(messageTemp.data)
      }
    }, {noAck: true});
  });
}).catch(console.warn);


var myHeaders = {
  "jwt": "eyJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE2NjA4MjUwNzksInN1YiI6IntcImlzdXVlZEF0XCI6MTY2MDgyNTA3OTU2MSxcIm9wZW5JZFwiOlwib2Myem01VC03Uk9zdXlCLWQ0N1F1bkNYY0tUb1wiLFwidXNlcklkXCI6MzAwNjE2N30iLCJleHAiOjE2NjE0Mjk4Nzl9.zQ_oKXHWyNOEBTaOzIrQT2et59V5-35yZN2VLHHoy6Q",
  "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 15_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.20(0x18001442) NetType/WIFI Language/zh_CN",
  "Content-Type": "application/json"
}

function getBookInfo(keyword) {

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
    .then(response => response.json())
    .then(result => {
      const dataTemp = result.data.list[0]
      checkKC(dataTemp.id)
    })
    .catch(error => console.log('error', error));
}

function randomString (n) {const str = 'abcdefghijklmnopqrstuvwxyz9876543210';let tmp = '',i = 0,l = str.length;for (i = 0; i < n; i++) {tmp += str.charAt(Math.floor(Math.random() * l));}return tmp;}

function checkKC (proId) {
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
      for (let index = 0; index < result.data.spec_items.length; index++) {
        const element = result.data.spec_items[index];
        if (element.stock > 0) {
          console.log(`[${proId}]-发现库存:${element.memo}`)
          yuxiadan(proId, element.id)
          break
        } else {
          console.log(`[${proId}]-没有库存:${element.memo}`)
        }
      }
    })
    .catch(error => console.log('error', error));
}

function yuxiadan (productId, specId) {
  console.log(`[${productId}]-准备下单`)
  var raw = JSON.stringify({
    "btdIds": null,
    "couponUserId": null,
    "items": `[{\"productId\":${productId},\"pcount\":1,\"specId\":${specId},\"bookTokenDetailIds\":\"\"}]`,
    "receiverId": 1328456,
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
      xiadan(productId, specId, tokenStr)
    })
    .catch(error => console.log('error', error));
}

function xiadan(productId, specId, tokenStr) {
  var raw = JSON.stringify({
    "couponUserId": null,
    "items": `[{\"productId\":${productId},\"pcount\":1,\"specId\":${specId},\"bookTokenDetailIds\":\"\"}]`,
    "memo": "",
    "postFee": 0,
    "receiverId": 1328456,
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
      // console.log(result)
      console.log(`[${productId}]-下单成功`)
    })
    .catch(error => console.log('error', error));
}