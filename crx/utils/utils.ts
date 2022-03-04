import { StorageSetting } from '../interfaces/common.interface';

interface Qs {
  parse: (string) => any;
  stringify: (any) => string;
};

export const qs: Qs = {
  parse: (str) => {
    if (!str) {
      return {};
    }
    try {
      return JSON.parse(str);
    } catch (error) {
      
    }
    return str.split('&').reduce((prev, cur) => {
      let tmp = cur.split('=');
      prev[tmp[0]] = tmp[1];
      return prev;
    }, {})
  },
  stringify: (obj) => {
    let res: string[] = [];
    for (let n in obj) {
      res.push(`${n}=${obj[n]}`);
    }
    return res.join('&');
  },
}

export const getRequestUrlPrams = (setting: StorageSetting, url: string): string => {
  if (url.indexOf('?') > -1) {
    let params = qs.parse(url.substring(url.indexOf('?') + 1));
    for (let n of setting.removeRequestUrlParams) {
      delete params[n];
    }
    return JSON.stringify(params);
  } else {
    return '{}';
  }
}
