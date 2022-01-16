<template>
  <el-row :gutter="20">
    <el-col :span="5">
      <span>MOCK：</span>
      <el-switch v-model="setting.openMock" :disabled="setting.openSave && !setting.openMock" active-text="开启" @change="handleChange" />
    </el-col>
    <el-col :span="5">
      <span>保存请求：</span>
      <el-switch v-model="setting.openSave" :disabled="setting.openMock && !setting.openSave" active-text="开启" @change="handleChange" />
    </el-col>
    <el-col :span="6">
      <span>相同请求保存上限：</span>
      <el-input v-model="setting.limit" @change="handleChange"></el-input>
    </el-col>
    <el-col :span="8">
      <span>生效域名：</span>
      <el-input v-model="setting.filter" @change="handleChange"></el-input>
    </el-col>
  </el-row>
</template>

<script setup>
import { onMounted, reactive, ref, toRaw } from 'vue';
import { storage } from '@/utils/Chrome';
import { ElMessage } from 'element-plus';

const setting = reactive({
  openMock: false,
  openSave: false,
  limit: null,
  filter: '',
});

onMounted(async () => {
  try {
    const res = await storage.get();
    for (let n in res.setting) {
      setting[n] = res.setting[n];
    }
  } catch (error) {
    console.log(error)
  }
});

const handleChange = async() => {
  console.log('change', setting)
  try {
    await storage.set({
      setting: toRaw(setting),
    });
    ElMessage.success('设置成功');
  } catch (error) {
    console.log(error)
  }
}
</script>

<style lang='scss' scoped>
.el-col {
  display: flex;
  span {
    flex: none;
    line-height: 32px;
  }
  .el-input {
    flex: 1;
  }
}
</style>
