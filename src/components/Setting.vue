<template>
  <div style="padding-top: 14px;">
    <customize-form
      :form="setting"
      v-model:loading="loading.setting"
      @submit="handleSubmit"
      :setting="settingConf"
      inline
      :showResetButton="false"
    >
      <template #button>
        <el-button type="success" @click="drawer = true;">更多设置</el-button>
      </template>
    </customize-form>
  </div>
  
  <!-- <el-row :gutter="20">
    <el-col :span="6">
      <span>MOCK：</span>
      <el-switch v-model="setting.openMock" :disabled="setting.openSave && !setting.openMock" active-text="开启" @change="handleChange" />
    </el-col>
    <el-col :span="6">
      <span>保存请求：</span>
      <el-switch v-model="setting.openSave" :disabled="setting.openMock && !setting.openSave" active-text="开启" @change="handleChange" />
    </el-col>
    <el-col :span="12">
      <span>生效域名：</span>
      <el-input v-model="setting.filter" @change="handleChange"></el-input>
    </el-col>
  </el-row> -->
  

  <el-drawer
    v-model="drawer"
    :before-close="handleClose"
  >
    <span>Hi, there!</span>
  </el-drawer>
</template>

<script setup>
import { onMounted, reactive, ref, toRaw } from 'vue';
import { storage } from '@/utils/Chrome';
import { ElMessage } from 'element-plus';

const setting = reactive({
  openMock: false,
  openSave: false,
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

const handleSubmit = async(value) => {
  console.log('change', value)
  try {
    await storage.set({
      setting: value,
    });
    ElMessage.success('设置成功');
  } catch (error) {
    console.log(error)
  } finally {
    loading.setting = false;
  }
}


const settingConf = [
  { type: 'switch', prop: 'openMock', label: 'MOCK', values: [true, false], text: ['开启', ''] },
  { type: 'switch', prop: 'openSave', label: '保存请求', values: [true, false], text: ['开启', ''] },
  { type: 'input', prop: 'filter', label: '生效域名' },
];
const loading = reactive({
  setting: false,
});


const drawer = ref(false);
const handleClose = () => {

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
