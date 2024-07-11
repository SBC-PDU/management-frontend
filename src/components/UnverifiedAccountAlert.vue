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
	<v-alert
		v-if='userStore.getState === AccountState.Unverified'
		class='mb-4'
		type='warning'
		variant='tonal'
	>
		<div class='d-inline-block'>
			{{ $t('core.user.verification.resend.text') }}
		</div>
		<v-btn
			color='warning'
			class='float-right'
			dense
			:prepend-icon='mdiEmailFast'
			size='small'
			@click='resendVerificationEmail()'
		>
			{{ $t('core.user.verification.resend.button') }}
		</v-btn>
	</v-alert>
</template>

<script lang='ts' setup>
import { mdiEmailFast } from '@mdi/js';
import { useI18n } from 'vue-i18n';
import { toast } from 'vue3-toastify';

import AccountService from '@/services/AccountService';
import { useLoadingSpinnerStore } from '@/store/loadingSpinner';
import { useUserStore } from '@/store/user';
import { AccountState } from '@/types/user';

const accountService = new AccountService();
const i18n = useI18n();
const loadingSpinner = useLoadingSpinnerStore();
const userStore = useUserStore();

/**
 * Resend verification email
 */
async function resendVerificationEmail(): Promise<void> {
	loadingSpinner.show();
	try {
		await accountService.resendVerificationEmail();
		toast.success(i18n.t('core.user.verification.resend.messages.success').toString());
	} catch {
		toast.error(i18n.t('core.user.verification.resend.messages.error').toString());
	} finally {
		loadingSpinner.hide();
	}
}
</script>
