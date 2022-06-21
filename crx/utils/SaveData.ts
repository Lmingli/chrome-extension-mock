import { StorageAll, StorageItem } from '../../interfaces/common.interface';
import { getRequestUrlPrams, getSaveRequestBody, filterRequestParams, commonCheckMatch } from './utils';

const defaultSetting = {
  openSave: false,
  openMock: false,
  openUrl: '127.0.0.1:8888',
  limit: null,
  checkParams: true,
  checkBody: true,
  openUrlList: ['127.0.0.1:8888'],
  tag: '',
  tagList: [],
  removeRequestUrlParams: [],
  removeRequestBodyParams: ['t'],
  listUrlRemoveStr: [],
  filterUrl: [],
}

/* 
  SAVE
  接收devtool捕获的请求
  并保存至chrome.storage
*/
export default async({ request, response, locationUrl = '' }) => {
  let storage: StorageAll = await chrome.storage.local.get();
  storage.setting ||= defaultSetting;
  

  // 检查是否开启保存开关
  if (!storage.setting?.openSave) {
    return;
  }

  chrome?.runtime?.sendMessage({
    locationUrl,
  });

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
    if (new RegExp(n).test(request.url)) {
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


  const storageKey = request.url.split('?')[0]; // 请求的url地址，storage中的key


  const requestParamsAll = getRequestUrlPrams(request.url); // 获取所有url中参数
  const requestParamsObj = filterRequestParams({
    params: requestParamsAll,
    filter: [
      ...storage.setting.removeRequestUrlParams,
      ...(storage[storageKey]?.removeRequestUrlParams ?? []),
    ], 
  }); 
  const requestParams = JSON.stringify(requestParamsObj); // 过滤后的url参数

  const requestBodyAll = getSaveRequestBody(request); // 获取请求体所有参数
  const requestBodyObj = filterRequestParams({
    params: requestBodyAll,
    filter: [
      ...storage.setting.removeRequestBodyParams,
      ...(storage[storageKey]?.removeRequestBodyParams ?? []),
    ],
  });
  const requestBody = JSON.stringify(requestBodyObj); // 过滤后请求体参数

  console.log('SAVE-----过滤后的参数', requestParams, requestBody);


  // 检查重复
  const responseRepeat = storage[storageKey]?.data?.find?.((n) => {
    if (n.locationUrl !== locationUrl) {
      return false;
    }

    if (n.method !== request.method) {
      return false;
    }

    if (n.tag !== storage.setting?.tag) {
      return false;
    }

    const commonCheckResult = commonCheckMatch({
      setting: storage.setting,
      n,
      requestParams,
      requestBody,
      storageItem: storage[storageKey],
    });
    if (!commonCheckResult) {
      return false;
    }

    if (n.response !== response) {
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
        tag: storage?.setting?.tag,
      },
    ],
  };

  if ((storage.setting?.limit && saveData.data.length > storage.setting?.limit) || (saveData.limit && saveData.data.length > saveData.limit)) {
    console.log('SAVE-----超出limit限制，删除最早的非active');
    const index = saveData.data.sort((a, b) => a.timestamp - b.timestamp).findIndex((n) => !n.active);
    saveData.data.splice(index, 1);
  }

  console.log('SAVE-----已保存该请求');
  chrome?.runtime?.sendMessage({
    info: '已保存该请求',
  });

  chrome.storage.local.set({
    [storageKey]: saveData,
  });
}