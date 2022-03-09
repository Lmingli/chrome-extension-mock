import { createApp } from 'vue';
import App from './App.vue';

import router from '@/router/index';

import '@/styles/index.scss';
import 'element-plus/es/components/message/style/index';
import 'element-plus/es/components/message-box/style/index';

import { CustomizeTable, CustomizeForm, CustomizeSwitch } from 'vue-element-customize';
import "vue-element-customize/dist/style.css";

const app = createApp(App);
app.use(router);
app.use(CustomizeTable);
app.use(CustomizeForm);
app.use(CustomizeSwitch);
console.log(CustomizeForm)
app.mount('#app');

// app.config.productionTip = false;
// app.config.devtools = import.meta.env.MODE !== 'production';
