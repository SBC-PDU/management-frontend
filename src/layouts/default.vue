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
	<v-app>
		<TheHeader />
		<TheSidebar />
		<v-main style='background-color: #f5f5f5'>
			<v-container>
				<UnverifiedAccountAlert />
				<router-view v-if='isAllowed' />
				<Forbidden v-else />
			</v-container>
		</v-main>
		<TheFooter />
	</v-app>
</template>

<script lang='ts' setup>
import { storeToRefs } from 'pinia';
import { computed, type Ref } from 'vue';
import { useRoute } from 'vue-router';

import Forbidden from '@/components/Forbidden.vue';
import TheFooter from '@/components/layout/TheFooter.vue';
import TheHeader from '@/components/layout/TheHeader.vue';
import TheSidebar from '@/components/layout/TheSidebar.vue';
import UnverifiedAccountAlert from '@/components/UnverifiedAccountAlert.vue';
import { useUserStore } from '@/store/user';
import { type UserRole } from '@/types/user';

const route = useRoute();
const userStore = useUserStore();

const { getRole: role } = storeToRefs(userStore);
const requiresAuth: Ref<boolean> = computed((): boolean => (route.meta.requiresAuth ?? true) as boolean);
const requiredRoles: Ref<UserRole[]> = computed((): UserRole[] => (route.meta.requiredRoles ?? []) as UserRole[]);
const isAllowed: Ref<boolean> = computed((): boolean => {
	return !requiresAuth.value || requiredRoles.value.length === 0 ||
		(role.value !== null && requiredRoles.value.includes(role.value));
});</script>
