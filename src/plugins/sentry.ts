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
import * as Sentry from '@sentry/vue';
import { type App } from 'vue';
import { type Router } from 'vue-router';

/**
 * Registers Sentry integration
 * @param {App} app Vue.js app
 * @param {Router} router Router instance
 */
export default function registerSentry(app: App, router: Router): void {
	if (!import.meta.env.VITE_SENTRY_ENABLED) {
		return;
	}
	Sentry.init({
		app,
		dsn: import.meta.env.VITE_SENTRY_DSN,
		integrations: [
			Sentry.browserTracingIntegration({
				enableHTTPTimings: true,
				routeLabel: 'path',
				router: router,
				traceFetch: true,
				traceXHR: true,
			}),
			Sentry.replayIntegration(),
		],
		// This sets the sample rate to be 10%. You may want this to be 100% while
		// in development and sample at a lower rate in production
		replaysSessionSampleRate: 0.1,
		// If the entire session is not sampled, use the below sample rate to sample
		// sessions when an error occurs.
		replaysOnErrorSampleRate: 1,
		// Set tracesSampleRate to 1.0 to capture 100%
		// of transactions for performance monitoring.
		// We recommend adjusting this value in production
		tracesSampleRate: 1,
		tracePropagationTargets: ['localhost', 'sbc-pdu.romanondracek.cz', /^\//],
		release: __GIT_COMMIT_HASH__,
	});
}
