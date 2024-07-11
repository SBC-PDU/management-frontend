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
	<v-menu>
		<template #activator='{props}'>
			<v-btn
				color='primary'
				:prepend-icon='display.smAndUp.value ? mdiTimelapse : undefined'
				:append-icon='mdiMenuDown'
				variant='elevated'
				v-bind='props'
			>
				<span v-if='display.smAndUp.value'>
					{{ $t(`core.devices.detail.measurements.timeRanges.${modelValue}`) }}
				</span>
				<v-icon
					v-else
					:icon='mdiTimelapse'
				/>
			</v-btn>
		</template>
		<v-list density='compact'>
			<v-list-item
				v-for='time in timeRanges'
				:key='time.value'
				@click='click(time.value)'
			>
				<v-list-item-title>{{ time.title }}</v-list-item-title>
			</v-list-item>
		</v-list>
	</v-menu>
</template>

<script lang='ts' setup>
import { mdiMenuDown, mdiTimelapse } from '@mdi/js';
import { useI18n } from 'vue-i18n';
import { useDisplay } from 'vuetify';

/**
 * Time range selector component props
 */
interface Props {
  modelValue: string;
}

/**
 * Time range
 */
interface TimeRange {
  /// Time range title
  title: string;
  /// Time range value
  value: string;
}

const display = useDisplay();
const i18n = useI18n();

const emit = defineEmits(['update:model-value']);
const componentProps = defineProps<Props>();
const timeRanges: TimeRange[] = [
	{ value: '5m', title: i18n.t('core.devices.detail.measurements.timeRanges.5m').toString() },
	{ value: '15m', title: i18n.t('core.devices.detail.measurements.timeRanges.15m').toString() },
	{ value: '1h', title: i18n.t('core.devices.detail.measurements.timeRanges.1h').toString() },
	{ value: '6h', title: i18n.t('core.devices.detail.measurements.timeRanges.6h').toString() },
	{ value: '12h', title: i18n.t('core.devices.detail.measurements.timeRanges.12h').toString() },
	{ value: '1d', title: i18n.t('core.devices.detail.measurements.timeRanges.1d').toString() },
	{ value: '1w', title: i18n.t('core.devices.detail.measurements.timeRanges.1w').toString() },
	{ value: '1mo', title: i18n.t('core.devices.detail.measurements.timeRanges.1mo').toString() },
];

/**
 * Handle time range change
 * @param timeRange The time range to set
 */
function click(timeRange: string) {
	if (componentProps.modelValue === timeRange) {
		return;
	}
	emit('update:model-value', timeRange);
}

</script>
