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
	<v-dialog
		:model-value='dialog'
		persistent
		scrollable
		:width='modalWidth'
	>
		<Card
			header-color='warning'
			style='max-height: 90vh'
		>
			<template #title>
				{{ $t('core.session.expiration.title') }}
			</template>
			<vue-countdown
				v-if='dialog'
				v-slot='{ seconds }'
				auto-start
				:time='timer'
				@end='signOut()'
			>
				{{ $t('core.session.expiration.countdown', {countdown: seconds}, {plural: seconds}) }}
				{{ $t('core.session.expiration.message') }}
			</vue-countdown>
			<template #actions>
				<v-btn
					color='warning'
					@click='extendSession()'
				>
					{{ $t('core.session.expiration.extend') }}
				</v-btn>
				<v-spacer />
				<v-btn
					color='gray darken-1'
					@click='close()'
				>
					{{ $t('core.actions.cancel') }}
				</v-btn>
			</template>
		</Card>
	</v-dialog>
</template>

<script lang='ts' setup>
import VueCountdown from '@chenfengyuan/vue-countdown';
import { storeToRefs } from 'pinia';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { toast } from 'vue3-toastify';

import Card from '@/components/Card.vue';
import ModalWindowHelper from '@/helpers/modalWindowHelper';
import AuthenticationService from '@/services/AuthenticationService';
import { useLoadingSpinnerStore } from '@/store/loadingSpinner';
import { useUserStore } from '@/store/user';
import { type SignedInUser } from '@/types/auth';

const authenticationService = new AuthenticationService();
const i18n = useI18n();
const loadingSpinner = useLoadingSpinnerStore();
const router = useRouter();
const userStore = useUserStore();
const { getExpiration: expiration } = storeToRefs(userStore);

const dialog = ref<boolean>(false);
const modalWidth = ModalWindowHelper.getWidth();
const lastValue = ref<boolean>(false);
const isExpiring = ref<boolean>(false);
const timer = ref<number>(60);

/**
 * Closes the dialog
 */
function close() {
	dialog.value = false;
}

/**
 * Watches for changes in the session expiration
 */
setInterval(() => {
	if (expiration.value === null) {
		isExpiring.value = false;
		lastValue.value = false;
		close();
		return;
	}
	const now = new Date();
	const epoch = Math.round(now.getTime() / 1_000);
	const seconds = expiration.value - epoch;
	isExpiring.value = seconds < 60;
	if (isExpiring.value !== lastValue.value) {
		if (isExpiring.value) {
			timer.value = seconds * 1_000;
		}
		dialog.value = isExpiring.value;
		lastValue.value = isExpiring.value;
	}
}, 1_000);

/**
 * Extends the session
 */
async function extendSession() {
	loadingSpinner.show();
	await authenticationService.extendSession()
		.then((response: SignedInUser) => {
			userStore.setUserInfo(response);
			loadingSpinner.hide();
			isExpiring.value = false;
			toast.success(i18n.t('core.session.expiration.messages.success'));
			close();
		})
		.catch(() => {
			loadingSpinner.hide();
			toast.error(i18n.t('core.session.expiration.messages.error'));
		});
}

/**
 * Signs out the user
 */
function signOut() {
	toast.warning(i18n.t('core.session.expiration.messages.signOut'));
	userStore.signOut();
	router.push({ name: 'SignIn' });
}
</script>
