<script setup lang="ts">
import {Icon as VanIcon} from 'vant'
import {useEnergy} from '../hooks/useEnergy'
import {energyTypes,monthChoices} from '../services/energy'
import {money,time} from '../services/format'
import LoadState from '../components/LoadState.vue'
import RoomSwitcher from '../components/RoomSwitcher.vue'
const {month,vm,summaries}=useEnergy(),choices=monthChoices()
</script>
<template><section class="page energy-page"><RoomSwitcher/>
 <div class="section-heading"><h2>能源用量</h2><label class="month-filter">月份 <select v-model="month" aria-label="用量月份"><option v-for="value in choices" :key="value">{{value}}</option></select></label></div>
 <LoadState :loading="vm.loading" :error="vm.error" @retry="vm.refresh"><template v-if="vm.data">
  <p v-if="vm.data.usageError" class="inline-warning" role="alert">{{vm.data.usageError}} <button class="text-link" @click="vm.refresh">重试</button></p>
  <article v-for="item in summaries" :key="item.kind" class="energy-card">
   <div class="section-heading"><h2><van-icon :name="energyTypes[item.kind].icon"/> {{energyTypes[item.kind].name}}</h2><router-link :to="{path:'/energy/usage',query:{type:item.kind,month}}">用量明细 <van-icon name="arrow"/></router-link></div>
   <div class="energy-metrics"><div><span>所选月份已采集用量</span><strong>{{money(item.usage)}} <small>{{energyTypes[item.kind].unit}}</small></strong></div><div><span>当前可用预存余额</span><strong>¥{{money(item.balance)}}</strong></div></div>
   <p class="hint">{{!item.meters.length?'暂未关联能源仪表':item.usage===undefined?'暂无有效读数':item.complete?'当月采集完整':'数据尚不完整，以最终出账为准'}}</p>
   <p v-if="item.lastTime" class="hint">最近采集 {{time(String(item.lastTime))}}</p>
   <div class="energy-actions"><router-link :to="{path:'/bills',query:{type:item.kind}}">查看账单</router-link><router-link v-if="vm.data.settings.some(s=>s.energyType===item.kind)" :to="{path:'/energy/deposit',query:{type:item.kind}}">预存充值 <van-icon name="arrow"/></router-link><span v-else>暂未配置收费标准</span></div>
  </article>
  <p class="callout">预存按房屋、客户、科目和标准分别记账。正式账单结转后抵扣对应余额；余额不足的部分仍需缴费。</p>
 </template></LoadState>
</section></template>
