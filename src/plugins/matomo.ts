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

import { type App } from 'vue';
import matomo from 'vue-matomo';
import { type Router } from 'vue-router';

/**
 * Registers Matomo integration
 * @param {App} app Vue.js app
 * @param {Router} router Router instance
 */
export default function registerMatomo(app: App, router: Router): void {
	if (!import.meta.env.VITE_MATOMO_ENABLED) {
		return;
	}
	app.use(matomo, {
		host: import.meta.env.VITE_MATOMO_HOST,
		siteId: import.meta.env.VITE_MATOMO_SITEID,
		router: router,
	});
}

