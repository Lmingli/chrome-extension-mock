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

  console.log(storage)

  const url = details.url;
  if (!new RegExp(storage.setting.filter).test(url)) {
    return;
  }

  const data = details.requestBody?.formData ?? {};
  let requestBody = Object.entries(data).reduce((prev, cur) => prev + `${cur[0]}=${cur[1]}&`, '');
  if (requestBody.substring(requestBody.length - 1) === '&') {
    requestBody = requestBody.substring(0, requestBody.length - 1);
  }

  const storageKey = url.split('?')[0];

  const val = (storage[storageKey] || []).filter(n => (storage.setting.checkParams ? n.requestParams === url.substring(url.indexOf('?') + 1) : true) && (storage.setting.checkBody ? n.requestBody === requestBody : true));
  
  let res = '';
  if (val.find(n => n.active)?.response) {
    res = val.find(n => n.active)?.response;
  } else if (val.length > 0) {
    res = val[0].response;
  }

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
    console.log(request, response, typeof response)

    const requestParams = request.url.substring(request.url.indexOf('?') + 1);
    const requestBody = decodeURIComponent((request.postData.params ?? []).map(n => `${n.name}=${n.value}`).join('&'));

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

