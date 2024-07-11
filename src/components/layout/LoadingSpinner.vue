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
	<v-overlay
		:model-value='isEnabled'
		:persistent='true'
		class='align-center justify-center text-center'
	>
		<v-progress-circular
			indeterminate
			color='primary'
			bg-color='white'
			size='128'
			width='16'
		/>
		<div
			v-if='text !== null'
			class='mt-8'
		>
			<h2 class='text-white'>
				{{ text }}
			</h2>
		</div>
	</v-overlay>
</template>

<script lang='ts' setup>
import { storeToRefs } from 'pinia';

import { useLoadingSpinnerStore } from '@/store/loadingSpinner';

const store = useLoadingSpinnerStore();
const { isEnabled, getText: text } = storeToRefs(store);
</script>
