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
import { type AxiosResponse } from 'axios';
import * as punycode from 'punycode/';

import BaseUrlHelper from '@/helpers/baseUrlHelper';
import { ApiClient } from '@/services/ApiClient';
import { type AccountModify } from '@/types/account';
import { type SignedInUser } from '@/types/auth';
import { type UserTotp, type UserTotpAdd, type UserTotpRemove } from '@/types/totp';
import { type UserInfo } from '@/types/user';

/**
 * User account service
 */
export default class AccountService extends ApiClient {

	/**
	 * Returns information about logged-in user
	 * @return {Promise<UserInfo>} Information about logged-in user
	 */
	public async get(): Promise<UserInfo> {
		const response: AxiosResponse<UserInfo> =
			await this.getClient().get('/account');
		const user: UserInfo = response.data;
		/// Convert email to unicode
		user.email = punycode.toUnicode(user.email);
		return user;
	}

	/**
	 * Edits user account
	 * @param {AccountModify} account Account data
	 * @return {Promise<SignedInUser>} User data with JWT token
	 */
	public async edit(account: AccountModify): Promise<SignedInUser> {
		const body: AccountModify = account;
		body.email = punycode.toASCII(account.email);
		if (!account.changePassword) {
			delete body.oldPassword;
			delete body.newPassword;
		}
		const response: AxiosResponse<SignedInUser> =
			await this.getClient().put('/account', {
				...body,
				baseUrl: BaseUrlHelper.get(),
			});
		return response.data;
	}

	/**
	 * Lists user's TOTP tokens
	 * @return {Promise<UserTotp[]>} List of TOTP tokens
	 */
	public async listTotp(): Promise<UserTotp[]> {
		const response: AxiosResponse<Record<string, string>[]> =
			await this.getClient().get('/account/totp');
		return response.data.map((item: Record<string, string>): UserTotp => ({
			uuid: item.uuid,
			name: item.name,
			createdAt: new Date(item.createdAt),
			lastUsedAt: item.lastUsedAt !== null ? new Date(item.lastUsedAt) : null,
		}));
	}

	/**
	 * Adds a new TOTP token
	 * @param {UserTotpAdd} totp TOTP token data
	 */
	public async addTotp(totp: UserTotpAdd): Promise<void> {
		await this.getClient().post('/account/totp', {
			...totp,
			baseUrl: BaseUrlHelper.get(),
		});
	}

	/**
	 * Removes a TOTP token
	 * @param {string} uuid TOTP token UUID
	 * @param {UserTotpRemove} totp TOTP token removal confirmation
	 */
	public async removeTotp(uuid: string, totp: UserTotpRemove): Promise<void> {
		await this.getClient().delete(`/account/totp/${uuid}`, {
			data: {
				...totp,
				baseUrl: BaseUrlHelper.get(),
			},
		});
	}

	/**
	 * Resends verification e-mail
	 */
	public async resendVerificationEmail(): Promise<void> {
		await this.getClient().post('/account/verification/resend', {
			baseUrl: BaseUrlHelper.get(),
		});
	}

	/**
	 * Verifies user's e-mail
	 * @param {string} uuid Verification UUID
	 * @return {Promise<SignedInUser>} User data with JWT token
	 */
	public async verify(uuid: string): Promise<SignedInUser> {
		const response: AxiosResponse<SignedInUser> =
			await this.getClient().post(`/account/verification/${uuid}`);
		return response.data;
	}

}
