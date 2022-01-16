import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/Home.vue'),
  },
  {
    path: '/popup',
    name: 'popup',
    component: () => import('@/views/Popup.vue'),
  },
  {
    path: '/options',
    name: 'options',
    component: () => import('@/views/Panel.vue'),
  },
  {
    path: '/panel',
    name: 'panel',
    component: () => import('@/views/Panel.vue'),
  },
  
  {
    path: '/:pathMatch(.*)*',
    component: () => import('@/components/404.vue'),
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router;
