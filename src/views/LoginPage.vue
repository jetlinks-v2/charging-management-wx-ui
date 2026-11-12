<script setup lang="ts">
import MobileNotice from '../components/mobile/MobileNotice.vue'
import BusinessField from '../components/mobile/BusinessField.vue'
import BusinessForm from '../components/mobile/BusinessForm.vue'
import {Button as VanButton} from 'vant'
import {Field as VanField} from 'vant'
import {reactive} from 'vue'
import {useSession} from '../hooks/useSession'
import LoginVerification from '../components/LoginVerification.vue'
const vm=reactive(useSession())
</script>
<template><section class="login-page"><div class="login-brand"><h1>我的房屋</h1></div><section class="login-form"><h2>应用登录</h2><MobileNotice v-if="vm.error" :message="vm.error" type="error"/><BusinessForm :model="vm.form" @submit="vm.login"><BusinessField label="应用账号" name="username" :rules="[{required:true,whitespace:true,message:'请输入应用账号'}]"><van-field v-model="vm.form.username" autocomplete="username" :disabled="vm.loading"/></BusinessField><BusinessField label="密码" name="password" :rules="[{required:true,message:'请输入密码'}]"><van-field v-model="vm.form.password" type="password" autocomplete="current-password" :disabled="vm.loading"/></BusinessField><van-button type="primary" native-type="submit" block :loading="vm.loading">登录</van-button></BusinessForm><LoginVerification v-if="vm.verification" :requirement="vm.verification" @success="vm.completeVerification" @cancel="vm.cancelVerification"/></section></section></template>
