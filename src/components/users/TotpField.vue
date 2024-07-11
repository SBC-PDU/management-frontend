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
	<v-text-field
		:model-value='modelValue'
		v-bind='$attrs'
		:label='$t("core.user.totp.fields.code")'
		:rules='[
			(v: unknown) => FormValidator.isRequired(v, $t("core.user.totp.messages.emptyCode")),
			(v: string) => FormValidator.isTotpCode(v, $t("core.user.totp.messages.invalidCode")),
		]'
		required
		:counter='6'
		:prepend-inner-icon='mdiTwoFactorAuthentication'
	/>
</template>

<script lang='ts' setup>
import { mdiTwoFactorAuthentication } from '@mdi/js';

import FormValidator from '@/helpers/formValidator';

/**
 * TOTP code props
 */
interface Props {
  /// TOTP code
  modelValue: string | null;
}

defineProps<Props>();
</script>
