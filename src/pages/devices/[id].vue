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
		<title>{{ $t('core.devices.detail.title', {name: device?.name}) }}</title>
	</Head>
	<v-alert
		v-if='state === PageState.LoadFailed'
		type='error'
		class='mb-4'
	>
		{{ $t('core.devices.detail.messages.fetchFailed') }}
	</v-alert>
	<v-alert
		v-if='state === PageState.NotFound'
		type='error'
		class='mb-4'
	>
		{{ $t('core.devices.detail.messages.notFound') }}
	</v-alert>
	<DeviceInfo
		v-if='device !== null'
		:device='device'
		@reload='fetchData(true)'
	/>
	<DeviceOutputs
		v-if='device !== null'
		:device='device'
		@reload='fetchData(false)'
	/>
	<DeviceMeasurementChart
		v-if='device !== null'
		:device='toRaw(device)'
	/>
</template>

<route>
{
	"name": "DeviceDetail"
}
</route>

<script lang='ts' setup>
import { Head } from '@unhead/vue/components';
import { AxiosError } from 'axios';
import { type Ref, ref, toRaw, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';
import { toast } from 'vue3-toastify';

import DeviceInfo from '@/components/devices/DeviceInfo.vue';
import DeviceMeasurementChart from '@/components/devices/DeviceMeasurementChart.vue';
import DeviceOutputs from '@/components/devices/DeviceOutputs.vue';
import DeviceService from '@/services/DeviceService';
import { useLoadingSpinnerStore } from '@/store/loadingSpinner';
import { type DeviceDetail } from '@/types/device';
import { PageState } from '@/types/page.js';

/**
 * Device detail props
 */
interface Props {
	/// PDU ID
	id: string;
}

const i18n = useI18n();
const loadingSpinner = useLoadingSpinnerStore();
const service = new DeviceService();
const props = defineProps<Props>();
const device = ref<DeviceDetail | null>(null);
const state: Ref<PageState> = ref<PageState>(PageState.Loading);

/**
 * Fetch information about device
 * @param {boolean} showSpinner Show loading spinner
 */
async function fetchData(showSpinner: boolean = true): Promise<void> {
	state.value = PageState.Loading;
	if (showSpinner) {
		loadingSpinner.show();
	}
	try {
		device.value = await service.get(props.id);
		state.value = PageState.Loaded;
	} catch (error) {
		if (error instanceof AxiosError) {
			if (error.response?.status === 404) {
				state.value = PageState.NotFound;
			} else {
				toast.error(i18n.t('core.devices.detail.messages.fetchFailed').toString());
				state.value = PageState.LoadFailed;
			}
		}
	} finally {
		if (showSpinner) {
			loadingSpinner.hide();
		}
	}
}

watchEffect(async () => await fetchData());
</script>
