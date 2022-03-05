<template>
  <div>
    <el-dialog v-model="visible" width="80%" top="10vh" :before-close="handleClose">
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

<script setup lang="ts">
import { nextTick, onMounted, ref, watch, watchEffect } from 'vue';
import JSONEditor from 'jsoneditor';
import 'jsoneditor/dist/jsoneditor.min.css';
import { ElMessage } from 'element-plus';

const props = defineProps<{
  modelValue: boolean;
  data: string;
}>();
const emits = defineEmits<{
  (e: 'change', editorValue: string): void;
  (e: 'update:modelValue', visible: boolean): void;
}>();

const visible = ref(props.modelValue);
watchEffect(() => {
  visible.value = props.modelValue;
});

const editorRef = ref();
const editor = ref();

onMounted(async () => {
  let text = {};
  try {
    text = JSON.parse(props.data)
  } catch (error) {
    console.log(error);
    ElMessage.error('解析JSON失败');
    visible.value = false;
    return;
  }

  await nextTick();

  editor.value = new JSONEditor(editorRef.value, {
    mode: 'code',
    modes: ['code', 'tree'],
  }, text);
});
const handleSave = () => {
  try {
    emits("change", JSON.stringify(editor.value.get()));
    visible.value = false;
  } catch (error) {
    try {
      const text = editor.value.getText();
      const obj = eval(`(${text})`);
      editor.value.set(obj);
      ElMessage.success('整理格式成功');
    } catch (error) {
      console.log('123', error)
      ElMessage.error('JSON格式错误');
    }
  }
}
const handleCancel = () => {
  visible.value = false;
}

watch(visible, (newVal: boolean) => {
  emits("update:modelValue", newVal);
});

const handleClose = () => {
  emits("update:modelValue", false);
}
</script>

<style lang='scss' scoped>
</style>
