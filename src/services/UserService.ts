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
import { type UserInfo, type UserModify } from '@/types/user';

/**
 * User manager service
 */
export default class UserService extends ApiClient {

	/**
	 * Creates a new user
	 * @param {UserModify} user User to create
	 */
	public async create(user: UserModify): Promise<void> {
		await this.getClient().post('/users', {
			...this.serializeUser(user),
			baseUrl: BaseUrlHelper.get(),
		});
	}

	/**
	 * Deletes a user
	 * @param {number} id User ID to delete
	 */
	public async delete(id: number): Promise<void> {
		await this.getClient().delete(`/users/${id}`);
	}

	/**
	 * Edits a user
	 * @param {number} id User ID to edit
	 * @param {UserModify} user Modified user
	 */
	public async edit(id: number, user: UserModify): Promise<void> {
		await this.getClient().put(`/users/${id}`, {
			...this.serializeUser(user),
			baseUrl: BaseUrlHelper.get(),
		});
	}

	/**
	 * Lists all users
	 * @return {Promise<UserInfo[]>} List of users
	 */
	public async list(): Promise<UserInfo[]> {
		const response: AxiosResponse<UserInfo[]> =
			await this.getClient().get('/users');
		return response.data.map((user: UserInfo): UserInfo => {
			/// Convert email to unicode
			user.email = punycode.toUnicode(user.email);
			return user;
		});
	}

	/**
	 * Blocks the user
	 * @param {number} id ID of user to block
	 */
	public async block(id: number): Promise<void> {
		await this.getClient().post(`/users/${id}/block`);
	}

	/**
	 * Unblocks the user
	 * @param {number} id ID of user to unblock
	 */
	public async unblock(id: number): Promise<void> {
		await this.getClient().post(`/users/${id}/unblock`);
	}

	/**
	 * Resends the invitation or verification email
	 * @param {number} id ID of user to resend email
	 */
	public async resend(id: number): Promise<void> {
		await this.getClient().post(`/users/${id}/resend`, {
			baseUrl: BaseUrlHelper.get(),
		});
	}

	/**
	 * Serializes user identity
	 * @param {UserModify} user User entity to serialize
	 * @return {UserModify} Serialized user entity
	 */
	private serializeUser(user: UserModify): UserModify {
		/// Convert email to punycode
		user.email = punycode.toASCII(user.email);
		return user;
	}

}
