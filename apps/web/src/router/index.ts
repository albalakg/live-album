import { installReveal } from "@snapshare/design/reveal";
import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import Guard from "@/helpers/guard";
import { isSeatingEnabled, isWhatsAppEnabled, isWhatsAppMessagingEnabled } from "@/helpers/features";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "home",
    component: () => import("@/views/MarketingRedirect.vue"),
  },
  {
    path: "/login",
    name: "login",
    beforeEnter: Guard.guest,
    component: () => import("@/views/LoginView.vue"),
  },
  {
    path: "/logout",
    name: "logout",
    beforeEnter: Guard.user,
    component: () => import("@/views/LogoutView.vue"),
  },
  {
    path: "/signup",
    name: "signup",
    beforeEnter: Guard.guest,
    component: () => import("@/views/SignupView.vue"),
  },
  {
    path: "/forgot-password",
    name: "forgot-password",
    beforeEnter: Guard.guest,
    component: () => import("@/views/ForgotPasswordView.vue"),
  },
  {
    path: "/reset-password",
    name: "resetPassword",
    beforeEnter: Guard.guest,
    component: () => import("@/views/ResetPasswordView.vue"),
  },
  {
    path: "/email-confirmation",
    name: "emailConfirmation",
    beforeEnter: Guard.guest,
    component: () => import("@/views/EmailConfirmationView.vue"),
  },
  {
    path: "/auth/google/callback",
    name: "googleAuthCallback",
    beforeEnter: Guard.guest,
    component: () => import("@/views/GoogleAuthCallbackView.vue"),
  },
  {
    path: "/contact-us",
    name: "contact",
    component: () => import("@/views/ContactView.vue"),
  },
  {
    path: "/qr-cards",
    name: "qrGallery",
    component: () => import("@/views/QrGalleryView.vue"),
  },
  {
    path: "/preview/host-screen",
    name: "previewHost",
    component: () => import("@/views/EventGalleryFullScreenView.vue"),
  },
  {
    path: "/preview/moderation",
    redirect: { path: "/event/assets", query: { filter: "pending" } },
  },
  {
    path: "/order",
    name: "order",
    component: () => import("@/views/OrderView.vue"),
  },
  {
    path: "/order/pay",
    name: "orderPay",
    beforeEnter: Guard.user,
    component: () => import("@/views/SubscriptionPaymentView.vue"),
  },
  {
    path: "/order/success",
    name: "OrderCallbackSuccess",
    beforeEnter: Guard.user,
    component: () => import("@/views/OrderCallbackSuccess.vue"),
  },
  {
    path: "/order/failure",
    name: "OrderCallbackFailure",
    beforeEnter: Guard.user,
    component: () => import("@/views/OrderCallbackFailure.vue"),
  },
  {
    path: "/terms-and-conditions",
    name: "termsAndConditions",
    component: () => import("@/views/TermsAndConditionsView.vue"),
  },
  {
    path: "/h-preview",
    name: "landingPreviewFrame",
    // Same-origin iframe for builder device preview (no guard, no app chrome)
    component: () => import("@/views/LandingPreviewFrameView.vue"),
  },
  {
    path: "/rsvp/:token",
    name: "publicRsvp",
    // Personal RSVP link from WhatsApp / SMS (public, no guard, no app chrome)
    component: () => import("@/views/PublicRsvpView.vue"),
  },
  {
    path: "/t/:token",
    name: "publicTable",
    // Personal "your table" link from WhatsApp / SMS ({{table_link}}): public, no guard, no app chrome
    component: () => import("@/views/PublicTableView.vue"),
  },
  {
    path: "/addons/mock-checkout",
    name: "addonMockCheckout",
    // Local stand-in for the PayPlus hosted page (mock add-on gateway only)
    beforeEnter: Guard.user,
    component: () => import("@/views/AddonMockCheckoutView.vue"),
  },
  {
    path: "/addons/return",
    name: "addonReturn",
    // PayPlus refURL_success/failure/cancel for add-on purchases: waits for the server callback to credit the event
    beforeEnter: Guard.user,
    component: () => import("@/views/AddonReturnView.vue"),
  },
  {
    path: "/h/:slug",
    name: "eventHubPublic",
    // Public for logged-out AND logged-in visitors (no Guard.guest)
    component: () => import("@/views/EventHubPublicView.vue"),
  },
  {
    path: "/event/trivia/:event_path",
    name: "eventTriviaPlay",
    component: () => import("@/views/EventTriviaPlayView.vue"),
  },
  {
    path: "/event/uploads/:event_path",
    name: "gallery",
    component: () => import("@/views/EventUploadsView.vue"),
  },
  {
    path: "/event/open-album/:event_path",
    name: "guestAlbum",
    component: () => import("@/views/EventGuestAlbumView.vue"),
  },
  {
    path: "/event/open-gallery/:event_path",
    name: "guestGallery",
    component: () => import("@/views/EventGuestGalleryView.vue"),
  },
  {
    path: "/event",
    name: "event",
    beforeEnter: Guard.user,
    component: () => import("@/views/EventIndexView.vue"),
    children: [
      {
        path: "",
        name: "eventHome",
        component: () => import("../views/EventHomeView.vue"),
      },
      {
        path: "home",
        redirect: { name: "eventHome" },
      },
      {
        path: "details",
        name: "eventDetails",
        component: () => import("../views/EventDetailsView.vue"),
      },
      {
        path: "gallery",
        name: "eventGallery",
        component: () => import("../views/EventGalleryView.vue"),
      },
      {
        path: "gallery/full-screen",
        name: "eventGalleryFullScreen",
        component: () => import("../views/EventGalleryFullScreenView.vue"),
      },
      {
        path: "upload",
        name: "eventUploadPage",
        component: () => import("../views/EventUploadPageView.vue"),
      },
      {
        path: "page",
        name: "eventLandingPage",
        component: () => import("../views/EventPageBuilderView.vue"),
      },
      {
        path: "save-the-date",
        name: "eventSaveTheDate",
        component: () => import("../views/EventSaveTheDateView.vue"),
      },
      {
        path: "album",
        name: "eventAlbum",
        component: () => import("../views/EventAlbumView.vue"),
      },
      {
        path: "assets",
        name: "eventAssets",
        component: () => import("../views/EventAssetsView.vue"),
      },
      {
        path: "moderation",
        name: "eventModeration",
        redirect: { path: "/event/assets", query: { filter: "pending" } },
      },
      {
        path: "qr",
        name: "eventQRCard",
        component: () => import("../views/EventQRCardView.vue"),
      },
      {
        path: "plan",
        name: "eventPlan",
        component: () => import("../views/EventPlanView.vue"),
      },
      {
        path: "trivia",
        name: "eventTrivia",
        component: () => import("../views/EventTriviaView.vue"),
      },
      {
        path: "guests",
        name: "eventGuests",
        component: () => import("../views/EventGuestsView.vue"),
      },
      ...(isSeatingEnabled()
        ? [
            {
              path: "seating",
              name: "eventSeating",
              component: () => import("../views/EventSeatingView.vue"),
            },
          ]
        : []),
      ...(isWhatsAppMessagingEnabled()
        ? [
            {
              path: "messages/:tab?",
              name: "eventMessaging",
              component: () => import("../views/EventMessagingView.vue"),
            },
          ]
        : []),
      ...(isWhatsAppEnabled()
        ? [
            {
              path: "whatsapp",
              name: "eventWhatsApp",
              component: () => import("../views/EventWhatsAppView.vue"),
            },
          ]
        : []),
    ],
  },
  {
    path: "/profile",
    name: "profile",
    beforeEnter: Guard.user,
    component: () => import("@/views/ProfileView.vue"),
  },
  {
    path: "/admin/discount-codes",
    name: "adminDiscountCodes",
    beforeEnter: Guard.admin,
    component: () => import("@/views/AdminDiscountCodesView.vue"),
  },
  {
    path: "/design",
    name: "design",
    beforeEnter: Guard.guest,
    component: () => import("@/views/DesignView.vue"),
  },
  {
    path: "/design/landing",
    name: "designLandingIndex",
    beforeEnter: Guard.guest,
    component: () => import("@/views/DesignLandingIndexView.vue"),
  },
  {
    path: "/design/landing/:id",
    name: "designLanding",
    beforeEnter: (to, from, next) => {
      const id = String(to.params.id || "");
      const known = [
        "wedding-1",
        "wedding-2",
        "barmitzvah-1",
        "barmitzvah-2",
        "birthday-1",
        "birthday-2",
        "brit-1",
        "brit-2",
        "corporate-1",
        "corporate-2",
        "party-1",
        "party-2",
        "festival-1",
        "festival-2",
      ];
      if (!known.includes(id)) {
        next({ name: "designLandingIndex", replace: true });
        return;
      }
      Guard.guest(to, from, next);
    },
    component: () => import("@/views/DesignLandingView.vue"),
  },
  {
    path: "/:path(.*)*",
    name: "notFound",
    component: () => import("@/views/NotFoundView.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }

    if (to.hash) {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          const element = document.querySelector(to.hash);
          if (element) {
            const offset = 99;
            const topPosition =
              to.hash === "#header"
                ? 0
                : element.getBoundingClientRect().top + window.scrollY - offset;

            window.scrollTo({
              top: topPosition,
              behavior: "smooth",
            });
          }
          resolve();
        }, 300);
      });
    }

    return { top: 0 };
  },
});

router.afterEach(() => {
  installReveal();
});

export default router;
