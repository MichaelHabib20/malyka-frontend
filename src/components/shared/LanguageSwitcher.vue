<template>
  <div class="language-switcher">
    <button
      v-for="lang in languages"
      :key="lang.code"
      :class="['lang-btn', { active: currentLang === lang.code }]"
      @click="changeLanguage(lang.code)"
    >
      {{ lang.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { switchLanguage } from '../../i18n'

const { locale, t } = useI18n()

const languages = [
  { code: 'en', label: t('languages.en') },
  { code: 'ar', label: t('languages.ar') }
]

const currentLang = computed(() => locale.value)

function changeLanguage(lang: any) {
  if (lang !== locale.value) {
    switchLanguage(lang)
  }
}
</script>

<style scoped>
.language-switcher {
  display: flex;
  gap: 0.5rem;
}
.lang-btn {
  background: none;
  border: 1px solid #2563eb;
  color: #2563eb;
  padding: 0.25em 0.75em;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s, color 0.2s;
}
.lang-btn.active,
.lang-btn:hover {
  background: #2563eb;
  color: #fff;
}
</style> 