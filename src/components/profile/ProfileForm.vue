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
	<Card>
		<template #title>
			<v-icon :icon='mdiAccount' />
			{{ $t('core.profile.title') }}
		</template>
		<v-form
			v-if='state === PageState.Loaded'
			ref='form'
			class='mt-4'
			@submit.prevent='onSubmit'
		>
			<v-text-field
				v-model='user.name'
				:label='$t("core.user.fields.name")'
				:rules='[
					(v: unknown) => FormValidator.isRequired(v, $t("core.user.messages.emptyName")),
				]'
				required
				:prepend-inner-icon='mdiAccount'
			/>
			<v-text-field
				v-model='user.email'
				:label='$t("core.user.fields.email")'
				:rules='[
					(v: unknown) => FormValidator.isRequired(v, $t("core.user.messages.emptyEmail")),
					(v: string) => FormValidator.isEmail(v, $t("core.user.messages.invalidEmail")),
				]'
				required
				:prepend-inner-icon='mdiEmail'
			/>
			<LanguageSelector v-model='user.language' />
			<v-switch
				v-model='user.changePassword'
				:label='$t("core.profile.fields.passwordChange")'
				color='primary'
				:prepend-icon='mdiKeyChange'
			/>
			<PasswordField
				v-if='user.changePassword'
				v-model='user.oldPassword'
				:label='$t("core.user.fields.oldPassword")'
				:rules='[
					(v: string|null) => FormValidator.isRequired(v, $t("core.user.messages.emptyOldPassword")),
				]'
				required
				:prepend-inner-icon='mdiKey'
			/>
			<PasswordField
				v-if='user.changePassword'
				v-model='user.newPassword'
				:label='$t("core.user.fields.newPassword")'
				:rules='[
					(v: string|null) => FormValidator.isRequired(v, $t("core.user.messages.emptyNewPassword")),
				]'
				required
				:prepend-inner-icon='mdiKey'
			/>
			<v-btn
				color='primary'
				type='submit'
				:prepend-icon='mdiContentSave'
			>
				{{ $t('core.actions.edit') }}
			</v-btn>
		</v-form>
		<v-alert
			v-else-if='state === PageState.LoadFailed'
			type='error'
		>
			{{ $t('core.profile.messages.loadFailed') }}
		</v-alert>
	</Card>
</template>

<script lang='ts' setup>
import { mdiAccount, mdiContentSave, mdiEmail, mdiKey, mdiKeyChange } from '@mdi/js';
import { type AxiosError } from 'axios';
import { ref, type Ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { toast } from 'vue3-toastify';
import { VForm } from 'vuetify/components';

import Card from '@/components/Card.vue';
import PasswordField from '@/components/PasswordField.vue';
import LanguageSelector from '@/components/users/LanguageSelector.vue';
import FormValidator from '@/helpers/formValidator';
import AccountService from '@/services/AccountService';
import { useLoadingSpinnerStore } from '@/store/loadingSpinner';
import { useLocaleStore } from '@/store/locale';
import { useUserStore } from '@/store/user';
import { type AccountModify } from '@/types/account';
import { type SignedInUser } from '@/types/auth';
import { PageState } from '@/types/page.js';
import { type UserInfo, UserLanguage } from '@/types/user';

const i18n = useI18n();
const loadingSpinner = useLoadingSpinnerStore();
const localeStore = useLocaleStore();
const userStore = useUserStore();
const service = new AccountService();
const form: Ref<VForm | null> = ref(null);
const state: Ref<PageState> = ref<PageState>(PageState.Loading);
const user: Ref<AccountModify> = ref<AccountModify>({
	name: '',
	email: '',
	language: UserLanguage.English,
	changePassword: false,
	oldPassword: null,
	newPassword: null,
});

/**
 * Loads data from backend
 */
function loadData(): void {
	loadingSpinner.show();
	state.value = PageState.Loading;
	service.get()
		.then((info: UserInfo) => {
			state.value = PageState.Loaded;
			user.value = {
				name: info.name,
				email: info.email,
				language: info.language,
				changePassword: false,
				oldPassword: null,
				newPassword: null,
			};
			loadingSpinner.hide();
		})
		.catch(() => {
			loadingSpinner.hide();
			state.value = PageState.LoadFailed;
		});
}

loadData();

/**
 * Submit form
 */
async function onSubmit(): Promise<void> {
	if (form.value === null) {
		return;
	}
	const { valid } = await form.value.validate();
	if (!valid) {
		return;
	}
	loadingSpinner.show();
	service.edit(user.value)
		.then((response: SignedInUser) => {
			userStore.setUserInfo(response);
			localeStore.setLocale(user.value.language);
			loadData();
			loadingSpinner.hide();
			toast.success(i18n.t('core.profile.messages.success').toString());
		})
		.catch((error: AxiosError) => {
			loadingSpinner.hide();
			if (error.response?.status === 400) {
				const errorResponse: Error = error.response.data as Error;
				if (errorResponse.message === 'Incorrect current password.') {
					toast.error(i18n.t('core.profile.messages.incorrectCurrentPassword').toString());
					return;
				}
			}
			toast.error(i18n.t('core.profile.messages.error').toString());
		});
}
</script>
