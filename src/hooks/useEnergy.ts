import {computed,reactive,ref,watch} from 'vue'
import {useRoute} from 'vue-router'
import {getEnergy} from '../api/finance'
import {useRoomData} from './useRoomData'
import {businessMonth,energyKinds,energyKind,validMonth,sumUsage} from '../services/energy'
import {total} from '../services/prepay'
import type {EnergyKind,EnergyOverview} from '../types'

/** 沿用采集端的有效区间，部分数据单独标识；无读数不能以零用量显示。 */
export function energySummary(data:EnergyOverview|undefined,kind:EnergyKind){
 const meters=data?.meters.filter(m=>m.energyType===kind)||[],available=meters.filter(m=>m.usage!==null)
 return {kind,meters,usage:available.length?sumUsage(available.map(m=>m.usage!)):undefined,
  complete:!!meters.length&&meters.every(m=>m.complete&&m.usage!==null),
  lastTime:meters.reduce((latest,m)=>Math.max(latest,m.lastTime||0),0)||undefined,
  balance:total((data?.accounts||[]).filter(a=>data?.settings.some(s=>s.energyType===kind&&s.subjectId===a.subjectId&&s.standardId===a.standardId)).map(a=>a.available))}
}
export function useEnergy(){
 const route=useRoute(),initial=typeof route.query.month==='string'&&validMonth(route.query.month)?route.query.month:businessMonth()
 const month=ref(initial),vm=reactive(useRoomData(room=>getEnergy(room,month.value)))
 watch(month,()=>void vm.refresh())
 const summaries=computed(()=>energyKinds.map(kind=>energySummary(vm.data,kind)))
 const selected=computed(()=>energySummary(vm.data,energyKind(route.query.type)||'water'))
 return {month,vm,summaries,selected}
}
