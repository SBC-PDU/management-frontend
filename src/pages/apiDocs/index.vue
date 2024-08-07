<!--
Copyright 2022-2023 Roman Ondráček

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
-->

<template>
	<Head>
		<title>{{ $t('core.openApi.title') }}</title>
	</Head>
	<Card>
		<template #title>
			{{ $t('core.openApi.title') }}
		</template>
		<div
			id='swagger'
			class='swagger'
		/>
	</Card>
</template>

<route lang='yaml'>
name: ApiDocs
meta:
  requiresAuth: false
</route>

<script lang='ts' setup>
import { Head } from '@unhead/vue/components';
import { storeToRefs } from 'pinia';
import SwaggerUI from 'swagger-ui';
import 'swagger-ui/dist/swagger-ui.css';
import { useI18n } from 'vue-i18n';
import { toast } from 'vue3-toastify';

import Card from '@/components/Card.vue';
import { OpenApiService } from '@/services/OpenApiService';
import { useLoadingSpinnerStore } from '@/store/loadingSpinner';
import { useUserStore } from '@/store/user';

const i18n = useI18n();
const loadingSpinner = useLoadingSpinnerStore();
const userStore = useUserStore();
const { token } = storeToRefs(userStore);
const service = new OpenApiService();

loadingSpinner.show();
service.getSpecification()
	.then((spec) => {
		SwaggerUI({
			spec: spec,
			dom_id: '#swagger',
			requestInterceptor: (request: SwaggerUI.Request) => {
				if (token.value && !request.headers.Authorization) {
					request.headers.Authorization = `Bearer ${token.value}`;
				}
				return request;
			},
		});
		loadingSpinner.hide();
	})
	.catch(() => {
		toast.error(i18n.t('core.openApi.messages.error').toString());
		loadingSpinner.hide();
	});
</script>
