<script setup lang="ts">
import {computed,inject,ref} from 'vue'
import {Button as VanButton,Icon as VanIcon,Picker as VanPicker,Popup as VanPopup} from 'vant'
import type {PickerConfirmEventParams} from 'vant'
import {monthChoices} from '../services/energy'
const props=defineProps<{modelValue:string}>()
const emit=defineEmits<{'update:modelValue':[value:string]}>()
const popupTarget=inject('business-popup-target',ref<HTMLElement|string>('body'))
const open=ref(false),draft=ref<string[]>([])
const columns=computed(()=>monthChoices().map(value=>({text:value.replace('-','年')+'月',value})))
function begin(){draft.value=[props.modelValue];open.value=true}
function confirm({selectedValues}:PickerConfirmEventParams){
 const value=String(selectedValues[0]||'')
 if(columns.value.some(option=>option.value===value))emit('update:modelValue',value)
 open.value=false
}
</script>
<template><van-button class="month-picker-trigger" plain size="small" aria-label="选择用量月份" aria-haspopup="dialog" :aria-expanded="open" @click="begin">{{modelValue}} <van-icon name="arrow-down"/></van-button>
 <van-popup v-model:show="open" position="bottom" round :teleport="popupTarget" safe-area-inset-bottom><van-picker v-if="open" v-model="draft" title="选择月份" :columns="columns" @cancel="open=false" @confirm="confirm"/></van-popup>
</template>
<style scoped>.month-picker-trigger { min-height:40px; padding:0 12px; color:var(--ink); border-color:var(--line); border-radius:9px; font-size:14px; } .month-picker-trigger .van-icon { margin-left:6px; font-size:12px; }</style>
