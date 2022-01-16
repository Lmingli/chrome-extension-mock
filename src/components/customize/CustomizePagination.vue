<template>
  <el-pagination
    v-model:current-page="page.current"
    v-model:page-size="page.size"
    :total="total"
    :page-sizes="pageSizes"
    background
    :layout="layout"
    @current-change="handleCurrentChange"
    @size-change="handleSizeChange"
    :style="`text-align: ${align};`"
    :class="className"
  ></el-pagination>
</template>

<script setup>
import { reactive } from 'vue';

import { pagination as OPTIONS } from './DEFAULT_OPTIONS';
const props = defineProps({
  pageSizes: {
    type: Array,
    default: () => OPTIONS.pageSizes,
  },
  layout: {
    type: String,
    default: () => OPTIONS.layout,
  },
  current: {
    type: [Number, String],
    default: 1,
  },
  size: {
    type: [Number, String],
    default: () => OPTIONS.pageSize,
  },
  total: {
    type: [Number, String],
    default: 0,
  },
  align: {
    type: String,
    default: () => OPTIONS.align,
  },
  className: {
    type: String,
    default: () => OPTIONS.className,
  }
})
const emits = defineEmits(['update:current', 'update:size', 'change']);

const page = reactive({
  current: props.current,
  size: props.size,
});
const handleSizeChange = () => {
  page.current = 1;
  emits('update:current', 1);
  emits('update:size', page.size);
  emits('change');
}
const handleCurrentChange = () => {
  emits('update:current', page.current);
  emits('change');
}

</script>
