<script setup lang="ts">
import {Button as VanButton} from 'vant'
import {Icon as VanIcon} from 'vant'
import {computed} from 'vue'
import {useRoute} from 'vue-router'
import {useOwnerBack} from './hooks/useOwnerBack'
import {roomsState,loadRooms,currentRoom} from './services/rooms'
import LoadState from './components/LoadState.vue'
import RoomSwitcher from './components/RoomSwitcher.vue'
import RoomPicker from './components/RoomPicker.vue'
const route=useRoute(),login=computed(()=>route.path==='/login'),back=useOwnerBack()
const root=computed(()=>['/','/bills','/wallet','/profile'].includes(route.path))
const titles:Record<string,string>={'/':'房屋服务','/bills':'我的账单','/prepay':'物业费预存','/confirm':'确认预存','/records':'缴费记录','/wallet':'预存余额','/profile':'我的','/energy':'水电燃气','/energy/usage':'用量明细','/energy/deposit':'预存充值','/energy/deposit/confirm':'确认预存充值','/help':'服务说明'}

</script>
<template>
 <div class="app-shell">
  <router-view v-if="login"/>
  <template v-else>
   <header class="topbar" :class="{'root-bar':root}">
    <van-button plain class="back-button" aria-label="返回" @click="back" native-type="button"><van-icon name="arrow-left"/></van-button>
    <h1>{{titles[route.path]||(route.path.startsWith('/wallet/')?'收支明细':route.path.startsWith('/bills/')?'账单详情':'房屋服务')}}</h1>
   </header>
   <main>
    <router-view v-if="route.path==='/profile'"/>
    <LoadState v-else :loading="roomsState.loading" :error="roomsState.error" :empty="!roomsState.rooms.length" empty-text="当前账号暂无有效关联房屋，请联系物业" @retry="loadRooms">
     <router-view v-if="currentRoom" :key="route.path"/>
     <div v-else class="page"><RoomSwitcher/></div>
    </LoadState>
   </main>
   <nav v-if="root" class="bottom-nav" aria-label="主导航">
    <router-link to="/" :class="{active:route.path==='/'}"><van-icon name="home-o"/><span>房屋</span></router-link>
    <router-link to="/bills" :class="{active:route.path==='/bills'}"><van-icon name="bill-o"/><span>账单</span></router-link>
    <router-link to="/wallet" :class="{active:route.path==='/wallet'}"><van-icon name="balance-o"/><span>余额</span></router-link>
    <router-link to="/profile" :class="{active:route.path==='/profile'}"><van-icon name="user-o"/><span>我的</span></router-link>
   </nav>
   <RoomPicker/>
  </template>
 </div>
</template>
