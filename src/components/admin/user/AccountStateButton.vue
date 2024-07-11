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
		v-if='user.state === AccountState.Blocked'
		color='green'
		class='me-2'
		:icon='mdiLockOff'
		@click='unblockUser()'
	/>
	<v-icon
		v-else
		color='red'
		class='me-2'
		:icon='mdiLock'
		@click='blockUser()'
	/>
</template>

<script lang='ts' setup>
import { mdiLock, mdiLockOff } from '@mdi/js';
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
 * Blocks the user
 */
function blockUser(): void {
	loadingSpinner.show();
	userService.block(props.user.id)
		.then(() => {
			loadingSpinner.hide();
			close();
			emit('change');
			toast.success(i18n.t('admin.users.block.messages.success', { name: props.user.name, email: props.user.email }));
		})
		.catch(() => {
			toast.error(i18n.t('admin.users.block.messages.error', { name: props.user.name, email: props.user.email }));
		});
}

/**
 * Unblocks the user
 */
function unblockUser(): void {
	loadingSpinner.show();
	userService.unblock(props.user.id)
		.then(() => {
			loadingSpinner.hide();
			close();
			emit('change');
			toast.success(i18n.t('admin.users.unblock.messages.success', { name: props.user.name, email: props.user.email }));
		})
		.catch(() => {
			toast.error(i18n.t('admin.users.unblock.messages.error', { name: props.user.name, email: props.user.email }));
		});
}
</script>
