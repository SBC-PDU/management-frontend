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
import { jwtDecode, type JwtPayload } from 'jwt-decode';
import { DateTime } from 'luxon';
import md5 from 'md5';
import { defineStore } from 'pinia';

import router from '@/router';
import AuthenticationService from '@/services/AuthenticationService';
import { useLocaleStore } from '@/store/locale';
import { type Credentials, type SignedInUser } from '@/types/auth';
import { type AccountState, type UserInfo, type UserRole } from '@/types/user';

/**
 * User store state
 */
interface UserState {
	/// Token expiration timestamp
	expiration: number;
	/// JWT token
	token: string | null;
	/// User info
	user: UserInfo | null;
}

export const useUserStore = defineStore('user', {
	state: (): UserState => ({
		expiration: 0,
		token: null,
		user: null,
	}),
	actions: {
		/**
		 * Sets user info from sign in response
		 * @param {SignedInUser} response Sign in response
		 */
		setUserInfo(response: SignedInUser): void {
			console.warn(response);
			const token: JwtPayload = jwtDecode(response.token);
			this.expiration = token.exp ?? 0;
			this.token = response.token;
			this.user = response.info;
			const localeStore = useLocaleStore();
			localeStore.setLocale(this.user.language);
			const sentryUser: Sentry.User = {
				id: this.user.id.toString(),
				username: this.user.name,
				email: this.user.email,
				ip_address: '{{auto}}',
			};
			Sentry.setUser(sentryUser);
		},
		/**
		 * Sign in
		 * @param {Credentials} credentials User credentials
		 */
		async signIn(credentials: Credentials): Promise<void> {
			const service: AuthenticationService = new AuthenticationService();
			const response: SignedInUser = await service.signIn(credentials);
			this.setUserInfo(response);
		},
		/**
		 * Sign out
		 */
		async signOut(): Promise<void> {
			this.expiration = 0;
			this.token = null;
			this.user = null;
			Sentry.setUser(null);
			await router.push('/auth/sign/in');
		},
	},
	getters: {
		/**
		 * Checks if user is logged in
		 * @param {UserState} state User state
		 * @return {boolean} True if user is logged in
		 */
		isLoggedIn(state: UserState): boolean {
			if (state.user === null) {
				return false;
			}
			const epoch: number = DateTime.now().toSeconds();
			return state.expiration > epoch;
		},
		/**
		 * Returns user ID
		 * @param {UserState} state User state
		 * @return {number | null} User ID
		 */
		getId(state: UserState): number | null {
			if (state.user === null || !this.isLoggedIn) {
				return null;
			}
			return state.user.id;
		},
		/**
		 * Returns user Gravatar avatar URL
		 * @param {UserState} state User state
		 * @return {string | null} Gravatar avatar URL
		 */
		getGravatarUrl(state: UserState): string | null {
			if (state.user === null || !this.isLoggedIn) {
				return null;
			}
			const hash = md5(state.user.email.trim().toLowerCase());
			return `https://www.gravatar.com/avatar/${hash}?s=200&d=mp`;
		},
		/**
		 * Returns user email
		 * @param {UserState} state User state
		 * @return {string | null} User email
		 */
		getEmail(state: UserState): string | null {
			if (state.user === null || !this.isLoggedIn) {
				return null;
			}
			return state.user.email;
		},
		/**
		 * Returns user token expiration timestamp
		 * @param {UserState} state User state
		 * @return {number | null} Token expiration timestamp
		 */
		getExpiration(state: UserState): number | null {
			if (state.user === null || !this.isLoggedIn) {
				return null;
			}
			return state.expiration;
		},
		/**
		 * Returns user name
		 * @param {UserState} state User state
		 * @return {string | null} User name
		 */
		getName(state: UserState): string | null {
			if (state.user === null || !this.isLoggedIn) {
				return null;
			}
			return state.user.name;
		},
		/**
		 * Returns user role
		 * @param {UserState} state User state
		 * @return {UserRole | null} User role
		 */
		getRole(state: UserState): UserRole | null {
			if (state.user === null || !this.isLoggedIn) {
				return null;
			}
			return state.user.role;
		},
		/**
		 * Returns account state
		 * @param {UserState} state User state
		 * @return {AccountState | null} Account state
		 */
		getState(state: UserState): AccountState | null {
			if (state.user === null || !this.isLoggedIn) {
				return null;
			}
			return state.user.state;
		},
		/**
		 * Returns JWT token
		 * @param {UserState} state User state
		 * @return {string | null} JWT token
		 */
		getToken(state: UserState): string | null {
			if (!this.isLoggedIn) {
				return null;
			}
			return state.token;
		},
	},
	persist: true,
});
