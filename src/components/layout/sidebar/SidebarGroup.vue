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
	<v-list-group
		:prepend-icon='componentProps.subGroup ? "" : item.icon'
		:subgroup='componentProps.subGroup'
		:value='item.title'
	>
		<template #activator='{props}'>
			<v-list-item
				:title='item.title'
				density='compact'
				v-bind='props'
			/>
		</template>
		<div
			v-for='(navItem, idx) in item.children'
			:key='idx'
		>
			<SidebarGroup
				v-if='navItem.children !== undefined && navItem.children.length > 0'
				:item='navItem'
				sub-group
			/>
			<SidebarItem
				v-else
				:item='navItem'
			/>
		</div>
	</v-list-group>
</template>

<script lang='ts' setup>
import SidebarItem from '@/components/layout/sidebar/SidebarItem.vue';
import { type SidebarLink } from '@/types/sidebar';

interface Props {
	/// Sidebar items to render
	item: SidebarLink;
	/// Is subgroup?
	subGroup?: boolean;
}

const componentProps = defineProps<Props>();
</script>
