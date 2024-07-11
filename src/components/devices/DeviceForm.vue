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
		:persistent='true'
		:scrollable='true'
		:width='modalWidth'
	>
		<template #activator='{ props }'>
			<v-icon
				v-if='action === Action.EditFromTable'
				v-bind='props'
				color='primary'
				class='me-2'
				:icon='mdiPencilOutline'
			/>
			<v-btn
				v-else
				:color='action === Action.Add ? "green" : "blue"'
				:prepend-icon='display.smAndUp.value ? (action === Action.Add ? mdiPlus : mdiPencil) : undefined'
				v-bind='props'
				variant='elevated'
				class='float-end'
			>
				<span v-if='action === Action.Add'>
					<span v-if='display.smAndUp.value'>
						{{ $t('core.devices.add.activator') }}
					</span>
					<v-icon
						v-else
						:icon='mdiPlus'
					/>
				</span>
				<span v-if='action === Action.Edit'>
					<span v-if='display.smAndUp.value'>
						{{ $t('core.devices.edit.activator') }}
					</span>
					<v-icon
						v-else
						:icon='mdiPencil'
					/>
				</span>
			</v-btn>
		</template>
		<v-form
			v-if='state===PageState.Loaded'
			ref='form'
			@submit.prevent='submit'
		>
			<Card
				:header-color='action === Action.Add ? "green-darken-1" : "primary"'
				style='max-height: 90vh'
			>
				<template #title>
					{{ action === Action.Add ? $t('core.devices.add.title') : $t('core.devices.edit.title') }}
				</template>
				<v-text-field
					v-model='device.name'
					:label='$t("core.devices.fields.name")'
					:rules='[
						(v: unknown) => FormValidator.isRequired(v, $t("core.devices.form.messages.emptyName")),
					]'
					required
					:prepend-inner-icon='mdiTextShort'
				/>
				<v-text-field
					v-if='action === Action.Add'
					v-model='(device as DeviceAdd).macAddress'
					:label='$t("core.devices.fields.macAddress")'
					:rules='[
						(v: unknown) => FormValidator.isRequired(v, $t("core.devices.form.messages.emptyMacAddress")),
					]'
					required
					:prepend-inner-icon='mdiWifi'
				/>
				<h2 class='mb-4'>
					{{ $t('core.devices.form.outputs.title') }}
				</h2>
				<v-row
					v-for='(output, outputIndex) in device.outputs'
					:key='output.index'
				>
					<v-col
						cols='12'
						sm='4'
					>
						<v-text-field
							v-model.number='output.index'
							:label='$t("core.devices.fields.outputs.index")'
							:rules='[
								(v: unknown) => FormValidator.isRequired(v, $t("core.devices.form.messages.outputs.emptyIndex")),
							]'
							required
							type='number'
							:prepend-inner-icon='mdiIdentifier'
						/>
					</v-col>
					<v-col
						cols='12'
						sm='8'
					>
						<v-text-field
							v-model='output.name'
							:label='$t("core.devices.fields.outputs.name")'
							:rules='[
								(v: unknown) => FormValidator.isRequired(v, $t("core.devices.form.messages.outputs.emptyName")),
							]'
							required
							:prepend-inner-icon='mdiTextShort'
						>
							<template
								v-if='display.smAndUp.value'
								#append
							>
								<v-btn-group
									class='my-auto'
									density='compact'
								>
									<v-btn
										color='success'
										size='small'
										:icon='mdiPlus'
										@click='addOutput()'
									/>
									<v-btn
										color='red'
										:disabled='device.outputs.length === 1'
										size='small'
										:icon='mdiMinus'
										@click='device.outputs.splice(outputIndex, 1)'
									/>
								</v-btn-group>
							</template>
						</v-text-field>
						<v-btn-group
							v-if='display.xs.value'
							class='my-auto'
							density='compact'
						>
							<v-btn
								color='success'
								size='small'
								:icon='mdiPlus'
								@click='addOutput()'
							/>
							<v-btn
								color='red'
								:disabled='device.outputs.length === 1'
								size='small'
								:icon='mdiMinus'
								@click='removeOutput(outputIndex)'
							/>
						</v-btn-group>
					</v-col>
				</v-row>
				<v-btn
					v-if='device.outputs.length === 0'
					color='success'
					:icon='mdiPlus'
					@click='addOutput()'
				/>
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
						v-else
						color='primary'
						variant='text'
						type='submit'
					>
						{{ $t('core.actions.edit') }}
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
		<v-alert
			v-else-if='state === PageState.NotFound'
			type='error'
		>
			{{ $t('core.devices.form.messages.notFound') }}
		</v-alert>
	</v-dialog>
