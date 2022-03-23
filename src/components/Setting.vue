<template>
  <div style="padding-top: 6px;">
    <CustomizeForm
      :form="setting"
      v-model:loading="loading.setting"
      @submit="handleSubmit"
      :setting="settingConf"
      inline
      :showResetButton="false"
      class="form"
    >
      <template #button>
        <el-button type="success" @click="drawer = true;">更多设置</el-button>
      </template>
    </CustomizeForm>
  </div>

  <el-drawer v-model="drawer" :before-close="handleClose" custom-class="drawer-setting-more">
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
    </div>-->

    <div style="margin-bottom: 30px;">
      <el-button type="primary" size="large" style="margin-left: 20px" @click="handleDownload">保存配置文件</el-button>
      <el-upload action="" :show-file-list="false" accept=".json" :before-upload="handleUpload" style="display: inline-block;margin-left: 20px;">
        <el-button type="primary" size="large">上传配置文件</el-button>
      </el-upload>
    </div>

    <el-divider></el-divider>

    <CustomizeForm
      :form="setting"
      v-model:loading="loading.settingMore"
      @submit="handleSubmitMore"
      :setting="settingMoreConf"
      :showResetButton="false"
      label-width="200px"
    >
      <template #removeRequestUrlParams="{ form }">
        <EditableList v-model="form.removeRequestUrlParams"></EditableList>
      </template>
      <template #removeRequestBodyParams="{ form }">
        <EditableList v-model="form.removeRequestBodyParams"></EditableList>
      </template>
      <template #listUrlRemoveStr="{ form }">
        <EditableList v-model="form.listUrlRemoveStr"></EditableList>
      </template>
      <template #filterUrl="{ form }">
        <EditableList v-model="form.filterUrl"></EditableList>
      </template>
    </CustomizeForm>
    <div @click="dialogVisible = true;">{{ setting }}</div>
  </el-drawer>

  <ResponseTextDialog
    v-if="dialogVisible"
    v-model="dialogVisible"
    :data="JSON.stringify(setting)"
    @change="handleTextDialogChange"
  ></ResponseTextDialog>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, defineAsyncComponent } from 'vue';
import { storage } from '@/utils/Chrome';
import { ElMessage, ElMessageBox } from 'element-plus';
import { DefaultSetting } from '~/crx/DefaultSetting';
import { StorageSetting } from '~/interfaces/common.interface';
const ResponseTextDialog = defineAsyncComponent(() => import('@/components/ResponseTextDialog.vue'));

const setting = reactive<StorageSetting>(DefaultSetting());


const getSettingData = async () => {
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

const handleSubmit: any = async (value: StorageSetting) => {
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
  settingMore: false,
});


const drawer = ref(false);
const handleClose = (done: any) => {
  done();
}

const settingMoreConf = [
  ...settingConf,
  { type: 'input', prop: 'limit', label: '相同链接条数上限' },
  { type: 'switch', prop: 'checkParams', label: '检查请求链接参数', values: [true, false], text: ['开启', ''] },
  { type: 'switch', prop: 'checkBody', label: '检查请求体', values: [true, false], text: ['开启', ''] },
  { type: 'slotIn', slot: 'removeRequestUrlParams', label: '忽略请求链接参数' },
  { type: 'slotIn', slot: 'removeRequestBodyParams', label: '忽略请求体参数' },
  { type: 'slotIn', slot: 'listUrlRemoveStr', label: '列表中隐藏url中的字符' },
  { type: 'slotIn', slot: 'filterUrl', label: '过滤url中包含的请求' },
];

const handleSubmitMore: any = async (value: StorageSetting) => {
  console.log('handleSettingMoreSubmit', value);
  const filterProps = ['filterUrl', 'removeRequestUrlParams', 'listUrlRemoveStr', 'removeRequestBodyParams'];
  for (let n of filterProps) {
    value[n] = value[n].filter((x: string) => !!x);
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



const dialogVisible = ref(false);
const handleTextDialogChange = async (text: string) => {
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

<style lang="scss" scoped>
.form {
  :deep(.el-form-item) {
    margin-bottom: 8px;
  }
}
</style>
<style lang="scss">
.drawer-setting-more {
  width: 90% !important;
  max-width: 800px;
  .el-input {
    width: 100% !important;
  }
}
</style>
