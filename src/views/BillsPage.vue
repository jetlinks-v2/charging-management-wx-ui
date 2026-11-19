<script setup lang="ts">
import {Button as VanButton} from 'vant'
import {Icon as VanIcon} from 'vant'
import {Tab as VanTab} from 'vant'
import {Tabs as VanTabs} from 'vant'
import {Tag as VanTag} from 'vant'
import {ref,reactive,watch,computed} from 'vue'
import {useRoute} from 'vue-router'
import {energyKind,energyKinds,energyTypes} from '../services/energy'
import RoomSwitcher from '../components/RoomSwitcher.vue'
import LoadState from '../components/LoadState.vue'
import SelectField from '../components/mobile/SelectField.vue'
import {getBills} from '../api/finance'
import {useRoomPage} from '../hooks/useRoomData'
import {money} from '../services/format'
const route=useRoute(),mode=ref(route.query.paid==='true'?'paid':'unpaid'),kind=ref(energyKind(route.query.type)||''),paid=computed(()=>mode.value==='paid'),vm=reactive(useRoomPage((room,page)=>getBills(room,paid.value,page,energyKind(kind.value))))
const expanded=ref<string[]>([])
const subjectOptions=[{value:'',label:'全部科目'},...energyKinds.map(value=>({value,label:energyTypes[value].name}))]
watch([mode,kind],()=>{expanded.value=[];void vm.load(true)})
watch(()=>route.query.type,value=>{kind.value=energyKind(value)||''})
function toggle(id:string){expanded.value=expanded.value.includes(id)?expanded.value.filter(v=>v!==id):[...expanded.value,id]}
</script>
<template>
<section class="page bills-page">
 <RoomSwitcher/>
 <SelectField v-model="kind" class="bill-filter" label="收费科目" title="选择收费科目" :clearable="false" :options="subjectOptions"/>
 <div class="page-tabs"><van-tabs v-model:active="mode"><van-tab name="unpaid" title="待缴费用"/><van-tab name="paid" title="已缴费用"/></van-tabs></div>
 <LoadState :loading="vm.loading&&!vm.rows.length" :error="vm.error" :empty="!vm.rows.length" empty-text="暂无对应账单" @retry="vm.load(true)">
  <div class="record-stack">
   <article v-for="bill in vm.rows" :key="bill.id" class="bill-card">
    <button class="bill-toggle" :aria-expanded="expanded.includes(bill.id)" @click="toggle(bill.id)">
     <span class="bill-calendar"><van-icon name="calendar-o"/></span>
     <span class="bill-copy"><strong>{{bill.subjectName}}</strong><span>{{bill.periodStart}} 至 {{bill.periodEnd}}</span></span>
     <span class="bill-right"><strong>¥{{money(paid?bill.paidAmount:bill.arrears)}}</strong><van-tag :type="paid?'success':'warning'">{{paid?'已缴清':Number(bill.paidAmount)>0?'部分已缴':'待缴'}}</van-tag></span>
     <van-icon name="arrow-down" class="expand-icon" :class="{rotated:expanded.includes(bill.id)}"/>
    </button>
    <template v-if="expanded.includes(bill.id)"><dl class="detail-list bill-breakdown"><div><dt>缴费截止日</dt><dd>{{bill.dueDate||'—'}}</dd></div><div><dt>应缴金额</dt><dd>¥{{money(bill.amount)}}</dd></div><div><dt>已缴金额</dt><dd>¥{{money(bill.paidAmount)}}</dd></div><div v-if="Number(bill.discount)>0"><dt>优惠减免</dt><dd class="positive">¥{{money(bill.discount)}}</dd></div><div v-if="Number(bill.lateFee)>0"><dt>逾期费用</dt><dd>¥{{money(bill.lateFee)}}</dd></div></dl><router-link :to="'/bills/'+encodeURIComponent(bill.id)" class="block-link">查看账单详情 <van-icon name="arrow"/></router-link></template>
   </article>
  </div>
  <van-button v-if="vm.rows.length<vm.total" class="load-more" :loading="vm.loading" @click="vm.load()" native-type="button">加载更多</van-button>
 </LoadState>
</section>
</template>
