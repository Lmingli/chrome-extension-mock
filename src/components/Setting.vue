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
  
  <el-drawer
    v-model="drawer"
    :before-close="handleClose"
    custom-class="drawer-setting-more"
  >
    <!-- <div style="margin-bottom: 20px;">
      <el-popconfirm title="确定进行此项操作？" @confirm="handleUpload">
        <template #reference>
          <el-button type="primary">同步至google账户</el-button>
        </template>
      </el-popconfirm>
      <el-popconfirm title="确定进行此项操作？" @confirm="handleDownload">
        <template #reference>
          <el-button type="primary">从google账户合并</el-button>
        </template>
      </el-popconfirm>
    </div> -->
    <customize-form
      :form="setting"
      v-model:loading="loading.settingMore"
      @submit="handleSubmitMore"
      :setting="settingMoreConf"
      :showResetButton="false"
      label-width="200px"
    >
      <template #removeRequestUrlParams="{ form }">
        <editable-list v-model="form.removeRequestUrlParams"></editable-list>
      </template>
      <template #removeRequestBodyParams="{ form }">
        <editable-list v-model="form.removeRequestBodyParams"></editable-list>
      </template>
      <template #listUrlRemoveStr="{ form }">
        <editable-list v-model="form.listUrlRemoveStr"></editable-list>
      </template>
      <template #filterUrl="{ form }">
        <editable-list v-model="form.filterUrl"></editable-list>
      </template>
    </customize-form>
    <div @click="dialogVisible = true;">{{ setting }}</div>
  </el-drawer>

  <response-text-dialog v-if="dialogVisible" v-model="dialogVisible" :data="JSON.stringify(setting)" @change="handleTextDialogChange"></response-text-dialog>
</template>

<script setup>
import { onMounted, reactive, ref, defineAsyncComponent } from 'vue';
import { storage } from '@/utils/Chrome';
import { ElMessage } from 'element-plus';

const setting = reactive({
  openSave: false,
  openMock: false,
  openUrl: '',
  limit: null,
  checkParams: true,
  checkBody: true,
  removeRequestUrlParams: [],
  removeRequestBodyParams: [],
  listUrlRemoveStr: [],
  filterUrl: [],
});


const getSettingData = async() => {
  try {
    const res = await storage.get();
    for (let n in res.setting) {
      setting[n] = res.setting[n];
    }
  } catch (error) {
    console.log(error)
  }
}
onMounted(() => {
  getSettingData();
  storage.onchange(getSettingData);
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
  { type: 'switch', prop: 'openMock', label: 'MOCK', values: [true, false] },
  { type: 'switch', prop: 'openSave', label: '保存请求', values: [true, false] },
  { type: 'input', prop: 'openUrl', label: '生效的请求域名', width: '140px' },
];
const loading = reactive({
  setting: false,
});


const drawer = ref(false);
const handleClose = (done) => {
  done();
}

const settingMoreConf = [
  ...settingConf,
  { type: 'input', prop: 'limit', label: '相同域名条数上限' },
  { type: 'switch', prop: 'checkParams', label: '检查请求链接参数', values: [true, false], text: ['开启', ''] },
  { type: 'switch', prop: 'checkBody', label: '检查请求体', values: [true, false], text: ['开启', ''] },
  // { type: 'select', prop: 'removeRequestUrlParams', label: '忽略请求链接参数', multiple: true, filterable: true, 'allow-create': true, enum: setting.removeRequestUrlParams, hideOptionAll: true },
  // { type: 'select', prop: 'removeRequestBodyParams', label: '忽略请求体参数', multiple: true, filterable: true, 'allow-create': true, enum: setting.removeRequestBodyParams, hideOptionAll: true },
  // { type: 'input', prop: 'listUrlRemoveStr', label: '列表中隐藏url中的字符' },
  { type: 'slotIn', slot: 'removeRequestUrlParams', label: '忽略请求链接参数' },
  { type: 'slotIn', slot: 'removeRequestBodyParams', label: '忽略请求体参数' },
  { type: 'slotIn', slot: 'listUrlRemoveStr', label: '列表中隐藏url中的字符' },
  { type: 'slotIn', slot: 'filterUrl', label: '过滤url中包含的请求' },
];

const handleSubmitMore = async (value) => {
  console.log('handleSettingMoreSubmit', value);
  const filterProps = ['filterUrl', 'removeRequestUrlParams', 'listUrlRemoveStr', 'removeRequestBodyParams'];
  for (let n of filterProps) {
    value[n] = value[n].filter(x => !!x);
  }

  try {
    await storage.set({
      setting: value,
    });
    ElMessage.success('设置成功');
  } catch (error) {
    console.log(error)
  } finally {
    loading.settingMore = false;
  }
}



const ResponseTextDialog = defineAsyncComponent(() => import('@/views/ResponseTextDialog.vue'));
const dialogVisible = ref(false);
const handleTextDialogChange = async(text) => {
  console.log(text)
  try {
    await storage.set({
      setting: JSON.parse(text),
    });
    ElMessage.success('保存成功');
  } catch (error) {
    console.log(error);
  }
}


// const handleUpload = async() => {
//   await storage.upload();
//   ElMessage.success('上传成功');
// }
// const handleDownload = async() => {
//   await storage.download();
//   ElMessage.success('下载成功');
// }
</script>

<style lang="scss">
.drawer-setting-more {
  width: 80% !important;
  max-width: 500px;
  .el-input {
    width: 100% !important;
  }
}
</style>
