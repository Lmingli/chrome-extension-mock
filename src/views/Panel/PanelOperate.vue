<template>
  <el-button type="primary" @click="emits('setStorage')">刷新</el-button>
  <el-button type="danger" @click="handleClear">清空</el-button>
  <el-input :model-value="searchString" @input="emits('update:searchString', $event)" placeholder="url过滤" clearable></el-input>
  <el-button type="primary" @click="emits('update:filterLocationUrl', !filterLocationUrl)">{{ filterLocationUrl ? '取消' : '' }}筛选当前页面链接</el-button>
  <el-button type="warning" @click="handleResetActive">取消全部已选择</el-button>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { storage } from '@/utils/Chrome';
import { ElMessage, ElMessageBox } from 'element-plus';

const props = defineProps<{
  searchString: string;
  filterLocationUrl: boolean;
}>();
const emits = defineEmits<{
  (e: 'setStorage'): void;
  (e: 'update:searchString', value: string): void;
  (e: 'update:filterLocationUrl', value: boolean): void;
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

</script>

<style lang='scss' scoped>
.el-input {
  width: 120px;
}
.el-button, .el-input {
  margin-left: 12px;
}
</style>
