/**
 * Copyright 2022-2023 Roman Ondráček
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
import {UserInfo} from '@/types/user';

/**
 * User credentials
 */
export interface Credentials {
	/// User email
	email: string;
	/// User password
	password: string;
	/// TOTP code
	code: string | null;
}

/**
 * Password recovery request
 */
export interface PasswordRecovery {
	/// User email
	email: string;
}

/**
 * Password set
 */
export interface PasswordSet {
	/// User password
	password: string;
}

/**
 * Signed-in user - user info with JWT token
 */
export interface SignedInUser {
	/// JWT token
	token: string;
	/// User info
	info: UserInfo;
}
