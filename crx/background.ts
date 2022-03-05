import { getRequestUrlPrams, getSaveRequestBody, filterRequestParams, getMockRequestBody } from './utils/utils';
// import { DefaultSetting } from './DefaultSetting';
import { StorageAll, StorageSetting, StorageItem, StorageItemData } from '../interfaces/common.interface';
import { Request } from '../interfaces/network.interface';

// chrome.storage.local.get(n => {console.log(n)})

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
      listUrlRemoveStr: [],
      filterUrl: [],
    };
    chrome.storage.local.set({
      setting,
    });
  }
});
chrome.storage.onChanged.addListener(() => {
  chrome.storage.local.get((res: StorageAll) => {
    storage = res;
    chrome.browserAction.setBadgeText({ text: '' });
    if (storage.setting?.openSave) {
      chrome.browserAction.setBadgeText({ text: 'save' });
      chrome.browserAction.setBadgeBackgroundColor({ color: '#409EFF' });
    }
    if (storage.setting?.openMock) {
      chrome.browserAction.setBadgeText({ text: 'mock' });
      chrome.browserAction.setBadgeBackgroundColor({ color: '#F56C6C' });
    }
  });
});

let locationUrl = '';

/* 
  MOCK：拦截请求并返回修改后的dataURL数据
*/
chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    // 检查是否开启MOCK开关
    if (!storage.setting?.openMock) {
      return;
    }

    const url = details.url;

    // 检查是否匹配配置生效的请求域名
    if (!new RegExp(storage.setting.openUrl).test(url)) {
      return;
    }

    console.log('MOCK-----details', details);

    // 检查是否匹配配置项filterUrl
    for (let n of storage.setting.filterUrl) {
      if (new RegExp(n).test(url)) {
        console.log('MOCK-----命中filterUrl');
        return;
      }
    }

    const requestBodyAll = getMockRequestBody(details.requestBody); // 获取请求体所有参数
    const requestBody = filterRequestParams(storage.setting.removeRequestBodyParams, requestBodyAll); // 过滤后请求体参数

    const storageKey = url.split('?')[0]; // 请求的url地址，storage中的key

    const response = (storage[storageKey]?.data ?? [])?.find((n) => {
      if (storage.setting.checkParams && n.requestParams !== JSON.stringify(getRequestUrlPrams(url))) {
        return false;
      }
      if (storage.setting.checkBody && n.requestBody !== requestBody) {
        return false;
      }
      return n.active;
    })?.response;
    console.log(response);

    if (!!response) {
      console.log('MOCK-----已拦截该请求');
      return {
        redirectUrl: `data:application/json;charset=UTF-8,${response}`,
      };
    }
  },
  { urls: [storage.setting?.openUrl ?? '<all_urls>'], types: ['xmlhttprequest'] },
  ['blocking', 'requestBody'],
);

chrome.runtime.onMessage.addListener((msg, sender, sendResponse): void => {
  /* 获取当前页面URL */
  if (!!msg.locationUrl) {
    locationUrl = msg.locationUrl;
  }

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
    const response: string = msg.network.response; // 服务器真实相应的数据

    // 过滤vue热更新请求
    if (/hot-update\.json/.test(request.url)) {
      console.log('SAVE-----hot-update');
      return;
    }

    // 检查是否匹配配置生效的请求域名
    if (!new RegExp(storage.setting.openUrl).test(request.url)) {
      return;
    }

    // 检查是否匹配配置项filterUrl
    for (const n of storage.setting.filterUrl) {
      if (request.url.includes(n)) {
        console.log('SAVE-----命中filterUrl');
        return;
      }
    }

    try {
      console.log('SAVE-----network中', request, JSON.parse(response));
    } catch (error) {}

    if (response === null) {
      console.log('SAVE-----response为空');
      return;
    }

    const requestParamsAll = getRequestUrlPrams(request.url); // 获取所有url中参数
    const requestParams = filterRequestParams(storage.setting.removeRequestUrlParams, requestParamsAll); // 过滤后的url参数

    const requestBodyAll = getSaveRequestBody(request); // 获取请求体所有参数
    const requestBody = filterRequestParams(storage.setting.removeRequestBodyParams, requestBodyAll); // 过滤后请求体参数

    console.log('SAVE-----过滤后的参数', requestParams, requestBody);

    const storageKey = request.url.split('?')[0]; // 请求的url地址，storage中的key

    // 检查重复
    const responseRepeat = storage[storageKey]?.data?.find?.((n) => {
      if (n.method !== request.method) {
        return false;
      }
      if (n.response !== response) {
        return false;
      }
      if (n.locationUrl !== locationUrl) {
        return false;
      }
      if (storage.setting.checkParams && n.requestParams !== requestParams) {
        return false;
      }
      if (storage.setting.checkBody && n.requestBody !== requestBody) {
        return false;
      }
      return true;
    });
    if (responseRepeat) {
      console.log('SAVE-----response重复，忽略');
      return;
    }

    /* 
      保存response至storage
    */
    let saveData: StorageItem = {
      ...(storage[storageKey] ?? {}),
      timestamp: Date.now(),
      data: [
        ...(storage[storageKey]?.data ?? []),
        {
          method: request.method,
          requestParams,
          requestBody,
          response,
          timestamp: Date.now(),
          locationUrl: locationUrl,
          name: '',
          active: false,
        },
      ],
    };

    if ((storage.setting?.limit && saveData.data.length > storage.setting?.limit) || (saveData.limit && saveData.data.length > saveData.limit)) {
      console.log('SAVE-----超出limit限制，删除最早的非active');
      const index = saveData.data.sort((a, b) => a.timestamp - b.timestamp).findIndex((n) => !n.active);
      saveData.data.splice(index, 1);
    }

    console.log('SAVE-----已保存该请求');
    chrome.storage.local.set({
      [storageKey]: saveData,
    });
  }

  // 保存storage为本地文件
  if (!!msg.download) {
    console.log('download');
    chrome.downloads.download(
      {
        url: URL.createObjectURL(new Blob([JSON.stringify(storage)], {type: "application/json"})),
        filename: `mock.${Date.now()}.json`,
      },
      () => {
        console.log('123')
        chrome?.runtime?.sendMessage({
          downloadSuccess: true,
        });
      },
    );
  }
});
