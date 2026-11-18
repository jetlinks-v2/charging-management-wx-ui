import type {EnergyKind,EnergyOverview,EnergySetting} from '../types'

export const energyTypes:Record<EnergyKind,{name:string;unit:string;icon:string}>={
 water:{name:'水费',unit:'m³',icon:'water-o'},
 electricity:{name:'电费',unit:'kWh',icon:'lightning'},
 gas:{name:'燃气费',unit:'m³',icon:'fire-o'},
}
export const energyKinds=Object.keys(energyTypes) as EnergyKind[]
export function energyKind(value:unknown):EnergyKind|undefined{return typeof value==='string'&&value in energyTypes?value as EnergyKind:undefined}
export function businessMonth(){return new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit'}).format(new Date())}
export function validMonth(value:string){return /^\d{4}-(0[1-9]|1[0-2])$/.test(value)&&value<='9999-12'}
export function monthChoices(now=businessMonth()){
 const [year,month]=now.split('-').map(Number)
 return Array.from({length:12},(_,i)=>new Date(Date.UTC(year!,month!-1-i,1)).toISOString().slice(0,7))
}
/** 金额按分校验；不把指数、负数或多余精度静默四舍五入后提交。 */
export function depositAmount(input:string){
 if(!/^(?:0|[1-9]\d{0,5})(?:\.\d{1,2})?$/.test(input))throw Error('请输入1至999999元，最多两位小数')
 const [whole,part='']=input.split('.'),value=BigInt(whole!)*100n+BigInt(part.padEnd(2,'0'))
 if(value<100n||value>99999900n)throw Error('请输入1至999999元，最多两位小数')
 return `${value/100n}.${String(value%100n).padStart(2,'0')}`
}
export function settingsFor(data:EnergyOverview|undefined,kind:EnergyKind|undefined):EnergySetting[]{return data?.settings.filter(s=>s.energyType===kind)||[]}
/** 先以采集精度求和再做展示舍入，不逐表舍入，也不经浮点金额计算。 */
export function sumUsage(values:string[]){
 const sum=values.reduce((acc,value)=>{
  if(!/^\d+(?:\.\d{1,12})?$/.test(value))throw Error('用量数据格式不正确，请联系物业核对')
  const [whole,part='']=value.split('.');return acc+BigInt(whole!)*1000000000000n+BigInt(part.padEnd(12,'0'))
 },0n)
 const rounded=(sum+5000000000n)/10000000000n
 return `${rounded/100n}.${String(rounded%100n).padStart(2,'0')}`
}
