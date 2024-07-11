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
	<v-chip
		:color='getColor(state)'
		:prepend-icon='display.mdAndUp.value ? getIcon(state) : undefined'
	>
		<span v-if='display.mdAndUp.value'>
			{{ $t(`core.user.states.${state}`) }}
		</span>
		<v-tooltip
			v-else
			location='start'
		>
			<template #activator='{ props }'>
				<v-icon v-bind='props'>
					{{ getIcon(state) }}
				</v-icon>
			</template>
			{{ $t(`core.user.states.${state}`) }}
		</v-tooltip>
	</v-chip>
</template>

<script lang='ts' setup>
import { mdiCheck, mdiEmail, mdiHelp, mdiLock } from '@mdi/js';
import { useDisplay } from 'vuetify';

import { AccountState } from '@/types/user';

interface Props {
  /// Account state
  state: AccountState;
}

const display = useDisplay();
defineProps<Props>();

/**
 * Returns the color for the given state
 * @param {AccountState} state The state to get the color for
 * @return {string} The color
 */
function getColor(state: AccountState): string {
	switch (state) {
		case AccountState.Verified:
			return 'green';
		case AccountState.Unverified:
			return 'orange';
		case AccountState.Invited:
			return 'blue';
		case AccountState.Blocked:
			return 'red';
	}
}

/**
 * Returns the icon for the given state
 * @param {AccountState} state The state to get the icon for
 * @return {string} The icon
 */
function getIcon(state: AccountState): string {
	switch (state) {
		case AccountState.Verified:
			return mdiCheck;
		case AccountState.Unverified:
			return mdiHelp;
		case AccountState.Invited:
			return mdiEmail;
		case AccountState.Blocked:
			return mdiLock;
	}
}

</script>
