<!--
Copyright 2022-2024 Roman Ondráček <mail@romanondracek.cz>

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
		<title>{{ $t('core.password.recovery.title') }}</title>
	</Head>
	<Card>
		<template #title>
			{{ $t('core.password.recovery.title') }}
		</template>
		{{ $t('core.password.recovery.text') }}
		<v-form
			ref='form'
			class='mt-4'
			@submit.prevent='submit'
		>
			<v-text-field
				v-model='recovery.email'
				:label='$t("core.user.fields.email")'
				:rules='[
					(v: unknown) => FormValidator.isRequired(v, $t("core.user.messages.emptyEmail")),
					(v: string) => FormValidator.isEmail(v, $t("core.user.messages.invalidEmail")),
				]'
				required
				:prepend-inner-icon='mdiEmail'
			/>
			<v-btn
				color='primary'
				type='submit'
				:prepend-icon='mdiAccountKey'
			>
				{{ $t('core.password.recovery.button') }}
			</v-btn>
		</v-form>
	</Card>
</template>

<route>
{
	"name": "PasswordRecovery",
	"meta": {
		"requiresAuth": false
	}
}
</route>

<script lang='ts' setup>
import { mdiAccountKey, mdiEmail } from '@mdi/js';
import { Head } from '@unhead/vue/components';
import { ref, type Ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { toast } from 'vue3-toastify';
import { VForm } from 'vuetify/components';

import Card from '@/components/Card.vue';
import FormValidator from '@/helpers/formValidator';
import AuthenticationService from '@/services/AuthenticationService';
import { useLoadingSpinnerStore } from '@/store/loadingSpinner';
import { type PasswordRecovery } from '@/types/auth';

const i18n = useI18n();
const loadingSpinner = useLoadingSpinnerStore();
const router = useRouter();
const service = new AuthenticationService();
const recovery: Ref<PasswordRecovery> = ref({
	email: '',
});
const form: Ref<VForm | null> = ref(null);

/**
 * Submit the form
 */
async function submit(): Promise<void> {
	if (form.value === null) {
		return;
	}
	const { valid } = await form.value.validate();
	if (!valid) {
		return;
	}
	loadingSpinner.show();
	try {
		await service.passwordRecovery(recovery.value);
		loadingSpinner.hide();
		toast.success(i18n.t('core.password.recovery.messages.success'));
		await router.push({ name: 'SignIn' });
	} catch {
		loadingSpinner.hide();
		toast.error(i18n.t('core.password.recovery.messages.error'));
	}
}
</script>
