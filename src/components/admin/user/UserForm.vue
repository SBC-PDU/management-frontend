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
		v-model='dialog'
		persistent
		scrollable
		:width='modalWidth'
	>
		<template #activator='{ props }'>
			<v-icon
				v-if='action === Action.Edit'
				v-bind='props'
				color='primary'
				class='me-2'
				:icon='mdiPencil'
			/>
			<v-btn
				v-else
				v-bind='props'
				:color='action === Action.Add ? "green" : "info"'
				:prepend-icon='display.smAndUp.value ? (action === Action.Add ? mdiPlus : mdiSend) : undefined'
				variant='elevated'
			>
				<span v-if='action === Action.Add'>
					<span v-if='display.smAndUp.value'>
						{{ $t('admin.users.add.activator') }}
					</span>
					<v-icon
						v-else
						:icon='mdiPlus'
					/>
				</span>
				<span v-if='action === Action.Invite'>
					<span v-if='display.smAndUp.value'>
						{{ $t('admin.users.invite.activator') }}
					</span>
					<v-icon
						v-else
						:icon='mdiSend'
					/>
				</span>
			</v-btn>
		</template>
		<v-form
			ref='form'
			@submit.prevent='submit'
		>
			<Card
				:header-color='action === Action.Add ? "green-darken-1" : "primary"'
				style='max-height: 90vh'
			>
				<template #title>
					<span v-if='action === Action.Add'>
						<v-icon :icon='mdiAccountPlus' />
						{{ $t('admin.users.add.title') }}
					</span>
					<span v-if='action === Action.Edit'>
						<v-icon :icon='mdiAccountEdit' />
						{{ $t('admin.users.edit.title') }}
					</span>
					<span v-if='action === Action.Invite'>
						<v-icon :icon='mdiAccountPlus' />
						{{ $t('admin.users.invite.title') }}
					</span>
				</template>
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
				<PasswordField
					v-if='action === Action.Add'
					v-model='(user as UserAdd).password'
					:label='$t("core.user.fields.password")'
					:rules='[
						(v: string|null) => FormValidator.isRequired(v, $t("core.user.messages.emptyPassword")),
					]'
					required
					:prepend-inner-icon='mdiLock'
				/>
				<v-select
					v-model='user.role'
					:items='[
						{title: $t("core.user.roles.admin"), value: UserRole.Admin},
						{title: $t("core.user.roles.normal"), value: UserRole.Normal},
					]'
					:label='$t("core.user.fields.role")'
					:rules='[
						(v: unknown) => FormValidator.isRequired(v, $t("core.user.messages.emptyRole")),
					]'
					required
					:prepend-inner-icon='mdiAccountGroup'
				/>
				<LanguageSelector v-model='user.language' />
				<template #actions>
					<v-btn
						v-if='action === Action.Add'
						color='success'
						variant='text'
						type='submit'
					>
						{{ $t('core.actions.add') }}
					</v-btn>
					<v-btn
						v-if='action === Action.Edit'
						color='primary'
						variant='text'
						type='submit'
					>
						{{ $t('core.actions.edit') }}
					</v-btn>
					<v-btn
						v-if='action === Action.Invite'
						color='primary'
						variant='text'
						type='submit'
					>
						{{ $t('core.actions.invite') }}
					</v-btn>
					<v-spacer />
					<v-btn
						color='gray-darken-1'
						@click='close'
					>
						{{ $t('core.actions.cancel') }}
					</v-btn>
				</template>
			</Card>
		</v-form>
	</v-dialog>
</template>

