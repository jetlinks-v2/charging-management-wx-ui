import {test} from 'node:test'
import assert from 'node:assert/strict'
import {depositAmount,monthChoices,sumUsage} from '../src/services/energy'
import {energySummary} from '../src/hooks/useEnergy'
import type {EnergyOverview,EnergyMeter} from '../src/types'
import {money} from '../src/services/format'

test('金额预存按分校验边界，不接受指数、负数或第三位小数',()=>{
 for(const value of ['0','0.99','-1','01','1e3','1.001','999999.01','1000000','NaN',''])assert.throws(()=>depositAmount(value))
 assert.equal(depositAmount('1'),'1.00');assert.equal(depositAmount('100.1'),'100.10');assert.equal(depositAmount('999999'),'999999.00')
})
test('用量先汇总原精度再保留两位，不让浮点误差或逐表舍入改变合计',()=>{
 assert.equal(sumUsage(['1.005','1.005']),'2.01')
 assert.equal(sumUsage(['0.1','0.2']),'0.30');assert.equal(sumUsage(['12.345678901234']),'12.35')
 assert.equal(sumUsage(['9007199254740993.125','0.125']),'9007199254740993.25')
 assert.throws(()=>sumUsage(['not-a-reading']))
})
test('年度月份选择正确跨年，未知和真实零严格区分，缺失一台只显示部分数据',()=>{
 for(const unknown of [null,undefined,'','NaN'])assert.equal(money(unknown),'—')
 assert.equal(money('0'),'0.00')
 assert.deepEqual(monthChoices('2026-01').slice(0,3),['2026-01','2025-12','2025-11'])
 const meter=(usage:string|null,complete:boolean):EnergyMeter=>({id:String(usage),name:'分表',energyType:'water',usage,complete,lastTime:null,days:[]})
 const data:EnergyOverview={month:'2026-11',meters:[],accounts:[],settings:[]}
 assert.equal(energySummary(data,'water').usage,undefined)
 data.meters=[meter('0',true)];assert.equal(energySummary(data,'water').usage,'0.00');assert.equal(energySummary(data,'water').complete,true)
 data.meters.push(meter(null,false));assert.equal(energySummary(data,'water').complete,false);assert.equal(energySummary(data,'water').usage,'0.00')
 data.meters=[meter(null,false)];assert.equal(energySummary(data,'water').usage,undefined)
})
test('能源余额必须同时匹配房屋设置的科目和标准，不合并其他标准账户',()=>{
 const data:EnergyOverview={month:'2026-11',meters:[],settings:[{id:'setting',subjectId:'water',subjectName:'水费',standardId:'current',standardName:'民用水费',energyType:'water',price:'3.50'}],accounts:[
  {id:'a',balance:'100.00',available:'80.00',subjectId:'water',standardId:'current'},
  {id:'b',balance:'999.00',available:'999.00',subjectId:'water',standardId:'another'},
  {id:'c',balance:'222.00',available:'222.00',subjectId:'electricity',standardId:'current'}]}
 assert.equal(energySummary(data,'water').balance,'80.00');assert.equal(energySummary(data,'gas').balance,'0.00')
})

test('接口省略空用量字段时仍显示已知用量，不崩溃也不把缺失计为零',()=>{
 const empty={id:'empty',name:'未采集仪表',energyType:'water',complete:false,days:[{date:'2026-10-01',complete:false}]} as EnergyMeter
 const known={id:'known',name:'已采集仪表',energyType:'water',complete:true,usage:'12.00',days:[]} as EnergyMeter
 const data:EnergyOverview={month:'2026-10',meters:[empty],accounts:[],settings:[]}
 assert.equal(energySummary(data,'water').usage,undefined)
 data.meters.push(known)
 assert.equal(energySummary(data,'water').usage,'12.00')
 assert.equal(energySummary(data,'water').complete,false)
})
