var request = require('request');
var fs = require('fs');
const Tool = {
  wow:{
    isMillisecondStamp:function(num){if(num.length===10){return num*1000;}else if(num.length===13) {return num;}else {console.log(num+"不是一个标准的时间戳！");return false;}},
    ifStringGetElementById:function(target){if(typeof target==="string") {return document.getElementById(target);}else {return target;}},
  },
  text: {
    //分割字符串
    cutString:function(original,before,after,index) {
      index = index || 0;
      if (typeof index === "number") {
        const P = original.indexOf(before, index);
        if (P > -1) {
          if (after) {
            const f = original.indexOf(after, P + before.length);
            return (f>-1)? original.slice(P + before.toString().length, f):console.error("Tool [在文本中找不到 参数三 "+after+"]");
          } else {
            return original.slice(P + before.toString().length);
          }
        } else {
          console.error("Tool [在文本中找不到 参数一 " + before + "]");
          return
        }
      } else {
        console.error("Tool [sizeTransition:" + index + "不是一个整数!]");
      }
    },
    //根据一个基点分割字符串  实例：http://myweb-10017157.cos.myqcloud.com/20161212/%E7%BB%83%E4%B9%A0.zip
    cutStringPoint:function (original,str, before, after,order, index) {index = index || 0;if (typeof index === "number") {const O = original.indexOf(str, index);const P = (order[0]==="1")?original.lastIndexOf(before, O):original.indexOf(before, O);if (P > -1) {if (after) {let f ;switch (order[1]){case "1":f = original.indexOf(after, P + 1);break;case "2":f = original.indexOf(after, O + 1);break;case "3":f = original.lastIndexOf(after, O + 1);break;}return (f>-1)? original.slice(P + before.toString().length, f):console.error("Tool [在文本中找不到 参数三 "+after+"]");}else {return original.slice(P + before.toString().length);}}else {console.error("Tool [在文本中找不到 参数一 " + before + "]");}} else {console.error("Tool [sizeTransition:" + index + "不是一个整数!]");}},
    //分割字符串组
    cutStringArray:function(original,before,after,index){var aa=[],ab=0;while(original.indexOf(before,index)>0){aa[ab]=Tool.text.cutString(original,before,after,index);index=original.indexOf(before,index)+1;ab++;}return aa;},
    randomString:function(n){const str = 'abcdefghijklmnopqrstuvwxyz9876543210';let tmp = '',i = 0,l = str.length;for (i = 0; i < n; i++) {tmp += str.charAt(Math.floor(Math.random() * l));}return tmp;},
    replaceAll: function (temp, oString, nString) {
      if (!temp) return temp
      var startInd = -1
      while (temp.indexOf(oString, startInd) >= 0) {
        const findIndex = temp.indexOf(oString, startInd)
        temp = temp.substr(0, findIndex) + nString + temp.substr(findIndex + oString.length)
        startInd = findIndex + (nString.length - oString.length)
      }
      return temp
    },
    countSubstr: function (temp, oString) {
      if (!temp) return temp
      var startInd = -1
      var tempIndex = 0
      while (temp.indexOf(oString, startInd) >= 0) {
        const findIndex = temp.indexOf(oString, startInd)
        startInd = findIndex + 1
        tempIndex++
      }
      return tempIndex
    }
  },
  num: {
    randomNum: function (minNum,maxNum){ 
      switch(arguments.length){ 
        case 1: 
          return parseInt(Math.random()*minNum+1,10); 
        break; 
        case 2: 
          return parseInt(Math.random()*(maxNum-minNum+1)+minNum,10); 
        break; 
        default: 
          return 0; 
        break;
      }
    }
  },
  date: {
      GetDateStr: function (AddDayCount) {
        var dd = new Date();
        dd.setDate(dd.getDate()+AddDayCount);//获取AddDayCount天后的日期
        var y = dd.getFullYear();
        var m = dd.getMonth()+1;//获取当前月份的日期
        var d = dd.getDate();
        return y+"-"+m+"-"+d;
    }
  }
}

