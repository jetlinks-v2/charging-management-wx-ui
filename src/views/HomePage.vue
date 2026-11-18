<script setup lang="ts">
import {Icon as VanIcon} from 'vant'
import {reactive} from 'vue'
import RoomSwitcher from '../components/RoomSwitcher.vue'
import LoadState from '../components/LoadState.vue'
import MoneyAmount from '../components/MoneyAmount.vue'
import EnergyTiles from '../components/EnergyTiles.vue'
import {useRoomData} from '../hooks/useRoomData'
import {getBills,getAccounts,getOptions,getEnergy} from '../api/finance'
import {businessMonth} from '../services/energy'
import {money} from '../services/format'
import {total} from '../services/prepay'
const bills=reactive(useRoomData(getBills)),accounts=reactive(useRoomData(getAccounts)),energy=reactive(useRoomData(room=>getEnergy(room,businessMonth())))
const offers=reactive(useRoomData(async room=>[...new Map((await getOptions(room)).flatMap(s=>s.activities).map(a=>[a.id,a])).values()]))
</script>
<template>
<section class="page home-page">
 <RoomSwitcher/>
 <section class="statement home-statement">
  <div class="section-heading"><h2>我的账单</h2><router-link to="/bills">全部账单 <van-icon name="arrow"/></router-link></div>
  <LoadState :loading="bills.loading" :error="bills.error" @retry="bills.refresh"><template v-if="bills.data"><p class="hint">待缴合计</p><MoneyAmount :amount="bills.data.totalAmount"/><p class="statement-caption">{{bills.data.total?`共${bills.data.total}笔待缴账单`:'当前房屋暂无待缴费用'}}</p><div v-if="bills.data.data.length" class="home-bill-lines"><router-link v-for="bill in bills.data.data.slice(0,2)" :key="bill.id" :to="'/bills/'+encodeURIComponent(bill.id)"><span>{{bill.periodStart.slice(0,7)}} {{bill.subjectName}}</span><strong>¥{{money(bill.arrears)}}</strong></router-link></div><router-link to="/bills" class="statement-action">{{bills.data.total?'查看并核对账单':'查看我的账单'}} <van-icon name="arrow"/></router-link></template></LoadState>
 </section>
 <div class="service-pair"><router-link to="/energy"><span class="service-icon"><van-icon name="bulb-o"/></span><strong>水电燃气</strong><span>查用量 · 预存充值</span><van-icon name="arrow" class="service-arrow"/></router-link><router-link to="/prepay"><span class="service-icon"><van-icon name="home-o"/></span><strong>物业费预存</strong><span>按月预存 · 查看优惠</span><van-icon name="arrow" class="service-arrow"/></router-link></div>
 <section class="home-usage"><div class="section-heading"><h2>本月用量</h2><router-link to="/energy">查看详情 <van-icon name="arrow"/></router-link></div><LoadState :loading="energy.loading" :error="energy.error" @retry="energy.refresh"><template v-if="energy.data"><p v-if="energy.data.usageError" class="inline-warning">{{energy.data.usageError}}</p><EnergyTiles :data="energy.data"/></template></LoadState></section>
 <LoadState :loading="accounts.loading" :error="accounts.error" @retry="accounts.refresh"><router-link v-if="accounts.data" to="/wallet" class="balance-link"><span>可用预存余额</span><strong>¥{{money(total(accounts.data.map(a=>a.available)))}}</strong><van-icon name="arrow"/></router-link></LoadState>
 <section v-if="offers.loading||offers.error||offers.data?.length" class="home-activities"><div class="section-heading"><h2>房屋优惠</h2></div><LoadState :loading="offers.loading" :error="offers.error" @retry="offers.refresh"><div class="list-surface"><router-link v-for="activity in offers.data" :key="activity.id" :to="{path:'/prepay',query:{activity:activity.id}}" class="activity-row"><span class="gift-icon"><van-icon name="gift-o"/></span><span class="activity-copy"><strong>{{activity.name}}</strong><span>有效期至 {{activity.endDate}}</span></span><van-icon name="arrow"/></router-link></div></LoadState></section>
</section>
</template>
