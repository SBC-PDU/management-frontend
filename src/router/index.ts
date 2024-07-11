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
import { setupLayouts } from 'virtual:generated-layouts';
import generatedRoutes from 'virtual:generated-pages';
import {
	createRouter,
	createWebHistory,
	type NavigationGuardNext,
	type RouteLocationNormalized,
	type Router,
	type RouteRecordRaw,
} from 'vue-router';

import { useUserStore } from '@/store/user';

const routes: RouteRecordRaw[] = [
	{
		path: '/',
		name: 'Home',
		redirect: { name: 'DeviceList' },
	},
	...setupLayouts(generatedRoutes),
];

const router: Router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes,
});

router.beforeEach((to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext): void => {
	const userStore = useUserStore();
	const requiresAuth: boolean = (to.meta.requiresAuth ?? true) === true;
	if (!userStore.isLoggedIn && requiresAuth) {
		let query = { ...to.query };
		if (to.path !== '/' && to.name !== 'SignIn') {
			query = { ...query, redirect: to.path };
		}
		return next({ name: 'SignIn', query });
	}
	if (to.name === 'SignIn' && userStore.isLoggedIn) {
		return next((to.query.redirect as string | undefined) ?? '/');
	}
	next();
});

export default router;
