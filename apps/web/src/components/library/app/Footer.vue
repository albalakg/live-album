<template>
  <footer class="app-footer">
    <div class="wrap">
      <div class="foot-grid">
        <div>
          <a class="logo" :href="marketing('/')">
            <span class="logo-mark" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <circle
                  cx="12"
                  cy="12"
                  r="7.2"
                  stroke="#C9A36A"
                  stroke-width="1.8"
                ></circle>
                <circle cx="12" cy="12" r="2.6" fill="#DC5B66"></circle>
              </svg>
            </span>
            SnapShare
          </a>
          <p>מזכרות, חיבור ואווירה באירועים ומסיבות. שירות בעברית.</p>
        </div>
        <div>
          <h4>המוצר</h4>
          <ul>
            <li><a :href="marketing('/#how')">איך זה עובד</a></li>
            <li><a :href="marketing('/#events')">לכל סוג אירוע</a></li>
            <li><a :href="marketing('/pricing')">מחירים</a></li>
            <li><a :href="marketing('/faq')">שאלות נפוצות</a></li>
            <li><router-link to="/qr-cards">גלריית כרטיסי QR</router-link></li>
            <li><a :href="marketing('/blog')">בלוג</a></li>
          </ul>
        </div>
        <div>
          <h4>מדריכים</h4>
          <ul>
            <li
              v-for="guide in guides"
              :key="guide.href"
            >
              <a :href="marketing(guide.href)">{{ guide.label }}</a>
            </li>
          </ul>
        </div>
        <div>
          <h4>קישורים</h4>
          <ul>
            <li><router-link to="/order">ניסיון חינם</router-link></li>
            <li v-if="!isLoggedIn">
              <router-link to="/login">התחברות</router-link>
            </li>
            <li v-if="!isLoggedIn">
              <router-link to="/signup">הרשמה</router-link>
            </li>
            <li v-if="isLoggedIn">
              <router-link to="/profile">פרופיל</router-link>
            </li>
            <li v-if="hasActiveEvent">
              <router-link to="/event">האירוע</router-link>
            </li>
            <li><router-link to="/contact-us">צור קשר</router-link></li>
            <li>
              <router-link to="/terms-and-conditions">תנאי האתר</router-link>
            </li>
          </ul>
        </div>
      </div>
      <div class="foot-bottom">
        <span dir="ltr">© SnapShare</span>
        <span>תשלום אחד לאירוע, בלי מנוי.</span>
      </div>
    </div>
  </footer>
</template>

<script lang="ts">
import { marketingHref } from "@/helpers/marketingUrl";
import { defineComponent } from "vue";

export default defineComponent({
  name: "FooterComponent",

  data() {
    return {
      guides: [
        { href: "/digital-wedding-album", label: "אלבום דיגיטלי לחתונה" },
        {
          href: "/bar-bat-mitzvah-digital-album",
          label: "אלבום בר ובת מצווה",
        },
        {
          href: "/henna-engagement-birthday-album",
          label: "אלבום לחינה, אירוסין ויום הולדת",
        },
        {
          href: "/corporate-event-photo-sharing",
          label: "שיתוף תמונות באירוע עסקי",
        },
        { href: "/live-photo-wall", label: "קיר תמונות חי" },
        { href: "/qr-photo-sharing", label: "שיתוף תמונות עם QR" },
        { href: "/how-it-works", label: "איך זה עובד" },
      ],
    };
  },

  computed: {
    isLoggedIn(): boolean {
      return this.$store.getters["user/isLoggedIn"];
    },

    hasActiveEvent(): boolean {
      return this.$store.getters["event/hasActiveEvent"];
    },
  },

  methods: {
    marketing(path: string) {
      return marketingHref(path);
    },
  },
});
</script>

<style lang="scss" scoped>
.app-footer {
  background: var(--deep, #12100e);
  color: rgba(247, 242, 235, 0.7);
  padding: 48px 0 28px;
  font-size: 0.95rem;
  position: relative;
  /* Above .event-main (z-index 11) so the fixed host sidebar doesn't clip the footer */
  z-index: 12;
}

.wrap {
  width: min(var(--max, 1160px), calc(100% - 40px));
  margin-inline: auto;
}

.foot-grid {
  display: grid;
  grid-template-columns: 1.4fr 1fr 1fr 1fr;
  gap: 32px;
  padding-bottom: 32px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  font-family: var(--brand, Outfit, Heebo, sans-serif);
  font-weight: 800;
  font-size: 1.35rem;
  letter-spacing: -0.04em;
  color: #fff;
}

.logo-mark {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: var(--deep, #12100e);
  display: grid;
  place-items: center;
  position: relative;
  flex: none;
  box-shadow: inset 0 0 0 1px rgba(201, 163, 106, 0.35);
}

.logo-mark svg {
  width: 20px;
  height: 20px;
}

.app-footer p {
  margin-top: 12px;
  max-width: 32ch;
  line-height: 1.6;
}

.app-footer h4 {
  color: #fff;
  font-weight: 800;
  margin: 0 0 12px;
  font-size: 1rem;
}

.app-footer ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.app-footer li {
  margin: 8px 0;
}

.app-footer a {
  text-decoration: none;
  color: rgba(247, 242, 235, 0.7);
}

.app-footer a:hover {
  color: #fff;
}

.foot-bottom {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  padding-top: 20px;
  font-size: 0.85rem;
  color: rgba(247, 242, 235, 0.45);
}

@media (max-width: 980px) {
  .foot-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .app-footer {
    padding-bottom: 96px;
  }

  .wrap {
    width: min(var(--max, 1160px), calc(100% - 32px));
  }
}
</style>
