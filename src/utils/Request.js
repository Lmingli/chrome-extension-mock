import axios from 'axios';
import Qs from 'qs';
import Config from '@/Conf';

const request = axios.create({
  baseURL: Config.baseURL,
  crossDomain: true,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
  },
  validateStatus: (status) => {
    return (status >= 200 && status < 300) || status == 401;
  },
  timeout: 60000,
  paramsSerializer: (params) => {
    return Qs.stringify(params, {
      arrayFormat: 'brackets'
    })
  },
  transformRequest: [(data, headers) => {
    return Qs.stringify(data);
  }]
})

/**
 * 请求拦截
 */
request.interceptors.request.use(config => {
  if (config.method === 'get' && !config.params && !!config.data) {
    config.params = config.data;
  }
  // if (['put', 'post', 'patch'].includes(config.method) && config.data === undefined && !!config.params ) {
  //   config.data = config.params;
  // }
  return config
}, error => {
  return Promise.reject(error)
})

/**
 * 响应拦截
 */
request.interceptors.response.use(response => {
  try {
    const api = response.config.url.replace(response.config.baseURL, '');
    const reqParams = response.config.params || (response.config.data ? /x-www-form-urlencoded/.test(response.config.headers['Content-Type']) ? Qs.parse(response.config.data) : JSON.parse(response.config.data) : null);
    if (!/getImage/.test(api)) {
      console.log(`>>>>>---${response.config.method}-----${api}-----\n`, reqParams, '\n', response.data, '\n<<<<<---------------');
    }
  } catch (error) {
    console.log('-----response console error-----', error, response);
  }

  if (response.data[Config.responseStatusKey] == Config.responseSuccessStatus) {
    return response.data;
  } else if (Object.keys(Config.responseCode).includes(String(response.data[Config.responseStatusKey]))) {
    return Config.responseCode[response.data[Config.responseStatusKey]]({
      data: response.data,
    }) || Promise.reject();
  } else {
    Config.errorMessageFn(response.data[Config.responseMessageKey] || Config.defaultErrorMessage ||'网络错误');
    return Promise.reject(response.data)
  }
}, error => {
  console.error('response interceptors error===', error);
  Config.errorMessageFn(Config.defaultErrorMessage || '网络错误');
  return Promise.reject(error);
})

export default request;