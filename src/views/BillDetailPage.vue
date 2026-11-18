<script setup lang="ts">
import {reactive} from 'vue'
import {useRoute} from 'vue-router'
import {getBill} from '../api/finance'
import {useRoomData} from '../hooks/useRoomData'
import {money} from '../services/format'
import {energyTypes} from '../services/energy'
import MoneyAmount from '../components/MoneyAmount.vue'
import LoadState from '../components/LoadState.vue'
const route=useRoute(),vm=reactive(useRoomData(room=>getBill(room,String(route.params.id))))
</script>
<template><section class="page"><LoadState :loading="vm.loading" :error="vm.error" @retry="vm.refresh"><template v-if="vm.data"><section class="confirmation-total"><p class="hint">{{Number(vm.data.arrears)>0?'待缴费用':'已缴清'}}</p><h2>{{vm.data.subjectName}}</h2><MoneyAmount :amount="Number(vm.data.arrears)>0?vm.data.arrears:vm.data.paidAmount"/></section>
 <section class="confirmation-card"><dl class="detail-list"><div><dt>费用所属期间</dt><dd>{{vm.data.periodStart}} 至 {{vm.data.periodEnd}}</dd></div><div><dt>应收日期</dt><dd>{{vm.data.receivableDate||'暂无记录'}}</dd></div><div><dt>缴费截止日</dt><dd>{{vm.data.dueDate||'暂无记录'}}</dd></div><div v-if="vm.data.sourceType==='METER'"><dt>确认出账日</dt><dd>{{vm.data.confirmedDate||'暂无记录'}}</dd></div><div v-if="vm.data.standardName"><dt>收费标准</dt><dd>{{vm.data.standardName}}</dd></div><div v-if="vm.data.sourceType==='METER'"><dt>结算用量</dt><dd>{{money(vm.data.usage)}} {{vm.data.energyType?energyTypes[vm.data.energyType].unit:''}}</dd></div><div><dt>应缴金额</dt><dd>¥{{money(vm.data.amount)}}</dd></div><div><dt>已缴金额</dt><dd>¥{{money(vm.data.paidAmount)}}</dd></div><div v-if="Number(vm.data.discount)"><dt>优惠减免</dt><dd>¥{{money(vm.data.discount)}}</dd></div><div v-if="Number(vm.data.lateFee)"><dt>逾期费用</dt><dd>¥{{money(vm.data.lateFee)}}</dd></div></dl></section>
 <p v-if="vm.data.sourceType==='METER'" class="callout">费用所属期间是实际用量月份；确认出账日是物业完成确认的日期。应收日期与缴费截止日按收费标准确定，可能早于确认出账日。</p><p v-if="vm.data.periodStatus==='CLOSED'" class="callout">用量账期已结算，不代表费用已缴清，请以已缴和待缴金额为准。</p><p v-if="Number(vm.data.arrears)>0" class="hint">当前暂未开通在线支付，请联系物业缴费。</p>
 </template></LoadState></section></template>
