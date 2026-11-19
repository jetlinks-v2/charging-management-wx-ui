<script setup lang="ts">
import {computed,ref} from 'vue'
import {useEnergy} from '../hooks/useEnergy'
import {energyTypes,sumUsage} from '../services/energy'
import {money} from '../services/format'
import RoomSwitcher from '../components/RoomSwitcher.vue'
import LoadState from '../components/LoadState.vue'
import MonthPicker from '../components/MonthPicker.vue'
const {month,vm,selected}=useEnergy(),all=ref(false)
const days=computed(()=>{
 const grouped=new Map<string,{values:string[];complete:boolean;count:number}>()
 for(const meter of selected.value.meters)for(const day of meter.days){
  const row=grouped.get(day.date)||{values:[],complete:true,count:0};row.count++;row.complete&&=day.complete
  if(day.usage!=null)row.values.push(day.usage);grouped.set(day.date,row)
 }
 return [...grouped].sort(([a],[b])=>b.localeCompare(a)).map(([date,row])=>({date,usage:row.values.length?sumUsage(row.values):undefined,complete:row.complete&&row.count===selected.value.meters.length&&row.values.length===row.count}))
})
const visible=computed(()=>all.value?days.value:days.value.slice(0,7))
</script>
<template><section class="page"><RoomSwitcher/><div class="section-heading"><h2>{{energyTypes[selected.kind].name}}用量</h2><MonthPicker v-model="month"/></div>
 <LoadState :loading="vm.loading" :error="vm.error" @retry="vm.refresh"><template v-if="vm.data">
  <p v-if="vm.data.usageError" class="inline-warning">{{vm.data.usageError}}</p>
  <section class="energy-card sky-panel"><p class="hint">{{month}} 用量</p><p class="usage-total">{{money(selected.usage)}} <small>{{energyTypes[selected.kind].unit}}</small></p><p v-if="!selected.complete&&selected.usage!==undefined" class="hint">部分日期暂无数据</p></section>
  <div class="section-heading"><h2>每日用量</h2><span class="hint">{{energyTypes[selected.kind].unit}}</span></div>
  <div v-if="days.length" class="list-surface"><div v-for="day in visible" :key="day.date" class="usage-row"><time>{{day.date}}</time><span class="grow usage-track"><i v-if="day.usage!==undefined" :style="{width:Math.max(2,Number(day.usage)/Math.max(1,...days.map(d=>Number(d.usage||0)))*100)+'%'}"/></span><strong>{{money(day.usage)}}</strong><small>{{day.usage===undefined?'暂无数据':day.complete?'':'部分数据'}}</small></div><button v-if="days.length>7" class="block-link" @click="all=!all">{{all?'收起':'查看全部日期'}}</button></div>
  <p v-else class="empty-inline">暂无用量记录</p>
 </template></LoadState>
</section></template>
