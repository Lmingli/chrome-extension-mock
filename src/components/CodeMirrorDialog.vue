<template>
    <el-dialog
      v-model="visible"
      width="80%"
      top="10vh"
      :before-close="() => emits('update:visible', false)"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      destroy-on-close
    >

      <div class="title">
        <div class="text">真实返回</div>
        <div class="text">已保存</div>
      </div>

      <div id="code-diff-box"></div>
  
      <template #footer>
        <el-button type="primary" size="large" @click="handleSave">保存</el-button>
        <el-button type="info" size="large" plain @click="emits('update:visible', false)">关闭</el-button>
      </template>
    </el-dialog>
</template>

console.log();
<script setup lang="ts">
import { onMounted, ref, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import CodeMirror from 'codemirror';
// import "codemirror/theme/neat.css"; //主题css
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/lint/json-lint';
import 'codemirror/addon/merge/merge.js';
import 'codemirror/addon/merge/merge.css';
import DiffMatchPatch from 'diff-match-patch'; //需要用该工具进行对比，必须引入 
window.diff_match_patch = DiffMatchPatch;
window.DIFF_DELETE = -1;
window.DIFF_INSERT = 1;
window.DIFF_EQUAL = 0;

const props = defineProps<{
  visible: boolean;
  compareMockData: string;
  compareRealData: string;
}>();
const emits = defineEmits<{
  (e: 'update:visible', value: boolean): any;
  (e: 'save', str: string): any;
}>();

onMounted(() => {
  init();
})

const editor = ref();

const init = async() => {
  await nextTick();

  let target = document.getElementById("code-diff-box");
  if (!target) {
    return;
  }
  target.innerHTML = "";
  editor.value = CodeMirror.MergeView(target, {
    value: props.compareMockData,
    origLeft: props.compareRealData,
    // orig: text2.value,
    lineNumbers: true,
    mode: 'application/json',
    connect: 'align',
    collapseIdentical: true,
    gutters: ['CodeMirror-lint-markers'],
  });
}


const handleSave = () => {
  let editValue = editor.value.edit.getValue();
  try {
    editValue = JSON.stringify(JSON.parse(editValue), null, 2);
    console.log(editValue);
    emits('save', editValue);
  } catch (error) {
    ElMessage.error('格式化JSON失败');
  }
}

</script>

<style lang='scss' scoped>
.title {
  display: flex;
  margin-bottom: 10px;
  .text {
    flex: 1;
    text-align: center;
    font-size: 18px;
  }
}
</style>
