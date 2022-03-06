import ChromeDev from "./ChromeDev";
const { MODE } = import.meta.env;
import { StorageAll } from '~/interfaces/common.interface';

if (MODE === 'development') {
  ChromeDev();
}


export const storage = {
  get: (params: any = null): Promise<StorageAll> => new Promise((resolve) => {
    chrome.storage.local.get(params, (res) => {
      resolve(res ?? {});
    })
  }),
  set: (params = {}) => new Promise((resolve) => {
    chrome.storage.local.set(params, () => {
      resolve(null);
    });
  }),
  remove: (key: string) => new Promise((resolve) => {
    chrome.storage.local.remove(key, () => {
      resolve(null);
    });
  }),
  clear: () => new Promise((resolve) => {
    chrome.storage.local.get('setting', (res) => {
      chrome.storage.local.clear(() => {
        chrome.storage.local.set({ setting: res.setting }, () => {
          resolve(null);
        });
      });
    })
    
  }),
  onchange: (cb: Function) => {
    chrome.storage.onChanged.addListener(() => {
      cb();
    })
  },

  // upload: () => new Promise(async(resolve) => {
  //   chrome.storage.local.get((res) => {
  //     chrome.storage.sync.set(res, () => {
  //       resolve();
  //     })
  //   })
  // }),
  // download: () => new Promise((resolve) => {
  //   chrome.storage.local.get((localData) => {
  //     chrome.storage.sync.get((syncData) => {
  //       chrome.storage.local.set({ ...localData, ...syncData }, () => {
  //         resolve();
  //       })
  //     })
  //   })
  // }),
}