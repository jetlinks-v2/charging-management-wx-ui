<script setup lang="ts">
import { computed } from 'vue'
import SelectField from './mobile/SelectField.vue'
import { roomsState, selectRoom } from '../services/rooms'
import { nature } from '../services/format'
const roomKey = (room: { projectId: string; spaceId: string }) => `${room.projectId}:${room.spaceId}`
const selected = computed(() => roomsState.selected ? roomKey(roomsState.selected) : undefined)
const options = computed(() => roomsState.rooms.map(room => ({
  value: roomKey(room), label: `${room.projectName} / ${room.fullName || room.name}`, description: nature(room.nature),
})))
function confirm(value: string | undefined) {
  // Resolve the current authorized list again; never switch to a room removed while the sheet was open.
  const room = roomsState.rooms.find(room => roomKey(room) === value)
  if (room) selectRoom(room)
}
</script>
<template>
  <SelectField v-model:show="roomsState.choosing" :model-value="selected" :options="options" :loading="roomsState.loading" title="选择我的房屋" :closable="!!roomsState.selected" @update:model-value="confirm">
    <template #trigger><span hidden /></template>
  </SelectField>
</template>
