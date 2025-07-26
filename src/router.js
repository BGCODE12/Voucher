import { createRouter, createWebHashHistory } from 'vue-router';
import VoucherGenerator from './components/VoucherGenerator.vue';
import VoucherChecker from './components/VoucherChecker.vue';

const routes = [
  { path: '/', component: VoucherGenerator, name: 'generate' },
  { path: '/check', component: VoucherChecker, name: 'check' },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router; 