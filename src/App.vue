<!--
Copyright 2022-2024 Roman Ondráček <mail@romanondracek.cz>

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
-->

<template :key='locale'>
	<LoadingSpinner />
	<SessionExpirationModal />
	<router-view />
</template>

<script lang='ts' setup>
import { storeToRefs } from 'pinia';
import { getActiveHead } from 'unhead';
import { type Ref, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { toast } from 'vue3-toastify';

import LoadingSpinner from '@/components/layout/LoadingSpinner.vue';
import SessionExpirationModal from '@/components/layout/SessionExpirationModal.vue';
import { useLocaleStore } from '@/store/locale';

const localeStore = useLocaleStore();
const { locale } = storeToRefs(localeStore);
const i18n = useI18n();

const siteName: Ref<string> = ref(i18n.t('core.title'));
const headOptions = ref({
	titleTemplate: '%s %separator %siteName',
	templateParams: {
		siteName: siteName,
		separator: '|',
	},
});

/**
 * Sets locale
 * @param {string | null} newLocale New locale
 */
function setLocale(newLocale: string | null = null): void {
	const localeToSet = newLocale ?? locale.value;
	i18n.locale.value = localeToSet;
	siteName.value = i18n.t('core.title').toString();
	getActiveHead()?.push(headOptions);
	toast.success(i18n.t('core.messages.localeChanged', { lang: i18n.t(`core.locales.${localeToSet}`) }));
}

watch(locale, setLocale);
setLocale(null);

</script>
