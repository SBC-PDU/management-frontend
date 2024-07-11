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
	<v-icon
		v-if='user.state === AccountState.Invited || user.state === AccountState.Unverified'
		:color='color()'
		class='me-2'
		:icon='mdiSend'
		@click='resend()'
	/>
</template>

<script lang='ts' setup>
import { mdiSend } from '@mdi/js';
import { useI18n } from 'vue-i18n';
import { toast } from 'vue3-toastify';

import UserService from '@/services/UserService';
import { useLoadingSpinnerStore } from '@/store/loadingSpinner';
import { AccountState, type UserInfo } from '@/types/user';

interface Props {
	/// User
	user: UserInfo;
}

const emit = defineEmits(['change']);
const i18n = useI18n();
const props = defineProps<Props>();

const loadingSpinner = useLoadingSpinnerStore();
const userService = new UserService();

/**
 * Returns the color of the icon
 * @return Icon color
 */
function color(): string {
	if (props.user.state === AccountState.Invited) {
		return 'blue';
	} else if (props.user.state === AccountState.Unverified) {
		return 'green';
	}
	return 'red';
}

/**
 * Resends the invitation or verification email
 */
async function resend(): Promise<void> {
	loadingSpinner.show();
	const translationParams = {
		name: props.user.name,
		email: props.user.email,
	};
	await userService.resend(props.user.id)
		.then(() => {
			if (props.user.state === AccountState.Invited) {
				toast.success(i18n.t('admin.users.resend.invitation.success', translationParams));
			} else if (props.user.state === AccountState.Unverified) {
				toast.success(i18n.t('admin.users.resend.verification.success', translationParams));
			}
		})
		.catch(() => {
			if (props.user.state === AccountState.Invited) {
				toast.error(i18n.t('admin.users.resend.invitation.error', translationParams));
			} else if (props.user.state === AccountState.Unverified) {
				toast.error(i18n.t('admin.users.resend.verification.error', translationParams));
			}
		});
	loadingSpinner.hide();
	close();
	emit('change');
}

</script>
