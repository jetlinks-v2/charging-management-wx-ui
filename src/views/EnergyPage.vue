<script setup lang="ts">
import {Button as VanButton,Icon as VanIcon} from 'vant'
import {useEnergy} from '../hooks/useEnergy'
import {energyTypes} from '../services/energy'
import {money,time} from '../services/format'
import LoadState from '../components/LoadState.vue'
import RoomSwitcher from '../components/RoomSwitcher.vue'
import MonthPicker from '../components/MonthPicker.vue'
const {month,vm,summaries}=useEnergy()
</script>
<template><section class="page energy-page"><RoomSwitcher/>
 <div class="section-heading"><h2>能源用量</h2><MonthPicker v-model="month"/></div>
 <LoadState :loading="vm.loading" :error="vm.error" @retry="vm.refresh"><template v-if="vm.data">
  <p v-if="vm.data.usageError" class="inline-warning" role="alert">{{vm.data.usageError}} <button class="text-link" @click="vm.refresh">重试</button></p>
  <article v-for="item in summaries" :key="item.kind" class="energy-card">
   <div class="section-heading"><h2><van-icon :name="energyTypes[item.kind].icon"/> {{energyTypes[item.kind].name}}</h2><router-link :to="{path:'/energy/usage',query:{type:item.kind,month}}">用量明细 <van-icon name="arrow"/></router-link></div>
   <div class="energy-metrics"><div><span>月度用量</span><strong>{{money(item.usage)}} <small>{{energyTypes[item.kind].unit}}</small></strong></div><div><span>预存余额</span><strong>¥{{money(item.balance)}}</strong></div></div>
   <p v-if="!item.complete" class="hint">{{!item.meters.length?'暂无用量记录':item.usage===undefined?'暂无有效读数':'部分日期暂无数据'}}</p>
   <p v-if="item.lastTime" class="hint">最近采集 {{time(String(item.lastTime))}}</p>
   <div class="energy-actions"><router-link :to="{path:'/bills',query:{type:item.kind}}">查看账单</router-link><router-link v-if="vm.data.settings.some(s=>s.energyType===item.kind)" :to="{path:'/energy/deposit',query:{type:item.kind}}"><van-button type="primary" size="small">预存充值</van-button></router-link><van-button v-else size="small" disabled>暂不可预存</van-button></div>
  </article>
 </template></LoadState>
</section></template>
