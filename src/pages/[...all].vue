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
		<title>{{ $t('core.error.404.title') }}</title>
	</Head>
	<Card>
		<template #title>
			{{ $t('core.error.404.header') }} - {{ $t('core.error.404.title') }}
		</template>
		<p>{{ $t('core.error.404.message') }}</p>
	</Card>
</template>

<route lang='yaml'>
name: NotFound
meta:
  requiresAuth: false
</route>

<script lang='ts' setup>
import { Head } from '@unhead/vue/components';

import Card from '@/components/Card.vue';
</script>
