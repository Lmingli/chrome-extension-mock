import { ElMessage } from 'element-plus';
import Router from '@/router';

const { VITE_BASE_URL, MODE } = import.meta.env;

export default {
  baseURL: 'https://api.luanmingli.com',

  defaultErrorMessage: '网络错误，请稍后重试',
  errorMessageFn: ElMessage.error,

  responseStatusKey: 'status',  // 服务端返回的代表状态的字段名
  responseSuccessStatus: 0,  // 代表成功状态的status

  responseMessageKey: 'message',  // 服务端返回的代表信息的字段名
  
  responseCode: {   // 服务器返回数据，特殊status
    '401'() {
      if ( MODE === 'production' ) {
        const returnUrl = encodeURIComponent(window.location.href);
        window.location.replace(`/manage/#/login?return=${returnUrl}`);
      }
      if ( MODE === 'development' ) {
        Router.replace({
          path: '/login',
          query: {
            return: Router.currentRoute.value.path,
            query: encodeURIComponent(JSON.stringify(Router.currentRoute.value.query)),
          },
        });
      }
    },
  },

}