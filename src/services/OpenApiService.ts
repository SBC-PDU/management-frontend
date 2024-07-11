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
import { type OpenAPI3, type ServerObject } from 'openapi-typescript';

import { ApiClient } from '@/services/ApiClient';

/**
 * OpenAPI service
 */
export class OpenApiService extends ApiClient {

	/**
	 * Returns OpenAPI specification
	 * @return {Promise<OpenAPI3>} OpenAPI specification
	 */
	public async getSpecification(): Promise<OpenAPI3> {
		const response: AxiosResponse<OpenAPI3> =
			await this.getClient().get('/openapi');
		const regEx: RegExp = /https:\/\/sbc-pdu\.romanondracek\.cz\/apiSchemas\/(requests|responses)\/(\w*)\.json/g;
		const replacement: string = import.meta.env.VITE_API_BASE_URL + '/openapi/schemas/$1/$2';
		const spec: OpenAPI3 = JSON.parse(JSON.stringify(response.data).replaceAll(regEx, replacement)) as OpenAPI3;
		spec.servers = [{ url: import.meta.env.VITE_API_BASE_URL } as unknown as ServerObject];
		return spec;
	}

}
