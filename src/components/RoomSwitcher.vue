<script setup lang="ts">
import {Icon as VanIcon} from 'vant'
import {computed} from 'vue'
import {roomsState} from '../services/rooms'
const location=computed(()=>{
 const room=roomsState.selected
 if(!room)return ''
 const parts=room.fullName.split('/').filter(Boolean)
 if(parts[0]===room.projectName)parts.shift()
 if(parts[parts.length-1]===room.name)parts.pop()
 return parts.join(' / ')
})
</script>
<template><button class="room-switch" @click="roomsState.choosing=true">
 <span class="room-name"><span v-if="roomsState.selected" class="room-project">{{roomsState.selected.projectName}}</span><strong>{{roomsState.selected?(location?location+' · ':'')+roomsState.selected.name:'选择我的房屋'}}</strong><span v-if="roomsState.selected" class="room-location">{{roomsState.selected.customerName}}的房屋</span></span>
 <span class="switch-label">切换房屋 <van-icon name="arrow-down"/></span>
</button></template>
