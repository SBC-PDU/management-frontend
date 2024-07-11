/**
 * Copyright 2022-2024 Roman Ondráček <mail@romanondracek.cz>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { defineStore } from 'pinia';
import { preferredLocale } from 'preferred-locale';

import i18n from '@/plugins/i18n';
import { UserLanguage } from '@/types/user';

/**
 * Locale store state
 */
interface LocaleState {
	locale: UserLanguage;
}

/**
 * Locale
 */
interface Locale {
	/// Locale code
	code: UserLanguage;
	/// Locale Unicode flag
	flag: string;
}

export const useLocaleStore = defineStore('locale', {
	state: (): LocaleState => ({
		locale: preferredLocale(UserLanguage.English, [
			UserLanguage.Czech,
			UserLanguage.English,
		], { languageOnly: true }) as UserLanguage,
	}),
	actions: {
		/**
		 * Sets a new locale
		 * @param {UserLanguage} locale Locale to set
		 */
		setLocale(locale: UserLanguage): void {
			// @ts-ignore
			i18n.global.locale.value = locale.toString();
			this.locale = locale;
		},
	},
	getters: {
		/**
		 * Returns available locales
		 * @return {Locale[]} Available locales
		 */
		getAvailableLocales(): Locale[] {
			return [
				{ code: UserLanguage.Czech, flag: '🇨🇿' },
				{ code: UserLanguage.English, flag: '🇬🇧' },
			];
		},
		/**
		 * Returns current locale code
		 * @param {LocaleState} state Current state
		 * @return {UserLanguage} Current locale code
		 */
		getLocale(state: LocaleState): UserLanguage {
			return state.locale;
		},
		/**
		 * Returns current locale flag
		 * @param {LocaleState} state Current state
		 * @return {string} Current locale flag
		 */
		getLocaleFlag(state: LocaleState): string {
			switch (state.locale) {
				case UserLanguage.Czech:
					return '🇨🇿';
				case UserLanguage.English:
					return '🇬🇧';
				default:
					return '🏴‍☠️';
			}
		},
	},
	persist: true,
});
