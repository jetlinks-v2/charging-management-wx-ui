import {computed,reactive,ref,watch} from 'vue'
import {useRoute,useRouter} from 'vue-router'
import {getEnergy,quoteDeposit} from '../api/finance'
import {useRoomData} from './useRoomData'
import {businessMonth,depositAmount,energyKind,settingsFor} from '../services/energy'
import {currentRoom} from '../services/rooms'

export function useDeposit(){
 const route=useRoute(),router=useRouter(),kind=computed(()=>energyKind(route.query.type))
 const vm=reactive(useRoomData(room=>getEnergy(room,businessMonth()))),settingId=ref(''),input=ref('100'),error=ref('')
 const settings=computed(()=>settingsFor(vm.data,kind.value)),selected=computed(()=>settings.value.find(s=>s.id===settingId.value))
 watch(()=>vm.data,()=>{settingId.value=settings.value.find(s=>s.id===route.query.setting)?.id||settings.value[0]?.id||'';error.value='';input.value=typeof route.query.amount==='string'?route.query.amount:'100'})
 function next(){
  error.value=''
  if(!currentRoom.value||!selected.value)return
  try{const amount=depositAmount(input.value);void router.push({path:'/energy/deposit/confirm',query:{type:kind.value,setting:settingId.value,amount}})}catch(cause){error.value=(cause as Error).message}
 }
 return {vm,kind,settings,selected,settingId,input,error,next}
}
export function useDepositConfirmation(){
 const route=useRoute()
 // 每次进入确认页重新核验本人房屋及设置，不信任路由中的科目、客户或余额。
 return reactive(useRoomData(room=>quoteDeposit(room,{settingId:String(route.query.setting||''),amount:depositAmount(String(route.query.amount||''))})))
}