</template>

<script lang='ts' setup>
import { mdiIdentifier, mdiMinus, mdiPencil, mdiPencilOutline, mdiPlus, mdiTextShort, mdiWifi } from '@mdi/js';
import { AxiosError } from 'axios';
import { PropType, type Ref, ref, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';
import { toast } from 'vue3-toastify';
import { useDisplay } from 'vuetify';
import { VForm } from 'vuetify/components';

import Card from '@/components/Card.vue';
import FormValidator from '@/helpers/formValidator';
import ModalWindowHelper from '@/helpers/modalWindowHelper';
import DeviceService from '@/services/DeviceService';
import { useLoadingSpinnerStore } from '@/store/loadingSpinner';
import {
	type DeviceAdd,
	type DeviceDetail,
	type DeviceModify,
	type DeviceOutput,
	type DeviceOutputWithMeasurements,
} from '@/types/device';
import { PageState } from '@/types/page.js';

/**
 * Enum for action to perform
 */
enum Action {
  Add = 'add',
	Edit = 'edit',
	EditFromTable = 'editTable',
}

const display = useDisplay();
const i18n = useI18n();
const loadingSpinner = useLoadingSpinnerStore();
const service = new DeviceService();

const emit = defineEmits(['save']);
const componentProps = defineProps({
	action: {
		type: String as PropType<Action | 'add' | 'edit' | 'editTable'>,
		required: true,
		validator: (value: Action | string) => ['add', 'edit', 'editTable'].includes(value.toString()),
	},
	id: {
		type: String,
		required: false,
		default: undefined,
	},
});
const dialog = ref(false);
const modalWidth = ModalWindowHelper.getWidth();
const form: Ref<VForm | null> = ref(null);

const device: Ref<DeviceAdd|DeviceModify> = ref({
	name: '',
	outputs: [],
});
const state: Ref<PageState> = ref<PageState>(PageState.Loading);

/**
 * Loads data about the device
 */
async function loadData(): Promise<void> {
	if (componentProps.action === Action.Add || componentProps.id === undefined) {
		device.value = {
			name: '',
			macAddress: '',
			outputs: [
				{ index: 1, name: '' },
			],
		};
		state.value = PageState.Loaded;
		return;
	}
	state.value = PageState.Loading;
	try {
		const response: DeviceDetail = await service.get(componentProps.id);
		device.value = {
			name: response.name,
			outputs: response.outputs.map((output: DeviceOutputWithMeasurements): DeviceOutput => ({
				index: output.index,
				name: output.name,
			})),
		};
		state.value = PageState.Loaded;
	} catch (error) {
		if (error instanceof AxiosError) {
			if (error.response?.status === 404) {
				state.value = PageState.NotFound;
			} else {
				state.value = PageState.LoadFailed;
			}
		}
	}
}

watchEffect(async () => await loadData());

/**
 * Closes the dialog
 */
function close(): void {
	dialog.value = false;
}

/**
 * Adds a new output
 */
function addOutput(): void {
	device.value.outputs.push({ index: device.value.outputs.length + 1, name: '' });
}

/**
 * Removes an output
 * @param {number} index Index of the output to remove
 */
function removeOutput(index: number): void {
	device.value.outputs.splice(index, 1);
}

/**
 * Adds a new device
 * @param {DeviceAdd} data Device to add
 */
async function add(data: DeviceAdd): Promise<void> {
	try {
		await service.add(data);
		toast.success(i18n.t('core.devices.add.messages.success', { name: data.name }));
		loadingSpinner.hide();
		emit('save');
	} catch {
		toast.error(i18n.t('core.devices.add.messages.error', { name: data.name }));
		loadingSpinner.hide();
	}
}

/**
 * Edits a device
 * @param {string} id Device ID
 * @param {DeviceModify} data Device to edit
 */
async function edit(id: string, data: DeviceModify): Promise<void> {
	try {
		await service.edit(id, data);
		toast.success(i18n.t('core.devices.edit.messages.success', { name: data.name }));
		loadingSpinner.hide();
		emit('save');
	} catch {
		toast.error(i18n.t('core.devices.edit.messages.error', { name: data.name }));
		loadingSpinner.hide();
	}
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
	close();
	loadingSpinner.show();
	if (componentProps.action === Action.Add) {
		await add(device.value as DeviceAdd);
	} else if (componentProps.id !== undefined) {
		await edit(componentProps.id, device.value as DeviceModify);
	}
}

</script>
