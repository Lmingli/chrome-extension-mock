<template>
  <div>
    <el-dialog
      v-model="visible"
      width="80%"
      top="10vh"
      :before-close="handleClose"
    >
      <div ref="editorRef" style="height: 60vh;margin-bottom: 20px;"></div>
      <template #footer>
        <div style="text-align: center;">
          <el-button type="primary" size="large" @click="handleSave">保存</el-button>
          <el-button type="danger" size="large" @click="handleCancel">取消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { nextTick, onMounted, ref, watch, watchEffect } from 'vue';
import JSONEditor from 'jsoneditor';
import 'jsoneditor/dist/jsoneditor.min.css';

const props = defineProps(["modelValue", "data"]);
const emits = defineEmits(["update:modelValue", "change"]);

const visible = ref(props.modelValue);
watchEffect(() => {
  visible.value = props.modelValue;
});

const editorRef = ref(null);
const editor = ref();
let text = JSON.parse(props.data);
onMounted(async() => {
  await nextTick();
  editor.value = new JSONEditor(editorRef.value, {
    mode: 'code',
    modes: ['code', 'tree'],
  }, text);
});
const handleSave = () => {
  emits("change", JSON.stringify(editor.value.get()));
  visible.value = false;
}
const handleCancel = () => {
  visible.value = false;
}

watch(visible, (newVal) => {
  emits("update:modelValue", newVal);
});

const handleClose = () => {
  emits("update:modelValue", false);
}
</script>

<style lang='scss' scoped>

</style>
