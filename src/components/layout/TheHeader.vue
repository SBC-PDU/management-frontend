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
	<v-app-bar color='primary'>
		<v-app-bar-nav-icon @click='sidebarStore.toggleVisibility()' />
		<v-img
			:src='Logo'
			alt='Logo'
			max-height='36'
			max-width='36'
			cover
		/>
		<v-app-bar-title class='d-none d-md-inline'>
			{{ $t('core.title') }}
		</v-app-bar-title>
		<v-spacer />
		<LocaleSwitcher />
		<ProfileDropdown v-if='userStore.isLoggedIn' />
	</v-app-bar>
</template>

<script lang='ts' setup>
import Logo from '@/assets/icon.svg?url';
import LocaleSwitcher from '@/components/layout/header/LocaleSwitcher.vue';
import ProfileDropdown from '@/components/layout/header/ProfileDropdown.vue';
import { useSidebarStore } from '@/store/sidebar';
import { useUserStore } from '@/store/user';

const sidebarStore = useSidebarStore();
const userStore = useUserStore();
</script>
