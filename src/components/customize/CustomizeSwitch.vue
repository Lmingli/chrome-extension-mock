<template>
  <el-switch
    ref="switchRef"
    :value="switchValue"
    :disabled="disabled"
    :width="width"
    :active-text="text[0] || null"
    :inactive-text="text[1] || null"
    :active-icon-class="icon[0] || null"
    :inactive-icon-class="icon[0] || null"
    :active-value="!isEmpty(values[0]) ? values[0] : true"
    :inactive-value="!isEmpty(values[1]) ? values[1] : false"
    :active-color="color[0]"
    :inactive-color="color[1]"
    :name="name"
    :validate-event="validateEvent	|| true"
    @change="handleChange"
    :class="{
      [className]: !!className,
      'is-inside-type': type === 'inside' || mode === 'inside',
      'is-small-size': size === 'small',
      'is-mini-size': size === 'mini',
      'is-right-type': type === 'inside' || mode === 'right',
    }"
  ></el-switch>
</template>

<script setup>
import { toRef, onMounted, ref } from 'vue';
import { switchOpt as OPTIONS } from './DEFAULT_OPTIONS';

const props = defineProps({
  value: {
    type: [Number, String, Boolean],
    required: true,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  width: {
    type: Number,
    default: 40,
  },
  text: {
    type: Array,
    default: () => [],
  },
  icon: {
    type: Array,
    default: () => [],
  },
  values: {
    type: Array,
    default: () => [],
  },
  color: {
    type: Array,
    default: () => OPTIONS.defaultColor,
  },
  name: {
    type: String,
    default: '',
  },
  validateEvent: {
    type: Boolean,
    default: true,
  },
  className: {
    type: String,
    default: () => OPTIONS.className,
  },
  activeTextColor: String,
  type: {
    type: String,
    default: '',
  },
  mode: {
    type: String,
    default: '',
  },
  size: String,
});
const emits = defineEmits(['update:value', 'change']);

import { isEmpty } from './utils';

const switchValue = toRef(props, 'value');

const handleChange = (value) => {
  emits('update:value', value);
  emits('change', value);
}

const switchRef = ref();
onMounted(() => {
  try {
    Array.from(switchRef.value.$el.querySelectorAll('.el-switch__label')).map(n => {
      n.style.color = props.activeTextColor;
    })
  } catch (error) {
    console.log(error);
  }
})
</script>

<style lang='scss' scoped>
.el-switch.is-inside-type {
  .el-switch__label {
    position: absolute;
    visibility: hidden;
    width: 100%;
    white-space: nowrap;
    * {
      box-sizing: border-box;
      width: 100%;
      text-align: center;
    }
    &.el-switch__label--left {
      margin-right: 0;
      * {
        padding-left: 12px;
      }
    }
    &.el-switch__label--right {
      margin-left: 0;
      * {
        padding-right: 12px;
      }
    }
    &.is-active {
      z-index: 1;
      visibility: visible;
    }
  }

  &.is-small-size {
    .el-switch__label--left {
      * {
        padding-left: 10px;
      }
    }
    .el-switch__label--right {
      * {
        padding-right: 10px;
      }
    }
  }
  &.is-mini-size {
    .el-switch__label--left {
      * {
        padding-left: 8px;
      }
    }
    .el-switch__label--right {
      * {
        padding-right: 8px;
      }
    }
  }
}

.el-switch.is-small-size {
  height: 18px;
  line-height: 18px;
  font-size: 12px;
  &.is-checked .el-switch__core::after {
      margin-left: -15px;
  }
  .el-switch__core {
    height: 18px;
    &::after {
      width: 14px;
      height: 14px;
    }
  }
  .el-switch__label {
    height: 18px;
    * {
      font-size: 12px;
    }
  }
  .el-switch__label--left {
    margin-right: 4px;
  }
  .el-switch__label--right {
    margin-left: 4px;
  }
}

.el-switch.is-mini-size {
  height: 16px;
  line-height: 16px;
  font-size: 12px;
  &.is-checked .el-switch__core::after {
      margin-left: -13px;
  }
  .el-switch__core {
    height: 16px;
    &::after {
      width: 12px;
      height: 12px;
    }
  }
  .el-switch__label {
    height: 16px;
    * {
      font-size: 12px;
    }
  }
  .el-switch__label--left {
    margin-right: 2px;
  }
  .el-switch__label--right {
    margin-left: 2px;
  }
}

.el-switch.is-right-type {
  .el-switch__label--left, .el-switch__label--right {
    transition: none;
    visibility: hidden;
    &.is-active {
      visibility: visible;
    }
  }
  .el-switch__label--left {
    position: absolute;
    left: 50px;
    top: 2px;
    line-height: 17px;
    margin-right: 0;
    &.is-active {
      color: #303133;
    }
  }
}
</style>
