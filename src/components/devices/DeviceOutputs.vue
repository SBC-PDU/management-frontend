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
	<v-toolbar
		color='grey'
		density='compact'
	>
		<v-toolbar-title>
			<v-icon :icon='mdiPower' />
			{{ $t('core.devices.detail.outputs.title') }}
		</v-toolbar-title>
		<v-toolbar-items>
			<v-btn
				color='primary'
				:prepend-icon='display.smAndUp.value ? mdiRefresh : undefined'
				variant='elevated'
				@click='reload()'
			>
				<span v-if='display.smAndUp.value'>
					{{ $t('core.devices.detail.outputs.reload') }}
				</span>
				<v-icon
					v-else
					:icon='mdiRefresh'
				/>
			</v-btn>
		</v-toolbar-items>
	</v-toolbar>
	<Card>
		<v-table>
			<thead>
				<tr>
					<th>{{ $t('core.devices.fields.outputs.index') }}</th>
					<th>{{ $t('core.devices.fields.outputs.name') }}</th>
					<th>{{ $t('core.devices.fields.outputs.state') }}</th>
					<th>{{ $t('core.devices.fields.outputs.alert') }}</th>
					<th>{{ $t('core.devices.fields.measurements.voltage') }}</th>
					<th>{{ $t('core.devices.fields.measurements.current') }}</th>
				</tr>
			</thead>
			<tbody>
				<tr
					v-for='output in device.outputs'
					:key='output.index'
				>
					<td>{{ output.index }}</td>
					<td>{{ output.name }}</td>
					<td>
						<v-switch
							v-model='output.enabled'
							color='primary'
							class='my-auto'
							@update:model-value='switchOutput(output)'
						/>
					</td>
					<td>
						<v-chip :color='output.alert ? "error" : "success"'>
							{{ $t(`core.devices.fields.outputs.alertValues.${output.alert.toString()}`) }}
						</v-chip>
					</td>
					<td>{{ Number(output.voltage).toFixed(2).toString() }} V</td>
					<td>{{ Number(output.current).toFixed(2).toString() }} mA</td>
				</tr>
			</tbody>
		</v-table>
	</Card>
</template>

<script lang='ts' setup>
import { mdiPower, mdiRefresh } from '@mdi/js';
import { useI18n } from 'vue-i18n';
import { toast } from 'vue3-toastify';
import { useDisplay } from 'vuetify';

import Card from '@/components/Card.vue';
import DeviceService from '@/services/DeviceService';
import { useLoadingSpinnerStore } from '@/store/loadingSpinner';
import { type DeviceDetail, type DeviceOutputWithMeasurements } from '@/types/device';

interface Props {
	/// Detailed device information
	device: DeviceDetail;
}

const display = useDisplay();
const i18n = useI18n();
const loadingSpinner = useLoadingSpinnerStore();
const service = new DeviceService();

const emit = defineEmits(['reload']);
const props = defineProps<Props>();

/**
 * Reloads the device information
 */
function reload() {
	emit('reload');
}

/**
 * Switches the output of a device
 * @param output Output to switch
 * @return Empty promise
 */
function switchOutput(output: DeviceOutputWithMeasurements): Promise<void> {
	loadingSpinner.show();
	return service.switchOutput(props.device.id, output.index, output.enabled)
		.then(() => {
			loadingSpinner.hide();
			setTimeout((): void => {
				emit('reload');
			}, 3_000);
			if (output.enabled) {
				toast.success(i18n.t('core.devices.detail.outputs.messages.success.switchedOn', {
					index: output.index,
					name: output.name,
				}).toString());
			} else {
				toast.success(i18n.t('core.devices.detail.outputs.messages.success.switchedOff', {
					index: output.index,
					name: output.name,
				}).toString());
			}
		})
		.catch(() => {
			loadingSpinner.hide();
			if (output.enabled) {
				toast.error(i18n.t('core.devices.detail.outputs.messages.error.switchedOn', {
					index: output.index,
					name: output.name,
				}).toString());
			} else {
				toast.error(i18n.t('core.devices.detail.outputs.messages.error.switchedOff', {
					index: output.index,
					name: output.name,
				}).toString());
			}
		});
}

</script>
