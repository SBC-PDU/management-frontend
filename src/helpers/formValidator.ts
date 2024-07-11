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
import * as punycode from 'punycode/';
import { z } from 'zod';

/**
 * Form validators
 */
export default class FormValidator {

	/**
	 * Checks if a required field is filled
	 * @template {string} T Error message type
	 * @param {unknown} value Value to check
	 * @param {T} errorMessage Error message to return if the value is not valid
	 * @return {boolean | T} True if the value is valid, error message otherwise
	 */
	public static isRequired<T extends string>(value: unknown, errorMessage: T): boolean | T {
		if (value === null || value === undefined || (Array.isArray(value) && value.length === 0) || value === false) {
			return errorMessage;
		}
		return String(value).trim().length > 0 || errorMessage;
	}

	/**
	 * Checks if a field is a valid e-mail address
	 * @template {string} T Error message type
	 * @param {string} value Value to check
	 * @param {T} errorMessage Error message to return if the value is not valid
	 * @return {boolean | T} True if the value is valid, error message otherwise
	 */
	public static isEmail<T extends string>(value: string, errorMessage: T): boolean | T {
		const validator: z.ZodString = z.string().email();
		return validator.safeParse(punycode.toASCII(value)).success || errorMessage;
	}

	/**
	 * Checks if a field is a valid TOTP code
	 * @template {string} T Error message type
	 * @param {string} value Value to check
	 * @param {T} errorMessage Error message to return if the value is not valid
	 * @return {boolean | T} True if the value is valid, error message otherwise
	 */
	public static isTotpCode<T extends string>(value: string, errorMessage: T): boolean | T {
		const validator: z.ZodString = z.string().regex(/^\d{6}$/);
		return validator.safeParse(value).success || errorMessage;
	}

}
