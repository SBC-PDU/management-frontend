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

<template>
	<v-menu
		location='bottom end'
	>
		<template #activator='{ props }'>
			<v-btn
				color='primary'
				v-bind='props'
			>
				{{ store.getLocaleFlag }}
				<v-icon
					color='white'
					:icon='mdiChevronDown'
				/>
			</v-btn>
		</template>
		<v-list>
			<v-list-item
				v-for='locale in store.getAvailableLocales'
				:key='locale.code'
				@click='setLanguage(locale.code)'
			>
				<v-list-item-title>{{ locale.flag }} {{ $t(`core.locales.${locale.code}`) }}</v-list-item-title>
			</v-list-item>
		</v-list>
	</v-menu>
</template>

<script lang='ts' setup>
import { mdiChevronDown } from '@mdi/js';

import { useLocaleStore } from '@/store/locale';
import { UserLanguage } from '@/types/user';

const store = useLocaleStore();

/**
 * Set the language
 * @param {UserLanguage} locale The locale to set
 */
function setLanguage(locale: UserLanguage) {
	store.setLocale(locale);
}
</script>
