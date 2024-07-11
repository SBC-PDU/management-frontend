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
		color='primary'
		density='comfortable'
	>
		<v-toolbar-title>
			<v-icon :icon='mdiInformationVariant' />
			{{ $t('core.devices.detail.info.title') }}
		</v-toolbar-title>
		<v-toolbar-items>
			<DeviceForm
				:id='device.id'
				action='edit'
				@save='reload()'
			/>
		</v-toolbar-items>
	</v-toolbar>
	<Card>
		<v-table>
			<tbody>
				<tr>
					<th>{{ $t('core.devices.fields.name') }}</th>
					<td>{{ device.name }}</td>
				</tr>
				<tr>
					<th>{{ $t('core.devices.fields.macAddress') }}</th>
					<td>{{ device.macAddress }}</td>
				</tr>
				<tr>
					<th>{{ $t('core.devices.fields.lastSeen') }}</th>
					<td>
						<span v-if='device.lastSeen'>
							{{ $d(device.lastSeen, 'long') }}
						</span>
					</td>
				</tr>
			</tbody>
		</v-table>
	</Card>
</template>

<script lang='ts' setup>
import { mdiInformationVariant } from '@mdi/js';

import Card from '@/components/Card.vue';
import DeviceForm from '@/components/devices/DeviceForm.vue';
import { type DeviceDetail } from '@/types/device';

/**
 * Device information props
 */
interface Props {
	/// Detailed device information
	device: DeviceDetail;
}

const emit = defineEmits(['reload']);
defineProps<Props>();

/**
 * Reload device information
 */
function reload() {
	emit('reload');
}

</script>
