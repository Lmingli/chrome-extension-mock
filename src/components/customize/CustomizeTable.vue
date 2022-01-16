<template>
  <el-table
    :data="data"
    style="width: 100%"
    v-bind="{ ...attrs, ...props }"
    v-on="handleAllEvents"
    ref="tableRef"
    :class="className"
  >
    <template v-if="slots.empty" #empty>
      <slot name="empty"></slot>
    </template>

    <slot name="before"></slot>

    <el-table-column v-if="type === 'index'" type="index" label="序号" width="80" :align="align"></el-table-column>

    <template v-for="(item, index) of column">
      <el-table-column v-if="item.type === 'index'" type="index" :index="item.index || null" :label="item.label || '序号'" :width="item.width || '80'" :align="item.align || align"></el-table-column>

      <slot v-else-if="item.slot" :name="item.slot"></slot>
      
      <el-table-column
        v-else
        :key="item.prop + index"
        :align="align"
        v-bind="item"
      >
        <template v-if="item.header" #header>
          <span style="margin-right: 5px;">{{ item.label }}</span>
          <el-tooltip v-bind="item.header.tooltip" :content="item.header.content">
            <i 
              :class="item.header.icon || 'el-icon-info'" 
              :style="{
                fontSize: '16px',
                verticalAlign: 'middle',
                cursor: 'pointer',
                ...item.header.iconStyle,
              }"
            ></i>
          </el-tooltip>
        </template>
      </el-table-column>
      
    </template>

    <slot name="after"></slot>
  </el-table>
</template>

<script setup>
import { useAttrs, useSlots } from 'vue';
import { table as OPTIONS } from './DEFAULT_OPTIONS';

const props = defineProps({
  data: {
    type: Array,
    required: true,
  },
  column: Array,
  type: String,
  size: {
    type: String,
    default: () => OPTIONS.size,
  },
  headerCellStyle: {
    type: [Object, Function],
    default: () => {
      return ({ row, column, rowIndex, columnIndex }) => {
        if (rowIndex == 0) {
          return OPTIONS.headerCellStyle;
        } else {
          return "";
        }
      }
    }
  },
  cellStyle: {
    type: [Object, Function],
    default: () => OPTIONS.cellStyle,
  },
  sortable: {
    type: [String, Boolean],
    default: false,
  },
  stripe: {
    type: Boolean,
    default: () => OPTIONS.stripe,
  },
  border: {
    type: Boolean,
    default: () => OPTIONS.border,
  },
  className: {
    type: String,
    default: () => OPTIONS.className,
  },
  maxHeight: {
    type: [String, Number],
    default: null,
  },
  align: {
    type: String,
    default: () => OPTIONS.align,
  },
});
const attrs = useAttrs();
const slots = useSlots();
const emits = defineEmits();

const allEvents = ['select', 'select-all', 'selection-change', 'cell-mouse-enter', 'cell-mouse-leave', 'cell-click', 'cell-dblclick', 'cell-contextmenu', 'row-click', 'row-contextmenu', 'row-dblclick', 'header-click', 'header-contextmenu', 'sort-change', 'filter-change', 'current-change', 'header-dragend', 'expand-change'];
const handleAllEvents = allEvents.reduce((prev, cur) => {
  prev[cur] = (...args) => {
    emits(cur, ...args);
  };
  return prev;
}, {});
</script>
