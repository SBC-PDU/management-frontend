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
	<v-card class='mb-4'>
		<v-card-title
			v-if='$slots.title'
			:class='headerClass'
		>
			<slot name='title' />
		</v-card-title>
		<v-card-text class='card-text'>
			<slot />
		</v-card-text>
		<v-card-actions
			v-if='$slots.actions'
			:class='actionsClass'
		>
			<slot name='actions' />
		</v-card-actions>
	</v-card>
</template>

<script lang='ts' setup>
import { computed } from 'vue';


const props = defineProps({
	actionsColor: {
		type: String,
		default: 'grey-lighten-2',
		required: false,
	},
	headerColor: {
		type: String,
		default: 'primary',
		required: false,
	},
});
const actionsClass = computed(() => `bg-${props.actionsColor}`);
const headerClass = computed(() => `bg-${props.headerColor}`);
</script>

<style>
.card-text {
	padding: 1rem !important;
}
</style>
