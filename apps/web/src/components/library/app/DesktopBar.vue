<template>
    <header class="snap-nav">
        <div class="snap-nav-inner">
            <router-link to="/" class="snap-logo" aria-label="SnapShare">
                <span class="snap-mark" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="7.2" stroke="#C9A36A" stroke-width="1.8"/>
                        <circle cx="12" cy="12" r="2.6" fill="#DC5B66"/>
                    </svg>
                </span>
                SnapShare
            </router-link>
            <nav class="snap-links" aria-label="ראשי">
                <router-link to="/#events">לכל אירוע</router-link>
                <router-link to="/#how">איך זה עובד</router-link>
                <router-link to="/#album">האלבום החי</router-link>
                <router-link to="/pricing">מחירים</router-link>
                <router-link to="/faq">שאלות</router-link>
            </nav>
            <div class="snap-cta">
                <router-link v-if="user" class="snap-btn ghost" to="/event">האירוע</router-link>
                <router-link v-else class="snap-btn ghost" to="/login">התחברות</router-link>
                <router-link class="snap-btn primary" to="/order">נסו בחינם</router-link>
            </div>
        </div>
    </header>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IUserInfo } from '@/helpers/interfaces'

export default defineComponent({
    name: 'DesktopBar',

    data() {
        return {}
    },

    created() {
        this.createLinks();
    },
    
    watch: {
        user() {
            this.createLinks();
        },
        hasActiveEvent() {
            this.createLinks();
        }
    },

    computed: {
        user(): IUserInfo | null {
            return this.$store.getters['user/getUser'];
        },
        
        hasActiveEvent(): boolean {
            return this.$store.getters['event/hasActiveEvent'];
        }
    },

    methods: {
        createLinks() {
            return undefined;
        },
    },
});

</script>

<style lang="scss" scoped>
.snap-nav {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    height: 72px;
    display: flex;
    align-items: center;
    background: rgba(243, 238, 230, 0.92);
    backdrop-filter: blur(18px);
    border-bottom: 1px solid rgba(22, 19, 16, 0.08);
}
.snap-nav-inner {
    width: min(1160px, calc(100% - 40px));
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: nowrap;
}
.snap-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    font-family: Outfit, Heebo, sans-serif;
    font-weight: 800;
    font-size: 1.35rem;
    letter-spacing: -0.04em;
    color: #161310;
    text-decoration: none;
    flex: none;
}
.snap-mark {
    width: 34px;
    height: 34px;
    border-radius: 10px;
    background: #12100e;
    display: grid;
    place-items: center;
}
.snap-mark svg { width: 20px; height: 20px; }
.snap-links {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-wrap: nowrap;
}
.snap-links a {
    text-decoration: none;
    font-weight: 600;
    font-size: 0.95rem;
    padding: 8px 12px;
    border-radius: 999px;
    color: #5e564e;
    white-space: nowrap;
}
.snap-links a:hover { color: #161310; background: rgba(22, 19, 16, 0.05); }
.snap-cta { display: flex; align-items: center; gap: 10px; flex: none; }
.snap-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;
    font-weight: 800;
    font-size: 0.95rem;
    border-radius: 999px;
    padding: 10px 18px;
    white-space: nowrap;
}
.snap-btn.ghost {
    border: 1.5px solid rgba(22, 19, 16, 0.14);
    color: #161310;
}
.snap-btn.primary {
    color: #fff;
    background: linear-gradient(135deg, #dc5b66, #c9a36a);
    box-shadow: 0 10px 28px rgba(220, 91, 102, 0.28);
}
</style>