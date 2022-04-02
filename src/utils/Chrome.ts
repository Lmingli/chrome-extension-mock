import ChromeDev from "./ChromeDev";
const { MODE } = import.meta.env;
import { StorageAll } from '~/interfaces/common.interface';

if (MODE === 'development') {
  ChromeDev();
}


export const storage = {
  get: async(params: any = null): Promise<any> => {
    return await chrome.storage.local.get(params);
  },
  set: async(params = {}): Promise<void> => {
    await chrome.storage.local.set(params);
    return;
  },
  remove: async(key: string): Promise<void> => {
    await chrome.storage.local.remove(key);
    return;
  },
  clear: async(): Promise<void> => {
    const setting = await chrome.storage.local.get('setting');
    await chrome.storage.local.clear();
    await chrome.storage.local.set({
      setting,
    })
    return;
  },
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