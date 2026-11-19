<script setup lang="ts">
import {reactive} from 'vue'
import {Button as VanButton} from 'vant'
import {useDeposit} from '../hooks/useDeposit'
import {energyTypes} from '../services/energy'
import {money} from '../services/format'
import LoadState from '../components/LoadState.vue'
import RoomSwitcher from '../components/RoomSwitcher.vue'
import SelectField from '../components/mobile/SelectField.vue'
const form=reactive(useDeposit()),amounts=['50','100','200','300','500','1000']
</script>
<template><section class="page with-dock"><RoomSwitcher/>
 <LoadState :loading="form.vm.loading" :error="form.vm.error" :empty="!form.settings.length" empty-text="当前房屋未配置该科目的收费标准，请联系物业" @retry="form.vm.refresh">
  <template v-if="form.kind&&form.selected"><section class="energy-card"><h2>{{energyTypes[form.kind].name}}预存充值</h2><SelectField v-if="form.settings.length>1" v-model="form.settingId" title="选择收费标准" label="收费标准" :clearable="false" :options="form.settings.map(setting=>({value:setting.id,label:setting.standardName}))"/><p v-else class="hint">{{form.selected.standardName}}</p></section>
   <h2 class="section-heading">预存金额</h2><div class="amount-options"><button v-for="value in amounts" :key="value" type="button" :class="{selected:form.input===value}" :aria-pressed="form.input===value" @click="form.input=value;form.error=''">¥{{money(value)}}</button></div>
   <label class="amount-input-label" for="deposit-amount">自定义金额</label><div class="amount-input"><span>¥</span><input id="deposit-amount" v-model="form.input" inputmode="decimal" autocomplete="off" maxlength="9" :aria-invalid="!!form.error" aria-describedby="deposit-error" @input="form.error=''"/></div><p id="deposit-error" class="inline-error" role="alert">{{form.error}}</p>
  </template>
 </LoadState>
</section><div v-if="form.selected" class="dock"><div><span class="dock-label">{{form.selected.subjectName}}预存</span><strong>{{form.input?'¥'+money(form.input):'请输入金额'}}</strong></div><van-button type="primary" @click="form.next">下一步</van-button></div></template>
