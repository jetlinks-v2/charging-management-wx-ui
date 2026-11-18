<script setup lang="ts">
import {Icon as VanIcon} from 'vant'
import {reactive} from 'vue'
import RoomSwitcher from '../components/RoomSwitcher.vue'
import LoadState from '../components/LoadState.vue'
import MoneyAmount from '../components/MoneyAmount.vue'
import LedgerList from '../components/LedgerList.vue'
import {getAccounts,getRoomEntries} from '../api/finance'
import {useRoomData} from '../hooks/useRoomData'
import {money,subtract} from '../services/format'
import {total} from '../services/prepay'
const vm=reactive(useRoomData(getAccounts)),recent=reactive(useRoomData(getRoomEntries))
</script>
<template>
<section class="page wallet-page">
 <RoomSwitcher/>
 <LoadState :loading="vm.loading" :error="vm.error" @retry="vm.refresh">
  <section v-if="vm.data" class="wallet-account">
   <div class="section-heading"><h2>可用余额</h2><van-icon name="balance-o"/></div>
   <MoneyAmount :amount="total(vm.data.map(a=>a.available))"/>
   <p v-if="total(vm.data.map(a=>a.balance))!==total(vm.data.map(a=>a.available))" class="refund-pending">退款处理中 ¥{{money(subtract(total(vm.data.map(a=>a.balance)),total(vm.data.map(a=>a.available))))}}</p>
   <div class="account-actions"><router-link to="/energy">水电燃气 <van-icon name="arrow"/></router-link><router-link to="/prepay">物业费预存 <van-icon name="arrow"/></router-link></div>
  </section>
  <section v-if="vm.data?.length" class="recent-section"><div class="section-heading"><h2>我的预存账户</h2></div><div class="list-surface"><router-link v-for="account in vm.data" :key="account.id" :to="'/wallet/'+encodeURIComponent(account.id)" class="account-row"><span><strong>{{account.subjectName||'预存账户'}}</strong><small>{{account.standardName||'查看收支明细'}}</small></span><strong>¥{{money(account.available)}}</strong><van-icon name="arrow"/></router-link></div><p class="hint">各科目余额分别使用，不合并抵扣。</p></section>
 </LoadState>
 <section class="recent-section">
  <div class="section-heading"><h2>最近收支</h2><router-link to="/wallet/entries">全部 <van-icon name="arrow"/></router-link></div>
  <div class="list-surface"><LoadState :loading="recent.loading" :error="recent.error" :empty="!recent.data?.data.length" empty-text="暂无收支记录" @retry="recent.refresh"><LedgerList v-if="recent.data" :entries="recent.data.data.slice(0,5)"/></LoadState></div>
 </section>
 <router-link to="/records" class="standalone-link"><van-icon name="orders-o"/><span>缴费记录</span><van-icon name="arrow"/></router-link>
</section>
</template>