<script lang='ts' setup>
import {
	mdiAccount,
	mdiAccountEdit,
	mdiAccountGroup,
	mdiAccountPlus,
	mdiEmail,
	mdiLock, mdiPencil,
	mdiPlus,
	mdiSend,
} from '@mdi/js';
import { PropType, type Ref, ref, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';
import { toast } from 'vue3-toastify';
import { useDisplay } from 'vuetify';
import { VForm } from 'vuetify/components';

import Card from '@/components/Card.vue';
import PasswordField from '@/components/PasswordField.vue';
import LanguageSelector from '@/components/users/LanguageSelector.vue';
import FormValidator from '@/helpers/formValidator';
import ModalWindowHelper from '@/helpers/modalWindowHelper';
import UserService from '@/services/UserService';
import { useLoadingSpinnerStore } from '@/store/loadingSpinner';
import { type UserAdd, type UserInfo, UserLanguage, type UserModify, UserRole } from '@/types/user';

/**
 * Actions to perform
 */
enum Action {
	Add = 'add',
	Edit = 'edit',
	Invite = 'invite',
}

const display = useDisplay();
const i18n = useI18n();
const loadingSpinner = useLoadingSpinnerStore();
const service = new UserService();

const emit = defineEmits(['reload']);
const componentProps = defineProps({
	action: {
		type: String as PropType<Action | 'add' | 'edit' | 'invite'>,
		required: true,
		validator: (value: Action | string) => ['add', 'edit', 'invite'].includes(value.toString()),
	},
	initUser: {
		type: Object as PropType<UserInfo>,
		required: false,
		default: undefined,
	},
});
const dialog = ref(false);
const form: Ref<VForm | null> = ref(null);
const defaultUser: UserModify = {
	name: '',
	email: '',
	role: UserRole.Normal,
	language: UserLanguage.English,
};
const modalWidth = ModalWindowHelper.getWidth();
const user = ref<UserAdd | UserModify>(defaultUser);

watchEffect(async (): Promise<void> => {
	switch (componentProps.action) {
		case Action.Add:
			user.value = { ...defaultUser, password: '' } as UserAdd;
			break;
		case Action.Edit:
			if (componentProps.initUser) {
				user.value = {
					name: componentProps.initUser.name,
					email: componentProps.initUser.email,
					role: componentProps.initUser.role,
					language: componentProps.initUser.language,
				};
			} else {
				user.value = { ...defaultUser };
			}
			break;
		case Action.Invite:
			user.value = { ...defaultUser };
			break;
	}
});

/**
 * Closes the dialog
 */
function close(): void {
	dialog.value = false;
}

/**
 * Creates a new user
 */
async function add(): Promise<void> {
	const translationParams = {
		name: user.value.name,
		email: user.value.email,
	};
	await service.create(user.value as UserAdd)
		.then(() => {
			loadingSpinner.hide();
			close();
			toast.success(i18n.t('admin.users.add.messages.success', translationParams));
		})
		.catch(() => {
			loadingSpinner.hide();
			toast.error(i18n.t('admin.users.add.messages.error', translationParams));
		});
}

/**
 * Invites the user
 */
async function invite(): Promise<void> {
	const translationParams = {
		name: user.value.name,
		email: user.value.email,
	};
	await service.create(user.value)
		.then(() => {
			loadingSpinner.hide();
			close();
			toast.success(i18n.t('admin.users.invite.messages.success', translationParams));
		})
		.catch(() => {
			loadingSpinner.hide();
			toast.error(i18n.t('admin.users.invite.messages.error', translationParams));
		});
}

/**
 * Edits the user
 * @return Empty promise
 */
async function edit(): Promise<void> {
	const translationParams = {
		name: user.value.name,
		email: user.value.email,
	};
	if (componentProps.initUser?.id === undefined) {
		return;
	}
	return await service.edit(componentProps.initUser.id, user.value)
		.then(() => {
			loadingSpinner.hide();
			close();
			toast.success(i18n.t('admin.users.edit.messages.success', translationParams));
		})
		.catch(() => {
			loadingSpinner.hide();
			toast.error(i18n.t('admin.users.edit.messages.error', translationParams));
		});
}

/**
 * Submits the form
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
	switch (componentProps.action) {
		case Action.Add:
			await add();
			break;
		case Action.Invite:
			await invite();
			break;
		case Action.Edit:
			await edit();
			break;
	}
	emit('reload');
}

</script>
