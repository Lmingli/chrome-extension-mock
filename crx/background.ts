import { getRequestUrlPrams } from './utils/utils';
import { StorageAll, StorageSetting } from './interfaces/common.interface';
import { Request } from './interfaces/network.interface';


let storage: StorageAll = {};
chrome.storage.local.get((res) => {
  storage = res;

  if (!res.setting) {
    const setting: StorageSetting = {
      openSave: false,
      openMock: false,
      openUrl: '127.0.0.1:8888',
      limit: null,
      checkParams: true,
      checkBody: true,
      removeRequestUrlParams: [],
      removeRequestBodyParams: ['t'],
      listUrlRemoveStr: '',
      filterUrl: [],
    }
    chrome.storage.local.set({
      setting,
    })
  }
})
chrome.storage.onChanged.addListener(() => {
  chrome.storage.local.get((res: StorageAll) => {
    storage = res;
  })
})






/* 
  MOCK：拦截请求并返回修改后的dataURL数据
*/
chrome.webRequest.onBeforeRequest.addListener(details => {
  if (!storage.setting?.openMock) {
    return;
  }
  
  const url = details.url;
  if (!new RegExp(storage.setting.openUrl).test(url)) {
    return;
  }
  console.log('details', details);

  for (let n of storage.setting.filterUrl) {
    if (new RegExp(n).test(url)) {
      console.log('命中filterUrl');
      return;
    }
  }

  let requestBody = '{}';
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
      for (let n of storage.setting.removeRequestBodyParams) {
        delete parseBody[n];
      }
      requestBody = JSON.stringify(parseBody);
    } catch (error) {
      console.log('error---requestBody.raw转string', error);
    }
  }


  const storageKey = url.split('?')[0];

  const val = (storage[storageKey] || []).filter(n => (storage.setting.checkParams ? n.requestParams === getRequestUrlPrams(storage.setting, url) : true) && (storage.setting.checkBody ? n.requestBody === requestBody : true));
  
  let res = val.find(n => n.active)?.response;

  return {
    redirectUrl: !res ? null : (`data:application/json;charset=UTF-8,${(res)}`)
  }
}, {urls: [storage.setting?.openUrl ?? "<all_urls>"], types: ["xmlhttprequest"]}, ["blocking", "requestBody"]);



chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  /* 
    SAVE
    接收devtool捕获的请求
    并保存至chrome.storage
  */
  if (!!msg.network) {
    // 检查是否开启保存开关
    if (!storage.setting?.openSave) {
      return;
    }

    const request: Request = msg.network.request;
    const response: string = msg.network.response;  // 服务器真实相应的数据

    // 过滤vue热更新请求
    if (/hot-update\.json/.test(request.url)) {
      console.log('hot-update')
      return;
    }

    // 检查是否匹配配置生效的请求域名
    if (!new RegExp(storage.setting.openUrl).test(request.url)) {
      return;
    }

    // 检查是否匹配配置项filterUrl
    for (const n of storage.setting.filterUrl) {
      if (request.url.includes(n)) {
        console.log('命中filterUrl');
        return;
      }
    }
    

    console.log(request, response)

    if (response === null) {
      return;
    }

    const requestParams = getRequestUrlPrams(storage.setting, request.url);
    console.log(requestParams)
    let requestBody = '{}';
    if (/x-www-form-urlencoded/.test(request?.postData?.mimeType)) {
      requestBody = decodeURIComponent((request.postData.params ?? []).map(n => `${n.name}=${n.value}`).join('&'));
    }
    if (/application\/json/.test(request?.postData?.mimeType)) {
      requestBody = request.postData.text;
      try {
        let parseBody = JSON.parse(requestBody);
        for (let n of storage.setting.removeRequestBodyParams) {
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

