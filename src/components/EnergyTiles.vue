<script setup lang="ts">
import {energyKinds,energyTypes} from '../services/energy'
import {energySummary} from '../hooks/useEnergy'
import {money} from '../services/format'
import type {EnergyOverview} from '../types'
defineProps<{data:EnergyOverview}>()
</script>
<template><div class="energy-tiles"><router-link v-for="kind in energyKinds" :key="kind" :to="{path:'/energy/usage',query:{type:kind,month:data.month}}">
 <span>{{energyTypes[kind].name.replace('费','')}} <small>{{energyTypes[kind].unit}}</small></span>
 <strong>{{money(energySummary(data,kind).usage)}}</strong><small>{{energySummary(data,kind).usage===undefined?'暂无用量':energySummary(data,kind).complete?'采集完整':'已采集用量'}}</small>
</router-link></div></template>
