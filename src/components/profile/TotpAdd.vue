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
			<v-btn
				v-bind='props'
				color='green'
				:prepend-icon='display.smAndUp.value ? mdiPlus : undefined'
				variant='elevated'
			>
				<span v-if='display.smAndUp.value'>
					{{ $t('core.user.totp.add.activator') }}
				</span>
				<v-icon
					v-else
					:icon='mdiPlus'
				/>
			</v-btn>
		</template>
		<v-form
			ref='form'
			@submit.prevent='add()'
		>
			<Card
				header-color='success'
				style='max-height: 90vh'
			>
				<template #title>
					{{ $t('core.user.totp.add.title') }}
				</template>
				<v-row>
					<v-col
						cols='12'
						md='6'
					>
						<v-tabs
							v-model='tab'
							bg-color='grey-lighten-2'
							fixed-tabs
						>
							<v-tab value='qrCode'>
								{{ $t('core.user.totp.secret.formats.qrCode') }}
							</v-tab>
							<v-tab value='text'>
								{{ $t('core.user.totp.secret.formats.text') }}
							</v-tab>
						</v-tabs>
						<v-window v-model='tab'>
							<v-window-item value='qrCode'>
								<qrcode-vue
									:value='totp.toString()'
									render-as='svg'
									level='M'
									:size='qrCodeSize'
									class='totp-qr-code'
								/>
							</v-window-item>
							<v-window-item value='text'>
								<v-text-field
									:model-value='(secret.base32.match(/.{1,4}/g) ?? []).join(" ")'
									readonly
									:label='$t("core.user.totp.secret.label")'
									:append-inner-icon='mdiContentCopy'
									@click:append-inner='copySecret'
								/>
								<v-btn
									color='primary'
									:href='totp.toString()'
									:prepend-icon='mdiTwoFactorAuthentication'
									width='100%'
								>
									{{ $t('core.user.totp.secret.openApp') }}
								</v-btn>
							</v-window-item>
						</v-window>
					</v-col>
					<v-col
						cols='12'
						md='6'
					>
						<v-text-field
							v-model='formData.name'
							:label='$t("core.user.totp.fields.name")'
							:rules='[
								(v: unknown) => FormValidator.isRequired(v, $t("core.user.totp.messages.emptyName")),
							]'
							required
							:counter='255'
							:prepend-inner-icon='mdiTextShort'
						/>
						<TotpField v-model='formData.code' />
						<PasswordField
							v-model='formData.password'
							:label='$t("core.user.fields.password")'
							:rules='[
								(v: unknown) => FormValidator.isRequired(v, $t("core.user.messages.emptyPassword")),
							]'
							required
							:prepend-inner-icon='mdiKey'
						/>
					</v-col>
				</v-row>
				<template #actions>
					<v-btn
						color='success'
						variant='text'
						type='submit'
					>
						{{ $t('core.user.totp.add.confirm') }}
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
		</v-form>
	</v-dialog>
</template>

<script lang='ts' setup>
import { mdiContentCopy, mdiKey, mdiPlus, mdiTextShort, mdiTwoFactorAuthentication } from '@mdi/js';
import * as OTPAuth from 'otpauth';
import QrcodeVue from 'qrcode.vue';
import Clipboard from 'v-clipboard';
import { computed, type Ref, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { toast } from 'vue3-toastify';
import { useDisplay } from 'vuetify';
import { VForm } from 'vuetify/components';

import Card from '@/components/Card.vue';
import PasswordField from '@/components/PasswordField.vue';
import TotpField from '@/components/users/TotpField.vue';
import FormValidator from '@/helpers/formValidator';
import ModalWindowHelper from '@/helpers/modalWindowHelper';
import AccountService from '@/services/AccountService';
import { useLoadingSpinnerStore } from '@/store/loadingSpinner';
import { useUserStore } from '@/store/user';
import { type UserTotpAdd } from '@/types/totp';

const display = useDisplay();
const i18n = useI18n();
const loadingSpinner = useLoadingSpinnerStore();
const userStore = useUserStore();
const service = new AccountService();

const emit = defineEmits(['submit']);
const dialog = ref<boolean>(false);
const modalWidth = ModalWindowHelper.getWidth();
const tab = ref<string>('qrCode');

const secret = ref<OTPAuth.Secret>(new OTPAuth.Secret({ size: 20 }));
const totp = new OTPAuth.TOTP({
	issuer: i18n.t('core.title').toString(),
	label: userStore.getEmail ?? '',
	algorithm: 'SHA1',
	digits: 6,
	period: 30,
	secret: secret.value,
});
const defaultFormData: UserTotpAdd = {
	secret: secret.value.base32,
	name: '',
	code: '',
	password: '',
};
const form: Ref<VForm | null> = ref(null);
const formData = ref<UserTotpAdd>(defaultFormData);

/// QR code size
const qrCodeSize = computed(() => {
	if (display.smAndDown.value) {
		return 200;
	}
	if (display.md.value && display.lg.value) {
		return 300;
	}
	return 400;
});

watch(dialog, (value: boolean) => {
	if (value) {
		secret.value = new OTPAuth.Secret({ size: 20 });
		formData.value = defaultFormData;
		formData.value.secret = secret.value.base32;
	}
});

/**
 * Close the dialog
 */
function close(): void {
	dialog.value = false;
}

/**
 * Add a new TOTP to the account
 */
async function add(): Promise<void> {
	if (form.value === null) {
		return;
	}
	const { valid } = await form.value.validate();
	if (!valid) {
		return;
	}
	loadingSpinner.show();
	await service.addTotp(formData.value)
		.then(() => {
			loadingSpinner.hide();
			toast.success(i18n.t('core.user.totp.add.messages.success').toString());
			emit('submit');
			close();
		})
		.catch(() => {
			loadingSpinner.hide();
			toast.error(i18n.t('core.user.totp.add.messages.error').toString());
		});
}

/**
 * Copy the secret to the clipboard
 */
async function copySecret(): Promise<void> {
	try {
		await Clipboard.copy(secret.value.base32);
		toast.success(i18n.t('core.user.totp.secret.copy.success').toString());
	} catch {
		toast.error(i18n.t('core.user.totp.secret.copy.error').toString());
	}
}

</script>

<style scoped lang='scss'>
.totp-qr-code {
	width: 100%;
	padding: 1rem;
}
</style>
