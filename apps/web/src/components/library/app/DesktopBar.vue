<template>
    <header class="snap-nav">
        <div class="snap-nav-inner">
            <a :href="homeHref" class="snap-logo" aria-label="SnapShare">
                <span class="snap-mark" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="7.2" stroke="#C9A36A" stroke-width="1.8"/>
                        <circle cx="12" cy="12" r="2.6" fill="#DC5B66"/>
                    </svg>
                </span>
                SnapShare
            </a>
            <nav class="snap-links" aria-label="ראשי">
                <a :href="marketing('/#events')">לכל אירוע</a>
                <a :href="marketing('/#how')">איך זה עובד</a>
                <a :href="marketing('/#album')">האלבום החי</a>
                <a :href="marketing('/pricing')">מחירים</a>
                <a :href="marketing('/faq')">שאלות</a>
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
import { marketingHref } from '@/helpers/marketingUrl';
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
        },

        homeHref(): string {
            return marketingHref('/');
        },
    },

    methods: {
        createLinks() {
            return undefined;
        },

        marketing(path: string) {
            return marketingHref(path);
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
    gap: 8px;
    text-decoration: none;
    font-weight: 800;
    font-size: 1.05rem;
    letter-spacing: -0.01em;
    border-radius: 999px;
    padding: 14px 28px;
    white-space: nowrap;
    transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}
.snap-btn.ghost {
    border: 1.5px solid var(--line, rgba(22, 19, 16, 0.11));
    background: transparent;
    color: var(--ink, #161310);
}
.snap-btn.ghost:hover {
    border-color: var(--ink, #161310);
}
.snap-btn.primary {
    border: 0;
    color: #fff;
    background: linear-gradient(
        135deg,
        var(--accent-2, #dc5b66),
        var(--accent, #c9a36a)
    );
    box-shadow: 0 10px 28px var(--glow, rgba(201, 163, 106, 0.45));
}
.snap-btn.primary:hover {
    transform: translateY(-2px);
}
</style>