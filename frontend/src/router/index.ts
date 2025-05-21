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
    beforeEnter: Guard.guest,
    component: () => import('@/views/LoginView.vue')
  },
  {
    path: '/logout',
    name: 'logout',
    beforeEnter: Guard.user,
    component: () => import('@/views/LogoutView.vue')
  },
  {
    path: '/signup',
    name: 'signup',
    beforeEnter: Guard.guest,
    component: () => import('@/views/SignupView.vue')
  },
  {
    path: '/forgot-password',
    name: 'forgot-password',
    beforeEnter: Guard.guest,
    component: () => import('@/views/ForgotPasswordView.vue')
  },
  {
    path: '/reset-password',
    name: 'resetPassword',
    beforeEnter: Guard.guest,
    component: () => import('@/views/ResetPasswordView.vue')
  },
  {
    path: '/email-confirmation',
    name: 'emailConfirmation',
    beforeEnter: Guard.guest,
    component: () => import('@/views/EmailConfirmationView.vue')
  },
  {
    path: '/contact-us',
    name: 'contact',
    component: () => import('@/views/ContactView.vue')
  },
  {
    path: '/order',
    name: 'order',
    beforeEnter: Guard.hasNoEvent,
    component: () => import('@/views/OrderView.vue')
  },
  {
    path: '/terms-and-conditions',
    name: 'termsAndConditions',
    component: () => import('@/views/TermsAndConditionsView.vue')
  },
  {
    path: '/event',
    name: 'event',
    beforeEnter: Guard.hasEvent,
    component: () => import('@/views/EventIndexView.vue'),
    children: [
      {
        path: '',
        name: 'eventDetails',
        component: () => import('../views/EventDetailsView.vue'),
      },
      {
        path: 'gallery',
        name: 'eventGallery',
        component: () => import('../views/EventGalleryView.vue'),
      },
      {
        path: 'gallery/full-screen',
        name: 'eventGalleryFullScreen',
        component: () => import('../views/EventGalleryFullScreenView.vue'),
      },
      {
        path: 'assets',
        name: 'eventAssets',
        component: () => import('../views/EventAssetsView.vue'),
      },
      {
        path: 'qr',
        name: 'eventQRCard',
        component: () => import('../views/EventQRCardView.vue'),
      },
    ]
  },
  {
    path: '/event/uploads/:event_path',
    name: 'gallery',
    component: () => import('@/views/EventUploadsView.vue')
  },
  {
    path: '/profile',
    name: 'profile',
    beforeEnter: Guard.user,
    component: () => import('@/views/ProfileView.vue')
  },
  {
    path: '/design',
    name: 'design',
    beforeEnter: Guard.guest,
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
