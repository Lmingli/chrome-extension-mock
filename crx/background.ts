import { getRequestUrlPrams, getSaveRequestBody, filterRequestParams, getMockRequestBody, commonCheckMatch } from './utils/utils';
import { StorageAll, StorageSetting, StorageItem, StorageItemData } from '../interfaces/common.interface';
// import { Request } from '../interfaces/network.interface';


// let storage: StorageAll = {};
// chrome.storage.local.get((res) => {
//   storage = res;

//   if (!res.setting) {
//     const setting: StorageSetting = {
//       openSave: false,
//       openMock: false,
//       openUrl: '127.0.0.1:8888',
//       limit: null,
//       checkParams: true,
//       checkBody: true,
//       removeRequestUrlParams: [],
//       removeRequestBodyParams: ['t'],
//       listUrlRemoveStr: [],
//       filterUrl: [],
//     };
//     chrome.storage.local.set({
//       setting,
//     });
//   }
// });
// chrome.storage.onChanged.addListener(() => {
//   chrome.storage.local.get((res: StorageAll) => {
//     storage = res;
//     chrome.browserAction.setBadgeText({ text: '' });
//     if (storage.setting?.openSave) {
//       chrome.browserAction.setBadgeText({ text: 'save' });
//       chrome.browserAction.setBadgeBackgroundColor({ color: '#409EFF' });
//     }
//     if (storage.setting?.openMock) {
//       chrome.browserAction.setBadgeText({ text: 'mock' });
//       chrome.browserAction.setBadgeBackgroundColor({ color: '#F56C6C' });
//     }
//   });
// });


/* 
  MOCK：根据配置文件动态生成拦截请求规则，数据拼成dataURL并redirect，由chrome触发拦截操作
*/
// chrome.storage.onChanged.addListener(async() => {
//   console.log('background-----storage-onchanged');
//   const storage: StorageAll = await chrome.storage.local.get();

//   // 修改popup图标状态
//   // chrome.browserAction.setBadgeText({ text: '' });
//   // if (storage.setting?.openSave) {
//   //   chrome.browserAction.setBadgeText({ text: 'save' });
//   //   chrome.browserAction.setBadgeBackgroundColor({ color: '#409EFF' });
//   // }
//   // if (storage.setting?.openMock) {
//   //   chrome.browserAction.setBadgeText({ text: 'mock' });
//   //   chrome.browserAction.setBadgeBackgroundColor({ color: '#F56C6C' });
//   // }


//   const oldRules = await chrome.declarativeNetRequest.getDynamicRules() ?? [];
//   const removeRuleIds = oldRules.map(n => n.id);

  
//   if (!storage.setting?.openMock) {
//     await chrome.declarativeNetRequest.updateDynamicRules({
//       removeRuleIds,
//     })
//     return;
//   }
  

//   /* 新增规则 */
//   let addRules = [];

//   let id = 1;
//   const addRuleFn = (storageKey, storageItemData: StorageItemData) :void => {
//     const requestParams = JSON.parse(storageItemData.requestParams || '{}');
//     const urlParamsRegex = Object.entries(requestParams).reduce((prev, cur) => prev + cur[0] + '=' + cur[1] + '.*', '');

//     const redirectUrl = `data:application/json;charset=UTF-8,${storageItemData.response}`;

//     addRules.push({
//       id: (id ++),
//       priority: 1,
//       action: {
//         type: "redirect",
//         redirect: {
//           url: redirectUrl,
//         },
//       },
//       condition: {
//         regexFilter: `${storageKey}.*${urlParamsRegex}`,
//         requestMethods: [storageItemData.method.toLowerCase()],
//         resourceTypes: ['xmlhttprequest'],
//       },
//     });
//   }

//   // 取出storage中所有active
//   let allActiveResponse = [];
//   for (let n in storage) {
//     if (n !== 'setting') {
//       const storageItem: StorageItem = storage[n];
//       for (let x of storageItem.data) {
//         if (x.active) {
//           addRuleFn(n, x);
//         }
//       }
//     }
//   }


//   console.log('background-----addRules', addRules);
//   await chrome.declarativeNetRequest.updateDynamicRules({
//     removeRuleIds,
//     addRules,
//   })

// })
// chrome.webRequest.onBeforeRequest.addListener(
//   (details) => {
//     // 检查是否开启MOCK开关
//     if (!storage.setting?.openMock) {
//       return;
//     }

//     const url = details.url;

//     // 检查是否匹配配置生效的请求域名
//     if (!new RegExp(storage.setting.openUrl).test(url)) {
//       return;
//     }

//     console.log('MOCK-----details', details);

//     // 检查是否匹配配置项filterUrl
//     for (let n of storage.setting.filterUrl) {
//       if (new RegExp(n).test(url)) {
//         console.log('MOCK-----命中filterUrl');
//         return;
//       }
//     }
    
  
//     const storageKey = url.split('?')[0]; // 请求的url地址，storage中的key


//     const requestParamsAll = getRequestUrlPrams(url); // 获取所有url中参数
//     const requestParamsObj = filterRequestParams({
//       params: requestParamsAll,
//       filter: [
//         ...storage.setting.removeRequestUrlParams,
//         ...(storage[storageKey]?.removeRequestUrlParams ?? []),
//       ], 
//     }); 
//     const requestParams = JSON.stringify(requestParamsObj); // 过滤后的url参数

//     const requestBodyAll = getMockRequestBody(details.requestBody); // 获取请求体所有参数
//     const requestBodyObj = filterRequestParams({
//       params: requestBodyAll,
//       filter: [
//         ...storage.setting.removeRequestBodyParams,
//         ...(storage[storageKey]?.removeRequestBodyParams ?? []),
//       ],
//     });
//     const requestBody = JSON.stringify(requestBodyObj); // 过滤后请求体参数


//     const response = (storage[storageKey]?.data ?? [])?.find((n) => {
//       if (!n.active) {
//         return false;
//       }
     
//       const commonCheckResult = commonCheckMatch({
//         setting: storage.setting,
//         n,
//         requestParams,
//         requestBody,
//         storageItem: storage[storageKey],
//       });
//       if (!commonCheckResult) {
//         return false;
//       }

//       return true;
//     })?.response;
//     console.log(response);


//     if (!!response) {
//       if (storage[storageKey].compare) {
//         try {
//           console.log('MOCK-----已加入对比');
//           chrome?.runtime?.sendMessage({
//             compareMockData: JSON.stringify(JSON.parse(response), null, 2),
//           });
//           return {
//             redirectUrl: null,
//           };
//         } catch (error) {}
//       }

//       console.log('MOCK-----已拦截该请求');

//       chrome?.runtime?.sendMessage({
//         info: '已MOCK该请求',
//       });

//       return {
//         redirectUrl: `data:application/json;charset=UTF-8,${response}`,
//       };
//     }
//   },
//   { urls: [storage.setting?.openUrl ?? '<all_urls>'], types: ['xmlhttprequest'] },
//   ['blocking', 'requestBody'],
// );

