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

/**
 * User account state
 */
export enum AccountState {
	/// Blocked account
	Blocked = 'blocked',
	/// Invited account
	Invited = 'invited',
	/// Unverified e-mail address
	Unverified = 'unverified',
	/// Verified e-mail address
	Verified = 'verified',
}

/**
 * User language
 */
export enum UserLanguage {
	/// Czech
	Czech = 'cs',
	/// English
	English = 'en',
}

/**
 * User role
 */
export enum UserRole {
	/// Admin user
	Admin = 'admin',
	/// Normal user
	Normal = 'normal',
}


/**
 * User information
 */
export interface UserInfo {
	/// User email
	email: string;
	/// User ID
	id: number;
	/// User language
	language: UserLanguage;
	/// User name
	name: string;
	/// User role
	role: UserRole;
	/// User access state
	state: AccountState;
}

export interface UserModify {
	/// User email
	email: string;
	/// User language
	language: UserLanguage;
	/// User name
	name: string;
	/// User role
	role: UserRole;
}

export interface UserAdd extends UserModify {
	/// User password
	password: string;
}