const Cookie = 'stockx_device_id=72e550b5-32dd-4a2f-98a8-29aafcc41aa9; stockx_session=74c3df51-1489-4071-8f19-8e541b1b79f3; __cf_bm=_PE1DDaHJrYo7hyZf57ZLiJ_1VFIPDDHjxhRsftSsfs-1651107607-0-AY4Qxb6VUOLPEs6OWm/rgEb0qfb97AbCHpZ4PikKm/lO/exXUnjKNckasTBxW9cDjPnwX/HM2hldXDZQFbj2JuE=; pxcts=8d41ae47-c68e-11ec-a8ae-4776696d736e; _pxvid=8d419f2b-c68e-11ec-a8ae-4776696d736e; riskified_recover_updated_verbiage=true; ops_banner_id=blt055adcbc7c9ad752; _ga=undefined; __ssid=77bd199e63be0f4018d364fc671c663; rskxRunCookie=0; rCookie=blwu80w8wli1nupjgiznh3l2iauc7y; language_code=zh; stockx_selected_locale=zh; stockx_selected_region=CN; stockx_dismiss_modal=true; stockx_dismiss_modal_set=2022-04-28T01:01:02.598Z; stockx_dismiss_modal_expiration=2023-04-28T01:01:02.596Z; forterToken=bfa0e82b710148ec809ec10f458d9801_1651107672557__UDF43_13ck; stockx_homepage=sneakers; _px3=4ff2b5e6ff02d2debd825c157300e8d05e5de730686c173f4e44009b115a8801:DWbss9lJhVCqcB4CyjQPPczndhNkyyrFo2rtB1NkXCuTsEl0TFBj+it0yUvqWj+pikx/fxJFaffizj+v9H+Yew==:1000:+qlMeN1AxNWdcChG32B93UTCMYE3h9/kLRsyWMCw/7hFdk5sJF1N8adORC68/Z2IZeIxqkPwPiRCILQEJHkI9I3RZVdk+iqU+ngSntC8wED+2WOcRbRM1zEukAiK0hZlmEL6wk5S0J3bfGcY9lIYmDzAzObUG0RM/wYTfRErGRb4FKYOnHR2zM+Neqt9nlsQHMrt8NMkckGmotWXKEqOjQ==; _pxde=57c67d3f6a9f034db2cd415fe14f15b0b2ce759f880bc24c159ac63d33359047:eyJ0aW1lc3RhbXAiOjE2NTExMDc5MTI0MTksImZfa2IiOjB9; lastRskxRun=1651108081231; _dd_s=rum=0&expire=1651108981039'

function getMoreInfo (urlKey) {
  var options = {
    'method': 'GET',
    'url': 'https://stockx.com/zh-cn/' + urlKey,
    'headers': {
      'accept': '*/*',
      'Cookie': Cookie,
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36'
    }
  };
  request(options, function (error, response) {
    if (error) throw new Error(error);
    const JSONData = Tool.text.cutString(response.body, 'window.__APOLLO_STATE__ = ', ';')
    const variants = Object.values(JSON.parse(JSONData).ROOT_QUERY)[1].variants
    // console.log(variants)
    let list = {}
    variants.forEach(element => {
      
      element = Object.values(element)[2]
      element = Object.values(element)[1]
      // console.log(element)
      if (element.lowestAskSize) {
        list[element.lowestAskSize * 10] = element.lowestAsk
      }
      
    });
    // console.log(list)
    // console.log(gooldsList, urlKey)
    gooldsList[urlKey].push(list)
    caiji()
  });
}
let gooldsList = {}
function getMore (index) {
  console.log(`采集第[${index}]页数据中`)
  var options = {
    'method': 'GET',
    'url': 'https://stockx.com/api/browse?browseVerticals=sneakers&sort=most-active&order=DESC&page=' + index,
    'headers': {
      'accept': '*/*',
      'Cookie': Cookie,
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36'
    }
  };
  request(options, function (error, response) {
    if (error) throw new Error(error);
    const data = JSON.parse(response.body)
    // console.log(data.Products[0])
    // getMoreInfo(data.Products[0].urlKey)
    for (const key in data.Products) {
        if (Object.hasOwnProperty.call(data.Products, key)) {
          const element = data.Products[key];
          if (element.urlKey) {
            gooldsList[element.urlKey] = [element.market.salesLast72Hours, element.urlKey, element.styleId]
            duibiData(element.styleId)
          }
        }
    }
    // console.log(gooldsList)
    if (index < 1) {
      getMore(++index)
    } else {
      caiji()
    }
    
  });
}

getMore(1)


let caijiIndex = 1
function caiji () {
  // console.log(`采集到商品数量${Object.keys(gooldsList).length}个`)
  for (const key in gooldsList) {
    if (Object.hasOwnProperty.call(gooldsList, key)) {
      const element = gooldsList[key];
      if (element.length < 4) {
        console.log(`采集商品详情进度:${caijiIndex++}/${Object.keys(gooldsList).length}`)
        getMoreInfo(element[1])
        return
      }
    }
  }
  fs.writeFileSync('./stockxData.json', JSON.stringify(gooldsList))
  console.log(gooldsList)
}


function duibiData (key) {
  var options = {
    'method': 'GET',
    'url': 'https://snkrdunk.com/v1/sneakers/' + key + '/size/list',
    'headers': {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36'
    }
  };
  request(options, function (error, response) {
    if (error) throw new Error(error);
    console.log(response.body);
  });  
}