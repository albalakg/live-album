<template>
  <div class="language-switcher">
    <select 
      :value="currentLocale" 
      @change="changeLanguage"
      class="language-select"
      :class="{ 'rtl': currentLocale === 'he' }"
    >
      <option value="he">עברית</option>
      <option value="en">English</option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { setLanguage } from '../i18n';
import type { Locale } from '../i18n';

const i18n = useI18n();
const currentLocale = computed(() => i18n.locale.value);

const changeLanguage = (event: Event) => {
  const select = event.target as HTMLSelectElement;
  const newLocale = select.value as Locale;
  if (newLocale === 'en' || newLocale === 'he') {
    setLanguage(newLocale);
    // Force re-render of components
    window.dispatchEvent(new Event('languageChanged'));
  }
};
</script>

<style scoped>
.language-switcher {
  padding: 8px;
}

.language-select {
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
  background-color: white;
  cursor: pointer;
}

.language-select:hover {
  border-color: #666;
}

.language-select.rtl {
  direction: rtl;
}
</style>
