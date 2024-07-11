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

import { computed, type ComputedRef } from 'vue';
import { type DisplayInstance, useDisplay } from 'vuetify';

/**
 * Model window helpers
 */
export default class ModalWindowHelper {
	public static getWidth(): ComputedRef<string> {
		return computed((): string => {
			const display: DisplayInstance = useDisplay();
			if (display.lgAndUp.value) {
				return '50%';
			}
			if (display.md.value) {
				return '75%';
			}
			return '100%';
		});
	}
}
