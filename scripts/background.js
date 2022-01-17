let storage = {};
chrome.storage.local.get((res) => {
  storage = res;

  if (!res.setting) {
    chrome.storage.local.set({
      setting: {
        openSave: false,
        openMock: false,
        filter: '127.0.0.1:8888',
        limit: null,
        checkParams: true,
        checkBody: true,
        removeParams: ['t'],
      }
    })
  }
})
chrome.storage.local.onChanged.addListener(() => {
  chrome.storage.local.get((res) => {
    storage = res;
  })
})



// 拦截请求
chrome.webRequest.onBeforeRequest.addListener(details => {
  
  if (!storage.setting?.openMock) {
    return;
  }
  console.log('details', details);

  const url = details.url;
  if (!new RegExp(storage.setting.filter).test(url)) {
    return;
  }

  let requestBody = '';
  if (!!details.requestBody?.formData) {
    requestBody = Object.entries(details.requestBody.formData ?? {}).reduce((prev, cur) => prev + `${cur[0]}=${cur[1]}&`, '');
    if (requestBody.substring(requestBody.length - 1) === '&') {
      requestBody = requestBody.substring(0, requestBody.length - 1);
    }
  }
  if (!!details.requestBody?.raw) {
    try {
      let body = String.fromCharCode.apply(null, new Uint8Array(details.requestBody.raw[0].bytes));
      let parseBody = JSON.parse(body);
      for (let n of storage.setting.removeParams) {
        delete parseBody[n];
      }
      requestBody = JSON.stringify(parseBody);
    } catch (error) {
      console.log('error---requestBody.raw转string', error);
    }
  }


  const storageKey = url.split('?')[0];

  const val = (storage[storageKey] || []).filter(n => (storage.setting.checkParams ? n.requestParams === (url.indexOf('?') > -1 ? url.substring(url.indexOf('?') + 1) : '') : true) && (storage.setting.checkBody ? n.requestBody === requestBody : true));
  
  let res = val.find(n => n.active)?.response;

  return {
    redirectUrl: !res ? null : (`data:application/json;charset=UTF-8,${(res)}`)
  }
}, {urls: ["<all_urls>"], types: ["xmlhttprequest"]}, ["blocking", "requestBody"]);



chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  // 接收devtool捕获的请求
  if (!!msg.network) {
    if (!storage.setting?.openSave) {
      return;
    }

    const { request, response } = msg.network;
    if (!new RegExp(storage.setting.filter).test(request.url)) {
      return;
    }
    console.log(request, response)

    if (response === null) {
      return;
    }

    const requestParams = request.url.indexOf('?') > -1 ? request.url.substring(request.url.indexOf('?') + 1) : '';
    let requestBody = '';
    if (/x-www-form-urlencoded/.test(request?.postData?.mimeType)) {
      requestBody = decodeURIComponent((request.postData.params ?? []).map(n => `${n.name}=${n.value}`).join('&'));
    }
    if (/application\/json/.test(request?.postData?.mimeType)) {
      requestBody = request.postData.text;
      try {
        let parseBody = JSON.parse(requestBody);
        for (let n of storage.setting.removeParams) {
          delete parseBody[n];
        }
        requestBody = JSON.stringify(parseBody);
      } catch (error) {
        console.log('error---request.postData.text删除特定参数错误', error);
      }
    }

    const storageKey = request.url.split('?')[0];

    // 检查重复
    if (storage[storageKey]?.find?.(n => n.response === response && n.method === request.method && (storage.setting.checkParams ? n.requestParams === requestParams : true) && (storage.setting.checkBody ? n.requestBody === requestBody : true) )) {
      return;
    }

    let newVal = (storage[storageKey] || []).concat({
      method: request.method,
      requestParams,
      requestBody,
      response,
      name: '',
      timestamp: Date.now(),
      active: false,
    });
    if (storage.setting?.limit) {
      if (newVal.length > storage.setting?.limit) {
        newVal.splice(0, 1);
      }
    }
    chrome.storage.local.set({
      [storageKey]: newVal,
    })

  }
});

