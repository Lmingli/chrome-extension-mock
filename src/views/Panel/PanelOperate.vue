<template>
  <el-button type="primary" @click="emits('setStorage')">刷新</el-button>
  <el-button type="danger" @click="handleClear">全部清空</el-button>
  <el-input :model-value="searchString" @input="emits('update:searchString', $event)" placeholder="url过滤" clearable></el-input>
  <el-button type="warning" @click="handleResetActive">取消全部已选择</el-button>
  <el-button type="primary" @click="handleDownload">保存配置文件</el-button>
  <el-upload action="" :show-file-list="false" accept=".json" :before-upload="handleUpload" style="display: inline-block;">
    <el-button type="primary">上传配置文件</el-button>
  </el-upload>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { storage } from '@/utils/Chrome';
import { ElMessage, ElMessageBox } from 'element-plus';

const props = defineProps<{
  searchString: string;
}>();
const emits = defineEmits<{
  (e: 'setStorage'): void;
  (e: 'update:searchString', value: string): void;
}>();

const handleClear = async() => {
  try {
    await ElMessageBox.confirm(`是否确定清空？`, '提示');
    await storage.clear();
    ElMessage.success('清空成功');
    emits('setStorage');
  } catch (error) {
    console.log(error);
  }
}

const handleResetActive = async() => {
  try {
    await ElMessageBox.confirm(`取消全部已选择`, '提示');
    let storageAll = await storage.get();
    for (let n in storageAll) {
      const storageItemData = storageAll[n]?.data;
      if (storageItemData && storageItemData instanceof Array) {
        for (let x of storageItemData) {
          if (x.active === true) {
            x.active = false;
          }
        }
      }
    }
    await storage.set(storageAll);
    ElMessage.success('操作成功');
  } catch (error) {
    console.log(error);
  }
}

const handleDownload = async() => {
  await ElMessageBox.confirm('是否确定下载配置文件至本地', '提示');
  chrome?.runtime?.sendMessage({
    download: true,
  });
}
const handleUpload: any = (file: File) => {
  const reader = new FileReader();  
  reader.onload = async(event: any) => {  
    try {
      const obj = JSON.parse(event.target.result);
      try {
        console.log(obj);
        await ElMessageBox.confirm('是否确定覆盖当前配置文件？', '提示');
        console.log(storage.set)
        await storage.set(obj);
        ElMessage.success('上传成功');
      } catch (error) {}
    } catch (error) {
      ElMessage.error('上传失败');
    }
  }  
  reader.readAsText(file);  
  return false;
}


onMounted(() => {
  chrome?.runtime?.onMessage?.addListener((msg, sender, sendResponse) => {
    if (msg.downloadSuccess) {
      ElMessage.success('下载成功');
    }
  })
})

</script>

<style lang='scss' scoped>
.el-input {
  width: 120px;
}
.el-button, .el-input {
  margin-left: 12px;
}
</style>
