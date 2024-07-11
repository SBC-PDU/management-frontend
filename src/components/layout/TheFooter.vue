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
	<v-footer
		:absolute='false'
		app
		color='primary'
	>
		<span class='mr-auto ml-auto'>
			&copy; 2022-{{ currentYear }}
			<a
				class='text-white'
				href='https://www.romanondracek.cz/'
			>
				Roman Ondráček
			</a>
		</span>
	</v-footer>
</template>

<script lang='ts' setup>
const currentYear = new Date().getFullYear();
</script>
