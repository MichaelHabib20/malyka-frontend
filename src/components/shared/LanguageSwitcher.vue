<template>
  <div class="language-switcher">
    <button
      v-for="lang in inactiveLanguages"
      :key="lang.code"
      :class="['lang-btn']"
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

// Show only inactive languages
const inactiveLanguages = computed(() => {
  return languages.filter(lang => lang.code !== currentLang.value)
})

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

@media (max-width: 600px) {
  .language-switcher {
    gap: 0.25rem;
    flex-shrink: 0;
  }
  
  .lang-btn {
    padding: 0.2em 0.5em;
    font-size: 0.75rem;
    font-weight: 500;
    min-width: 0;
  }
}
</style> 