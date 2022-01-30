<template>
  <div class="list">
    <div v-for="(item, index) of data" class="item">
      <el-button type="danger" circle :icon="Delete" size="small" @click="handleDelete(index)"></el-button>

      <el-button v-if="active === index" type="success" circle :icon="Check" size="small" @click="active = null;"></el-button>
      <el-button v-else type="primary" circle :icon="Edit" size="small" @click="active = index;"></el-button>

      <div class="text">
        <el-input v-if="active === index" :model-value="item" @input="handleChange($event, index)"></el-input>
        <div v-else>{{ item }}</div>
      </div>
    </div>
    <div class="item">
      <el-button type="success" circle :icon="Plus" size="small" @click="handleAdd"></el-button>
    </div>
  </div>

</template>

<script setup>
import { ref, toRef } from 'vue';

import { Delete, Edit, Check, Plus } from '@element-plus/icons-vue';

const props = defineProps(['modelValue']);
const emits = defineEmits('update:modelValue');

const data = toRef(props, 'modelValue');

const active = ref(null);

const tableColumn = [
  { label: '', prop: 'value' },
];

const handleChange = (val, index) => {
  data.value[index] = val;
}
const handleDelete = (index) => {
  data.value.splice(index, 1);
}
const handleAdd = () => {
  data.value.push('');
  active.value = data.value.length - 1;
}

</script>

<style lang='scss' scoped>
.list {
  padding-right: 20px;
  width: 100%;
  .item {
    display: flex;
    flex-flow: row nowrap;
    padding-left: 6px;
    align-items: center;
    border-bottom: 1px solid #DCDFE6;
    &:last-child {
      border-bottom: 0;
    }
    .text {
      flex: 1;
      padding-left: 4px;
      word-break: break-all;
    }
    .el-button {
      flex: none;
      margin: 4px 6px 4px 0;
    }
  }
}
</style>
