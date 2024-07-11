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
import { type Credentials, type PasswordRecovery, type PasswordSet, type SignedInUser } from '@/types/auth';

/**
 * Authentication service
 */
export default class AuthenticationService extends ApiClient {

	/**
	 * Requests password recovery
	 * @param {PasswordRecovery} recovery Password recovery parameters
	 */
	public async passwordRecovery(recovery: PasswordRecovery): Promise<void> {
		await this.getClient().post('/auth/password/recovery', {
			email: punycode.toASCII(recovery.email),
			baseUrl: BaseUrlHelper.get(),
		});
	}

	/**
	 * Resets the password
	 * @param {string} uuid Password reset request UUID
	 * @param {PasswordSet} reset Password reset parameters
	 * @return {Promise<SignedInUser>} User info with JWT token
	 */
	public async passwordReset(uuid: string, reset: PasswordSet): Promise<SignedInUser> {
		const response: AxiosResponse<SignedInUser> = await this.getClient().post(`/auth/password/reset/${uuid}`, reset);
		return response.data;
	}

	/**
	 * Sets the password of invited user
	 * @param {string} uuid Password set request UUID
	 * @param {PasswordSet} set Password set parameters
	 * @return {Promise<SignedInUser>} User info with JWT token
	 */
	public async passwordSet(uuid: string, set: PasswordSet): Promise<SignedInUser> {
		const response: AxiosResponse<SignedInUser> = await this.getClient().post(`/auth/password/set/${uuid}`, set);
		return response.data;
	}

	/**
	 * Signs in the user
	 * @param {Credentials} credentials User credentials
	 * @return {Promise<SignedInUser>} User info with JWT token
	 */
	public async signIn(credentials: Credentials): Promise<SignedInUser> {
		const body = {
			email: punycode.toASCII(credentials.email),
			password: credentials.password,
			code: credentials.code ?? undefined,
		};
		if (['', null, undefined].includes(body.code)) {
			delete body.code;
		}
		const response: AxiosResponse<SignedInUser> = await this.getClient().post('/auth/sign/in', body);
		return response.data;
	}

	/**
	 * Extends the session
	 * @return {Promise<SignedInUser>} User info with JWT token
	 */
	public async extendSession(): Promise<SignedInUser> {
		const response: AxiosResponse<SignedInUser> = await this.getClient().post('auth/token/refresh');
		return response.data;
	}

}
