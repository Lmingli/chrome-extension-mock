import saveData from './utils/SaveData';
import { StorageAll, StorageItem, StorageItemData } from '../interfaces/common.interface';
import { filterRequestParams } from './utils/utils';

// 生成devtool面板
chrome.devtools.panels.create('mock', '', 'index.html#/panel', (panel) => {});


console.log('devtool.js init');

// 保存请求数据
chrome.devtools.network.onRequestFinished.addListener(async (data) => {
  if (!!data) {
    if ((data?._resourceType === 'xhr' || data?._resourceType === 'fetch') && data?.request?.httpVersion !== 'data' && data?.response?.status !== 307) {
      let locationUrl = '';
      try {
        const tabs = await chrome.tabs.query({ currentWindow: true, active: true });
        if (tabs[0] != undefined) {
          locationUrl = (tabs[0].url ?? '').split('?')[0];
        }
      } catch (error) {
        console.log('获取locationUrl失败');
      }

      data.getContent((body) => {
        saveData({
          request: data.request,
          response: body,
          locationUrl,
        });
      });

    }
  }
});


/* 根据storage变化更新网络拦截规则 */
chrome.storage.onChanged.addListener(async() => {
  console.log('background-----storage-onchanged');
  const storage: StorageAll = await chrome.storage.local.get();

  // 修改popup图标状态
  chrome.action.setBadgeText({ text: '' });
  if (storage.setting?.openSave) {
    chrome.action.setBadgeText({ text: 'save' });
    chrome.action.setBadgeBackgroundColor({ color: '#409EFF' });
  }
  if (storage.setting?.openMock) {
    chrome.action.setBadgeText({ text: 'mock' });
    chrome.action.setBadgeBackgroundColor({ color: '#F56C6C' });
  }


  const oldRules = await chrome.declarativeNetRequest.getDynamicRules() ?? [];
  const removeRuleIds = oldRules.map(n => n.id);

  
  if (!storage.setting?.openMock) {
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds,
    })
    return;
  }
  

  /* 新增规则 */
  let addRules = [];

  let id = 1;
  const addRuleFn = (storageKey, storageItemData: StorageItemData) :void => {
    const requestParamsAll = JSON.parse(storageItemData.requestParams || '{}');
    const requestParams = filterRequestParams({
      params: requestParamsAll,
      filter: [
        ...storage.setting.removeRequestUrlParams,
        ...(storage[storageKey]?.removeRequestUrlParams ?? []),
      ], 
    }); 
    const urlParamsRegex = Object.entries(requestParams).reduce((prev, cur) => prev + cur[0] + '=' + cur[1] + '.*', '');

    const redirectUrl = `data:application/json;charset=UTF-8,${storageItemData.response}`;

    addRules.push({
      id: (id ++),
      priority: 1,
      action: {
        type: "redirect",
        redirect: {
          url: redirectUrl,
        },
      },
      condition: {
        regexFilter: `${storageKey}.*${urlParamsRegex}`,
        requestMethods: [storageItemData.method.toLowerCase()],
        resourceTypes: ['xmlhttprequest'],
      },
    });
  }
  

  // storage中所有active添加规则
  for (let n in storage) {
    if (n !== 'setting') {
      const storageItem: StorageItem = storage[n];
      for (let x of storageItem.data) {
        if (x.active) {
          addRuleFn(n, x);
        }
      }
    }
  }


  console.log('background-----addRules', addRules);
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds,
    addRules,
  })

})



chrome.runtime.onMessage.addListener(async(msg, sender, sendResponse): Promise<any> => {
  console.log('onmessage');
  // 保存storage为本地文件
  if (!!msg.download) {
    const storage = await chrome.storage.local.get();

    console.log('download');
    chrome.downloads.download(
      {
        url: URL.createObjectURL(new Blob([JSON.stringify(storage)], {type: "application/json"})),
        filename: `mock.${Date.now()}.json`,
      },
      () => {
        chrome?.runtime?.sendMessage({
          downloadSuccess: true,
        });
      },
    );
  }
});


/* 命中的规则 */
chrome.declarativeNetRequest.onRuleMatchedDebug.addListener((info) => {
  console.log(info)
  chrome?.runtime?.sendMessage({
    info: '已MOCK该请求',
  });
})
