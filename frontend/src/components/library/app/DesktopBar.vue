<template>
    <div class="desktop-bar display--flex justify--center width--full" :class="{
        'bg--pink': hasActiveEvent,
        'bg--white': !hasActiveEvent
    }">
        <div class="desktop-content display--flex justify--space-between align--center width--page-size">
            <div class="display--flex justify--space-between">
                <template v-for="(link, index) in computedLinks" :key="index + currentLocale">
                    <DesktopBarLink :link="link" />
                </template>
            </div>
            <div class="display--flex align--center">
                <LanguageSwitcher />
                <router-link to="/#header" class="ms-inline-3">
                    <span class="title--large" :class="{
                        'text--white': hasActiveEvent
                    }">
                        SnapShare
                    </span>
                </router-link>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import DesktopBarLink from './DesktopBarLink.vue';
import LanguageSwitcher from '../../LanguageSwitcher.vue';
import type { IDesktopBarItem } from '../../../helpers/interfaces';

const store = useStore();
const { t, locale: currentLocale } = useI18n();

const user = computed(() => store.getters['user/getUser']);
const hasActiveEvent = computed(() => store.getters['event/hasActiveEvent']);

const forceUpdate = ref(0);

const handleLanguageChange = () => {
    forceUpdate.value++;
};

onMounted(() => {
    window.addEventListener('languageChanged', handleLanguageChange);
});

onUnmounted(() => {
    window.removeEventListener('languageChanged', handleLanguageChange);
});

const computedLinks = computed(() => {
    // Using forceUpdate in computed to ensure reactivity
    forceUpdate.value;
    
    if (hasActiveEvent.value) {
        return [
            {
                text: t('navigation.logout'),
                url: '/logout',
                color: 'white',
                weight: '800'
            },
            {
                text: t('navigation.event'),
                url: '/event',
                color: 'dark',
                weight: '500'
            },
            {
                text: t('navigation.profile'),
                url: '/profile',
                color: 'dark',
                weight: '500'
            },
            {
                text: t('navigation.contact'),
                url: '/contact-us',
                color: 'dark',
                weight: '500'
            },
        ];
    }

    const baseLinks = [
        {
            text: t('navigation.features'),
            url: '/#features',
            color: 'dark',
            weight: '500'
        },
        {
            text: t('navigation.howItWorks'),
            url: '/#how-it-works',
            color: 'dark',
            weight: '500'
        },
        {
            text: t('navigation.howItLooks'),
            url: '/#how-it-looks',
            color: 'dark',
            weight: '500'
        },
        {
            text: t('navigation.pricing'),
            url: '/#pricing',
            color: 'dark',
            weight: '500'
        },
        {
            text: t('navigation.contact'),
            url: '/contact-us',
            color: 'dark',
            weight: '500'
        },
    ];

    if (user.value) {
        return [
            {
                text: t('navigation.logout'),
                url: '/logout',
                color: 'pink',
                weight: '800'
            },
            ...baseLinks,
            {
                text: t('navigation.profile'),
                url: '/profile',
                color: 'dark',
                weight: '500'
            }
        ];
    }

    return [
        {
            text: t('navigation.login'),
            url: '/login',
            color: 'pink',
            weight: '800'
        },
        ...baseLinks
    ];
});
</script>

<style lang="scss" scoped>
.desktop-bar {
    padding: 20px 0;
    position: fixed;
    z-index: 100;
    direction: inherit;
}

.desktop-content {
    direction: inherit;
}

.ms-inline-3 {
    margin-inline-start: 1rem;
}
</style>
