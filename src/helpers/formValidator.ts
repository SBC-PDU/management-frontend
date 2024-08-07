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
import * as punycode from 'punycode/';
import { z } from 'zod';

/**
 * Form validators
 */
export default class FormValidator {

	/**
	 * Checks if a required field is filled
	 * @param value Value to check
	 * @param errorMessage Error message to return if the value is not valid
	 * @return True if the value is valid, error message otherwise
	 */
	public static isRequired(value: unknown, errorMessage: string): boolean | string {
		return !!value || errorMessage;
	}

	/**
	 * Checks if a field is a valid e-mail address
	 * @param value Value to check
	 * @param errorMessage Error message to return if the value is not valid
	 * @return True if the value is valid, error message otherwise
	 */
	public static isEmail(value: string, errorMessage: string): boolean | string {
		const validator: z.ZodString = z.string().email();
		return validator.safeParse(punycode.toASCII(value)).success || errorMessage;
	}

	/**
	 * Checks if a field is a valid TOTP code
	 * @param value Value to check
	 * @param errorMessage Error message to return if the value is not valid
	 * @return True if the value is valid, error message otherwise
	 */
	public static isTotpCode(value: string, errorMessage: string): boolean | string {
		const validator: z.ZodString = z.string().regex(/^\d{6}$/);
		return validator.safeParse(value).success || errorMessage;
	}

}
