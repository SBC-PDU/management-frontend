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
				v-bind='props'
				color='error'
				class='me-2'
				:icon='mdiTrashCan'
			/>
		</template>
		<Card
			header-color='red-darken-1'
			style='max-height: 90vh'
		>
			<template #title>
				{{ $t('core.devices.delete.title') }}
			</template>
			{{ $t('core.devices.delete.message', {name: device.name, macAddress: device.macAddress}) }}
			<template #actions>
				<v-btn
					color='error'
					variant='text'
					@click='deleteUser()'
				>
					{{ $t('core.devices.delete.confirm') }}
				</v-btn>
				<v-spacer />
				<v-btn
					color='gray darken-1'
					@click='close'
				>
					{{ $t('core.actions.cancel') }}
				</v-btn>
			</template>
		</Card>
	</v-dialog>
</template>

<script lang='ts' setup>
import { mdiTrashCan } from '@mdi/js';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { toast } from 'vue3-toastify';

import Card from '@/components/Card.vue';
import ModalWindowHelper from '@/helpers/modalWindowHelper';
import DeviceService from '@/services/DeviceService';
import { useLoadingSpinnerStore } from '@/store/loadingSpinner';
import { type Device } from '@/types/device';

/**
 * The component props
 */
interface Props {
	/// User to delete
	device: Device;
}

const i18n = useI18n();
const loadingSpinner = useLoadingSpinnerStore();
const service = new DeviceService();

const emit = defineEmits(['delete']);
const componentProps = defineProps<Props>();
const dialog = ref<boolean>(false);
const modalWidth = ModalWindowHelper.getWidth();

/**
 * Close the dialog
 */
function close(): void {
	dialog.value = false;
}

/**
 * Delete the device
 */
function deleteUser(): void {
	loadingSpinner.show();
	service.delete(componentProps.device.id)
		.then(() => {
			close();
			emit('delete');
			loadingSpinner.hide();
			toast.success(i18n.t('core.devices.delete.messages.success', { name: componentProps.device.name, macAddress: componentProps.device.macAddress }));
		})
		.catch(() => {
			loadingSpinner.hide();
			toast.error(i18n.t('core.devices.delete.messages.error', { name: componentProps.device.name, macAddress: componentProps.device.macAddress }));
		});
}

</script>
