import { StorageSetting } from '../../interfaces/common.interface';
import { Request } from '../../interfaces/network.interface';

interface Qs {
  parse: (string) => any;
  stringify: (any) => string;
}

export const qs: Qs = {
  parse: (str) => {
    if (!str) {
      return {};
    }
    try {
      return JSON.parse(str);
    } catch (error) {}
    return str.split('&').reduce((prev, cur) => {
      let tmp = cur.split('=');
      prev[tmp[0]] = tmp[1];
      return prev;
    }, {});
  },
  stringify: (obj) => {
    let res: string[] = [];
    for (let n in obj) {
      res.push(`${n}=${obj[n]}`);
    }
    return res.join('&');
  },
};

/** 获取链接中参数 */
export const getRequestUrlPrams = (url: string): object => {
  if (url.indexOf('?') > -1) {
    return qs.parse(url.substring(url.indexOf('?') + 1));
  } else {
    return {};
  }
};

/** 获取SAVE时请求体 */
export const getSaveRequestBody = (request: Request): object => {
  let requestBody = {};
  if (/x-www-form-urlencoded/.test(request?.postData?.mimeType)) {
    requestBody = (request.postData.params ?? []).reduce((total, cur) => {
      total[decodeURIComponent(cur.name)] = decodeURIComponent(cur.value);
      return total;
    }, {});
  }
  if (/application\/json/.test(request?.postData?.mimeType)) {
    try {
      requestBody = JSON.parse(request.postData.text);
    } catch (error) {
      console.log('error---request.postData.text parse失败');
    }
  }
  return requestBody;
};

export const filterRequestParams = ({ filter, params }: { filter: string[]; params: object; }): object => {
  if (!filter || filter.length === 0) {
    return params;
  }
  let obj = { ...params };
  for (const n of filter) {
    delete obj[n];
  }
  return obj;
};

/** 获取MOCK时请求体 */
export const getMockRequestBody = (body: chrome.webRequest.WebRequestBody): object => {
  let requestBody = {};
  if (!!body?.formData) {
    for (const n in body.formData) {
      requestBody[n] = body.formData[n][0];
    }
  }
  if (!!body?.raw) {
    try {
      const bodyString = String.fromCharCode.apply(null, new Uint8Array(body.raw[0].bytes));
      requestBody = JSON.parse(bodyString);
    } catch (error) {
      console.log('error---requestBody.raw转string', error);
    }
  }
  return requestBody;
};

export const commonCheckMatch = ({ setting, n, requestParams, requestBody, storageItem }: any): boolean => {
  if (storageItem.checkParams ?? setting.checkParams) {
    if (n.requestParams !== requestParams) {
      return false;
    }
  }

  if (storageItem.checkBody ?? setting.checkBody ) {
    if (n.requestBody !== requestBody) {
      return false;
    }
  }

  return true;
}
