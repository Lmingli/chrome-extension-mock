import { createApp } from 'vue'
import App from './App.vue'

import router from '@/router/index'

import '@/styles/index.scss'
import 'element-plus/es/components/message/style/index'
import 'element-plus/es/components/message-box/style/index'

const app = createApp(App);
app.use(router);
app.mount('#app');

app.config.productionTip = false;
app.config.devtools = import.meta.env.MODE !== 'production';
