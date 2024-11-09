import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Guard from '@/helpers/guard'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue')
  },
  {
    path: '/login',
    name: 'login',
    beforeEnter: Guard.local,
    component: () => import('@/views/LoginView.vue')
  },
  {
    path: '/signup',
    name: 'signup',
    beforeEnter: Guard.local,
    component: () => import('@/views/SignupView.vue')
  },
  {
    path: '/forgot-password',
    name: 'forgot-password',
    beforeEnter: Guard.local,
    component: () => import('@/views/ForgotPasswordView.vue')
  },
  {
    path: '/reset-password',
    name: 'reset-password',
    beforeEnter: Guard.local,
    component: () => import('@/views/ResetPasswordView.vue')
  },
  {
    path: '/email-confirmation',
    name: 'email-confirmation',
    beforeEnter: Guard.local,
    component: () => import('@/views/EmailConfirmationView.vue')
  },
  {
    path: '/contact-us',
    name: 'contact',
    beforeEnter: Guard.local,
    component: () => import('@/views/ContactView.vue')
  },
  {
    path: '/order',
    name: 'order',
    beforeEnter: Guard.local,
    component: () => import('@/views/OrderView.vue')
  },
  {
    path: '/design',
    name: 'design',
    beforeEnter: Guard.local,
    component: () => import('@/views/DesignView.vue')
  },
  {
    path: '/:path(.*)*',
    name: 'notFound',
    component: () => import('@/views/HomeView.vue')
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }

    if (to.hash) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const element = document.querySelector(to.hash);
          if (element) {

            const offset = 99;
            const topPosition = to.hash === '#header' ? 0 : element.getBoundingClientRect().top + window.scrollY - offset;

            window.scrollTo({
              top: topPosition,
              behavior: 'smooth',
            });
          }
          resolve();
        }, 300); 
      });
    }

    return { top: 0 };
  },
});

export default router;
