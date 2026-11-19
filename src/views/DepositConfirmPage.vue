<script setup lang="ts">
import {Button as VanButton} from 'vant'
import {useDepositConfirmation} from '../hooks/useDeposit'
import MoneyAmount from '../components/MoneyAmount.vue'
import LoadState from '../components/LoadState.vue'
const vm=useDepositConfirmation()
</script>
<template><section class="page"><LoadState :loading="vm.loading" :error="vm.error" @retry="vm.refresh"><template v-if="vm.data">
 <section class="confirmation-total"><h2>{{vm.data.subjectName}}预存充值</h2><MoneyAmount :amount="vm.data.amount"/><p class="room-path">{{vm.data.houseName}}</p></section>
 <section class="confirmation-card"><dl class="detail-list"><div><dt>客户</dt><dd>{{vm.data.payerName}}</dd></div><div><dt>收费科目</dt><dd>{{vm.data.subjectName}}</dd></div><div><dt>收费标准</dt><dd>{{vm.data.standardName}}</dd></div><div><dt>存入金额</dt><dd>¥{{vm.data.amount}}</dd></div></dl></section>
 <p class="hint">暂未开通在线支付，请联系物业办理预存。</p><van-button block disabled class="unavailable-payment">暂未开通在线支付</van-button>
 <router-link :to="{path:'/energy/deposit',query:$route.query}" class="block-link">调整预存金额</router-link>
 </template></LoadState></section></template>
