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
			<v-icon :icon='mdiChartTimelineVariant' />
			{{ $t('core.devices.detail.measurements.title') }}
		</v-toolbar-title>
		<v-toolbar-items>
			<TimeRangeSelector
				v-model='timeRange'
				@update:model-value='fetchData'
			/>
			<v-btn
				color='primary'
				:prepend-icon='display.smAndUp.value ? mdiRefresh : undefined'
				variant='elevated'
				@click='fetchData(timeRange)'
			>
				<span v-if='display.smAndUp.value'>
					{{ $t('core.devices.detail.measurements.reload') }}
				</span>
				<v-icon
					v-else
					:icon='mdiRefresh'
				/>
			</v-btn>
		</v-toolbar-items>
	</v-toolbar>
	<Card
		v-if='loaded'
		header-color='grey'
	>
		<v-chart
			v-if='hasData'
			:autoresize='true'
			:option='options'
			class='chart'
		/>
		<v-alert
			v-else
			type='error'
		>
			{{ $t('core.devices.detail.measurements.messages.noData') }}
		</v-alert>
	</Card>
</template>

<script lang='ts' setup>
import { mdiChartTimelineVariant, mdiRefresh } from '@mdi/js';
import { type EChartsOption, type SeriesOption } from 'echarts';
import { LineChart } from 'echarts/charts';
import {
	DataZoomComponent,
	GridComponent,
	LegendComponent,
	TitleComponent,
	ToolboxComponent,
	TooltipComponent,
} from 'echarts/components';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { computed, reactive, type Ref, ref, watchEffect } from 'vue';
import VChart from 'vue-echarts';
import { useI18n } from 'vue-i18n';
import { toast } from 'vue3-toastify';
import { useDisplay } from 'vuetify';

import Card from '@/components/Card.vue';
import TimeRangeSelector from '@/components/devices/TimeRangeSelector.vue';
import DeviceService from '@/services/DeviceService';
import { useLoadingSpinnerStore } from '@/store/loadingSpinner';
import {
	type DeviceDetail,
	type DeviceOutputWithMeasurements,
	type DeviceOutputMeasurement,
	type DeviceOutputMeasurements,
} from '@/types/device';

use([
	CanvasRenderer,
	DataZoomComponent,
	GridComponent,
	LineChart,
	TitleComponent,
	ToolboxComponent,
	TooltipComponent,
	LegendComponent,
]);

interface Props {
	/// Device
	device: DeviceDetail;
}

const display = useDisplay();
const i18n = useI18n();
const service = new DeviceService();

const props = defineProps<Props>();
const loaded: Ref<boolean> = ref(false);
const loadingSpinner = useLoadingSpinnerStore();
const data: Ref<DeviceOutputMeasurements[]> = ref<DeviceOutputMeasurements[]>([]);
const legend = ref<string[]>([]);
const series = ref<SeriesOption[]>([]);
const timeRange = ref<string>('1h');
const hasData = computed((): boolean => {
	if (data.value.length === 0) {
		return false;
	}
	return data.value.filter((output: DeviceOutputMeasurements) => {
		return output.measurements.current.filter((measurement: DeviceOutputMeasurement) => measurement.value !== null).length > 0
			|| output.measurements.voltage.filter((measurement: DeviceOutputMeasurement) => measurement.value !== null).length > 0;
	}).length > 0;
});
/**
 * Fetches the measurements
 * @param {string} newTimeRange New time range
 */
async function fetchData(newTimeRange: string): Promise<void> {
	loadingSpinner.show();
	if (timeRange.value !== newTimeRange) {
		timeRange.value = newTimeRange;
	}
	try {
		data.value = await service.getMeasurements(props.device.id, timeRange.value);
		loaded.value = true;
		const newSeries: SeriesOption[] = [];
		for (const index in data.value) {
			const output: DeviceOutputMeasurements = data.value[index];
			newSeries.push({
				name: `#${output.index} - ${props.device.outputs[index].name}`,
				type: 'line',
				smooth: true,
				symbol: 'none',
				data: output.measurements.current.map((measurement: DeviceOutputMeasurement): [Date, number] => [measurement.time, measurement.value!]),
				connectNulls: false,
				tooltip: {
					valueFormatter: (value): string => Number(value).toFixed(2).toString() + ' mA',
				},
			});
			newSeries.push({
				name: `#${output.index} - ${props.device.outputs[index].name}`,
				type: 'line',
				smooth: true,
				symbol: 'none',
				data: output.measurements.voltage.map((measurement: DeviceOutputMeasurement): [Date, number] => [measurement.time, measurement.value!]),
				connectNulls: false,
				yAxisIndex: 1,
				xAxisIndex: 1,
				tooltip: {
					valueFormatter: (value): string => Number(value).toFixed(2).toString() + ' V',
				},
			});
		}
		legend.value = Object.values(props.device.outputs).map((output: DeviceOutputWithMeasurements) => `#${output.index} - ${output.name}`);
		series.value = newSeries;
		loadingSpinner.hide();
	} catch {
		toast.error(i18n.t('core.devices.detail.measurements.messages.error'));
		loadingSpinner.hide();
	}
}

watchEffect(async () => await fetchData(timeRange.value));

/**
 * Chart options
 */
const options: EChartsOption = reactive({
	tooltip: {
		trigger: 'axis',
	},
	title: [
		{
			left: 'center',
			text: i18n.t('core.devices.detail.measurements.current'),
		},
		{
			top: '55%',
			left: 'center',
			text: i18n.t('core.devices.detail.measurements.voltage'),
		},
	],
	legend: {
		data: legend,
		top: '48%',
	},
	toolbox: {
		feature: {
			saveAsImage: {},
		},
	},
	grid: [
		{
			bottom: '60%',
		},
		{
			top: '60%',
		},
	],
	xAxis: [
		{
			type: 'time',
			boundaryGap: false,
			gridIndex: 0,
		},
		{
			type: 'time',
			boundaryGap: false,
			gridIndex: 1,
		},
	],
	yAxis: [
		{
			type: 'value',
			min: 0,
			gridIndex: 0,
			axisLabel: {
				formatter: '{value} mA',
			},
		},
		{
			type: 'value',
			min: 0,
			gridIndex: 1,
			axisLabel: {
				formatter: '{value} V',
			},
		},
	],
	dataZoom: [
		{
			type: 'inside',
			xAxisIndex: [0, 1],
		},
		{
			xAxisIndex: [0, 1],
		},
		{
			type: 'inside',
			yAxisIndex: 0,
			labelFormatter: '{value} mA',
			filterMode: 'weakFilter',
		},
		{
			yAxisIndex: 0,
			labelFormatter: '{value} mA',
			filterMode: 'weakFilter',
		},
		{
			type: 'inside',
			yAxisIndex: 1,
			labelFormatter: '{value} V',
			filterMode: 'weakFilter',
		},
		{
			yAxisIndex: 1,
			labelFormatter: '{value} V',
			filterMode: 'weakFilter',
		},
	],
	series: series,
});

</script>

<style scoped>
.chart {
	height: 800px;
}
</style>
