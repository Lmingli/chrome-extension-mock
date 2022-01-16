<template>
  <div
    v-if="visible"
    :class="{
      [className]: !!className,
      'customize-dialog-center': center,
    }"
  >
    <el-dialog
      :title="computedTitle"
      :top="top || '15vh'"
      :width="width || '600px'"
      v-model="visible"
      @close="handleClosed"
      ref="dialogRef"
    >
      <customize-form
        ref="formRef"
        @submit="handleFormSubmit"
        v-bind="{ ...props, ...attrs }"
        hideOptionAll
      >
        <template v-if="!!closeButtonShow" #button>
          <el-button @click="visible = false">{{ closeButtonName }}</el-button>
        </template>
      </customize-form>
    </el-dialog>
  </div>
</template>

<script setup>
import { useAttrs, computed, ref, nextTick, watchEffect, watch } from 'vue';
import { dialogForm as OPTIONS } from './DEFAULT_OPTIONS';
import { isEmpty } from './utils';

const props = defineProps({
  visible: Boolean,
  top: String,
  width: String,
  setting: Array,
  form: {
    default: () => OPTIONS.form,
  },
  title: [String, Array],
  size: {
    type: String,
    default: () => OPTIONS.size,
  },
  closeButtonShow: {
    type: [Boolean, String],
    default: () => OPTIONS.closeButtonShow,
  },
  closeButtonName: {
    type: String,
    default: () => OPTIONS.closeButtonName,
  },
  className: {
    type: String,
    default: () => OPTIONS.className,
  },
  center: Boolean,
});
const emits = defineEmits(['update:visible', 'submit']);
const attrs = useAttrs();

const visible = ref(props.visible);

const computedTitle = computed(() => {
  if (props.title instanceof Array) {
    return !isEmpty(props.form) ? props.title[1] : props.title[0];
  }
  return props.title || '';
})

watchEffect(() => {
  visible.value = props.visible;
})
watch(visible, (newVal) => {
  emits('update:visible', newVal);
})

const formRef = ref();
const handleClosed = async () => {
  await nextTick();
  formRef.value.reset();
}

const handleFormSubmit = (form) => {
  visible.value = false;
  emits('submit', form);
}
</script>

<style lang='scss' scoped>
.customize-dialog-center {
  :deep(.el-dialog) {
    margin-top: 0 !important;
    top: 50%;
    transform: translateY(-50%);
  }
}
</style>
