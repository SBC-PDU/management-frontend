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
		<title>{{ $t('core.account.verification.title') }}</title>
	</Head>
	<Card>
		<template #title>
			{{ $t('core.account.verification.title') }}
		</template>
		<vue-countdown
			v-if='state === State.Success'
			v-slot='{ seconds }'
			:auto-start='true'
			:time='10_000'
			@end='redirect'
		>
			{{ $t('core.account.verification.redirect', {countdown: seconds}) }}
		</vue-countdown>
		<v-alert
			v-else-if='state !== State.Loading'
			type='error'
		>
			{{ $t(`core.account.verification.messages.${state.toString()}`) }}
		</v-alert>
	</Card>
</template>

<route lang='yaml'>
name: AccountVerification
meta:
  requiresAuth: false
</route>

<script lang='ts' setup>
import VueCountdown from '@chenfengyuan/vue-countdown';
import { Head } from '@unhead/vue/components';
import { type AxiosError } from 'axios';
import { type Ref, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { toast } from 'vue3-toastify';

import Card from '@/components/Card.vue';
import AccountService from '@/services/AccountService';
import { useLoadingSpinnerStore } from '@/store/loadingSpinner';
import { useUserStore } from '@/store/user';
import { type SignedInUser } from '@/types/auth';

/**
 * Account verification states
 */
enum State {
	/// User is already verified
	AlreadyVerified = 'alreadyVerified',
	/// User is banned
	Banned = 'banned',
	/// Generic error
	Error = 'error',
	/// Expired verification
	Expired = 'expired',
	/// Loading
	Loading = 'loading',
	/// Verification not found
	NotFound = 'notFound',
	/// Successfully verified
	Success = 'success',
}

interface Props {
	/// Verification UUID
	uuid: string;
}

const i18n = useI18n();
const loadingSpinner = useLoadingSpinnerStore();
const router = useRouter();
const service = new AccountService();
const store = useUserStore();

const state: Ref<State> = ref(State.Loading);
const props = defineProps<Props>();

/**
 * Redirects to the home page
 */
function redirect(): void {
	router.push('/');
}

/**
 * Verifies the account
 */
function verify(): void {
	loadingSpinner.show();
	service.verify(props.uuid)
		.then((response: SignedInUser): void => {
			state.value = State.Success;
			store.setUserInfo(response);
			loadingSpinner.hide();
			toast.success(i18n.t('core.account.verification.messages.success').toString());
		})
		.catch((error: AxiosError) => {
			loadingSpinner.hide();
			switch (error.response?.status) {
				case 400:
					state.value = State.AlreadyVerified;
					toast.error(i18n.t('core.account.verification.messages.alreadyVerified').toString());
					break;
				case 403:
					state.value = State.Banned;
					toast.error(i18n.t('core.account.verification.messages.banned').toString());
					break;
				case 404:
					state.value = State.NotFound;
					toast.error(i18n.t('core.account.verification.messages.notFound').toString());
					break;
				case 410:
					state.value = State.Expired;
					toast.error(i18n.t('core.account.verification.messages.expired').toString());
					break;
				default:
					state.value = State.Error;
					toast.error(i18n.t('core.account.verification.messages.error').toString());
					break;
			}
		});
}

verify();
</script>
