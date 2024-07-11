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

/**
 * Loading spinner store state
 */
interface LoadingSpinnerState {
	/// Loading spinner enablement
	enabled: boolean;
	/// Loading spinner text
	text: string|null;
	/// Loading spinner timeout
	timeout: number|null;
}

export const useLoadingSpinnerStore = defineStore('loadingSpinner', {
	state: (): LoadingSpinnerState => ({
		enabled: false,
		text: null,
		timeout: null,
	}),
	actions: {
		/**
		 * Show loading spinner
		 * @param {string|null} text Loading spinner text
		 * @param {number | null} timeout Loading spinner timeout
		 */
		show(text: string|null = null, timeout: number|null = null): void {
			this.enabled = true;
			this.text = text;
			if (timeout === null) {
				return;
			}
			this.timeout = window.setTimeout((): void => {
				this.hide();
			}, timeout);
		},
		/**
		 * Hide loading spinner
		 */
		hide(): void {
			this.enabled = false;
			this.text = null;
			if (this.timeout !== null) {
				window.clearTimeout(this.timeout);
				this.timeout = null;
			}
		},
		/**
		 * Update loading spinner text
		 * @param {string | null} text New loading spinner text
		 */
		updateText(text: string|null): void {
			this.text = text;
		},
	},
	getters: {
		/**
		 * Check if loading spinner is enabled
		 * @return {boolean} Loading spinner enablement
		 */
		isEnabled(): boolean {
			return this.enabled;
		},
		/**
		 * Returns loading spinner text
		 * @return {string | null} Loading spinner text
		 */
		getText(): string|null {
			return this.text;
		},
	},
});
