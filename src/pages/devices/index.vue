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
		<title>{{ $t('core.devices.list.title') }}</title>
	</Head>
	<v-data-table
		v-if='state !== PageState.LoadFailed'
		:headers='headers'
		:items='devices'
		:items-length='devices.length'
		:loading='state === PageState.Loading'
	>
		<template #top>
			<v-toolbar
				color='primary'
				flat
			>
				<v-toolbar-title>
					<v-icon :icon='mdiPower' />
					{{ $t('core.devices.list.title') }}
				</v-toolbar-title>
				<v-toolbar-items>
					<DeviceForm
						action='add'
						@save='loadDevices()'
					/>
				</v-toolbar-items>
			</v-toolbar>
		</template>
		<template #item.name='{ item }'>
			<router-link :to='"/devices/" + item.id'>
				{{ item.name }}
			</router-link>
		</template>
		<template #item.lastSeen='{ item }'>
			<span v-if='item.lastSeen !== null'>{{ $d(item.lastSeen, 'long') }}</span>
		</template>
		<template #item.outputs='{ item }'>
			{{ item.outputs.length }}
		</template>
		<template #item.actions='{ item }'>
			<DeviceForm
				:id='item.id'
				action='editTable'
				@save='loadDevices()'
			/>
			<DeviceDeleteConfirmation
				v-if='userStore.getRole === UserRole.Admin'
				:device='item'
				@delete='loadDevices()'
			/>
		</template>
	</v-data-table>
	<v-alert
		v-else-if='state === PageState.LoadFailed'
		type='error'
	>
		{{ $t('core.devices.list.loadFailed') }}
	</v-alert>
</template>

<route>
{
	"name": "DeviceList",
}
</route>

<script lang='ts' setup>
import { mdiPower } from '@mdi/js';
import { Head } from '@unhead/vue/components';
import { onBeforeMount, type Ref, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import DeviceDeleteConfirmation from '@/components/devices/DeviceDeleteConfirmation.vue';
import DeviceForm from '@/components/devices/DeviceForm.vue';
import DeviceService from '@/services/DeviceService';
import { useUserStore } from '@/store/user';
import { type Device } from '@/types/device';
import { PageState } from '@/types/page';
import { UserRole } from '@/types/user';

const i18n = useI18n();
const deviceService = new DeviceService();
const userStore = useUserStore();

const headers = [
	{ title: i18n.t('core.devices.fields.name'), key: 'name' },
	{ title: i18n.t('core.devices.fields.macAddress'), key: 'macAddress' },
	{ title: i18n.t('core.devices.fields.lastSeen'), key: 'lastSeen' },
	{ title: i18n.t('core.devices.fields.outputs.title'), key: 'outputs' },
	{ title: i18n.t('core.tables.actions'), key: 'actions', align: 'end', sortable: false },
];
const devices = ref<Device[]>([]);
const state: Ref<PageState> = ref(PageState.Loading);

/**
 * Load devices
 */
async function loadDevices() {
	state.value = PageState.Loading;
	try {
		devices.value = await deviceService.list();
		state.value = PageState.Loaded;
	} catch {
		state.value = PageState.LoadFailed;
	}
}

onBeforeMount(async () => await loadDevices());
</script>
