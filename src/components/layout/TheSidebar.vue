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
	<v-navigation-drawer
		v-model='isVisible'
		color='primary'
		:rail='isMinimized'
	>
		<SidebarItems :items='items()' />
		<template #append>
			<v-list>
				<v-list-item
					density='compact'
					style='margin-top: auto;'
					@click.stop='sidebarStore.toggleSize()'
				>
					<v-list-item-action>
						<v-icon :icon='isMinimized ? mdiChevronRight : mdiChevronLeft' />
					</v-list-item-action>
				</v-list-item>
			</v-list>
		</template>
	</v-navigation-drawer>
</template>

<script lang='ts' setup>
import { mdiAccount, mdiAccountKey, mdiBook, mdiChevronLeft, mdiChevronRight, mdiCog, mdiLogin, mdiPower } from '@mdi/js';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { useDisplay } from 'vuetify';

import SidebarItems from '@/components/layout/sidebar/SidebarItems.vue';
import { useSidebarStore } from '@/store/sidebar';
import { useUserStore } from '@/store/user';
import { type SidebarLink } from '@/types/sidebar';
import { UserRole } from '@/types/user';

const i18n = useI18n();
const display = useDisplay();
const sidebarStore = useSidebarStore();
const userStore = useUserStore();
const { isLoggedIn } = storeToRefs(userStore);

const { isMinimized, isVisible } = storeToRefs(sidebarStore);

sidebarStore.setVisibility(display.xlAndUp.value);

/**
 * Filter sidebar items based on user role
 * @param item Sidebar item to filter
 * @return True if the item should be displayed, false otherwise
 */
function filter(item: SidebarLink): boolean {
	const role: UserRole | null = userStore.getRole;
	if (item.children !== undefined) {
		item.children = item.children.filter((child: SidebarLink) => filter(child));
	}
	return !(item.roles !== undefined && role !== null && (Array.isArray(item.roles) && !item.roles.includes(role)));
}

/**
 * Returns sidebar items
 * @return Sidebar items
 */
function items(): SidebarLink[] {
	let links: SidebarLink[];
	if (isLoggedIn.value) {
		links = [
			{
				icon: mdiPower,
				title: i18n.t('core.devices.title').toString(),
				group: /^\/devices(\/.*)?$/,
				to: '/devices',
			},
			{
				icon: mdiAccount,
				title: i18n.t('core.profile.title').toString(),
				to: '/profile',
			},
			{
				icon: mdiCog,
				title: i18n.t('admin.title').toString(),
				to: '/admin',
				roles: [UserRole.Admin],
				children: [
					{
						title: i18n.t('admin.users.list.title').toString(),
						to: '/admin/users',
					},
				],
			},
			{
				icon: mdiBook,
				title: i18n.t('core.openApi.title').toString(),
				to: '/apiDocs',
			},
		];
	} else {
		links = [
			{
				icon: mdiLogin,
				title: i18n.t('core.sign.in.title').toString(),
				to: '/auth/sign/in',
			},
			{
				icon: mdiAccountKey,
				title: i18n.t('core.password.recovery.title').toString(),
				to: '/auth/password/recovery',
			},
			{
				icon: mdiBook,
				title: i18n.t('core.openApi.title').toString(),
				to: '/apiDocs',
			},
		];
	}
	return links.filter((item: SidebarLink) => filter(item));
}

</script>
