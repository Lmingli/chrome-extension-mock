<template>
  <div class="inline-operate">
    <el-button v-if="showUncheck()" type="warning" @click="handleUnchek">取消已选择</el-button>
    <el-input :model-value="columnFilter" @input="emits('update:columnFilter', $event)" placeholder="过滤response"></el-input>
    <el-button type="primary" @click="drawer = true;">设置</el-button>
  </div>

  <el-drawer v-model="drawer" :before-close="handleClose" append-to-body custom-class="panel-table-column-drawer-setting">
    <div class="buttons">
      <el-button type="primary" size="large" @click="handleAdd">新增</el-button>
      <el-popconfirm title="是否确定删除？" @confirm="handleDelete">
        <template #reference>
          <el-button type="danger" size="large">删除</el-button>
        </template>
      </el-popconfirm>
      <el-popconfirm title="是否确定忽略该链接的请求并删除？" @confirm="handleIgnoreDelete" >
        <template #reference>
          <el-button type="danger" size="large">忽略该链接请求并删除</el-button>
        </template>
      </el-popconfirm>
    </div>

    <CustomizeForm
      :form="setting"
      @submit="handleSubmit"
      :setting="settingConf"
      :showResetButton="false"
      label-width="140px"
    >
      <template #removeRequestUrlParams="{ form }">
        <EditableList v-model="form.removeRequestUrlParams"></EditableList>
      </template>
      <template #removeRequestBodyParams="{ form }">
        <EditableList v-model="form.removeRequestBodyParams"></EditableList>
      </template>
    </CustomizeForm>
  </el-drawer>

</template>

<script setup lang="ts">
import { onMounted, reactive, ref, toRaw, toRefs } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { storage } from '@/utils/Chrome';
import { StorageItem, StorageItemData, StorageSetting } from '~/interfaces/common.interface';

interface Column {
  url: string;
  storageItem: StorageItem;
  count: number | string;
  size: number;
}

const props = defineProps<{
  url: string;
  storageItem: StorageItem;
  tableData: Column[];
  storageSetting: StorageSetting;
  columnFilter: string;
}>();
const emits = defineEmits<{
  (e: 'add', url: string): void;
  (e: 'update:columnFilter', value: string): void;
}>();

const { url, storageItem, tableData, storageSetting } = toRefs(props);


const showUncheck = () => storageItem.value.data.findIndex(n => n.active === true) > -1;

const handleUnchek = async() => {
  const cur = storageItem.value.data.find(n => n.active === true);
  if (cur) {
    cur.active = false;
  }
  await storage.set({
    [url.value]: toRaw(storageItem.value),
  });
}

const handleChangeTop = async(to: boolean) => {
  storageItem.value.top = to;
  await storage.set({
    [url.value]: toRaw(storageItem.value),
  });
}

const handleAdd = async() => {
  const tableItem = tableData.value.find(n => n.url === url.value);
  if (!tableItem) {
    return;
  }
  const last = tableItem.storageItem.data[tableItem.storageItem.data.length - 1];
  tableItem.storageItem.data.unshift({
    active: false,
    method: last.method,
    name: "",
    requestBody: "{}",
    requestParams: "{}",
    response: "{}",
    timestamp: Date.now(),
  })
  emits('add', url.value);
  drawer.value = false;
}

const handleDelete = async () => {
  await storage.remove(url.value);
  ElMessage.success('删除成功');
  tableData.value.splice(tableData.value.findIndex(n => n.url === url.value), 1);
  drawer.value = false;
}


const drawer = ref(false);
const setting: any = reactive({
  compare: false,
  top: false,
  limit: storageSetting.value.limit,
  checkParams: storageSetting.value.checkParams,
  checkBody: storageSetting.value.checkBody,
  removeRequestUrlParams: storageSetting.value.removeRequestUrlParams,
  removeRequestBodyParams: storageSetting.value.removeRequestBodyParams,
})
const setSetting = () => {
  for (const n in storageItem.value) {
    if (n in setting) {
      setting[n] = storageItem.value[n];
    }
  }
}
setSetting();
onMounted(() => {
  try {
    storage.onchange(setSetting);
  } catch (error) {
    console.log(error);
  }
})

const settingConf = [
  { type: 'switch', prop: 'compare', label: '对比下次请求', values: [true, false] },
  { type: 'switch', prop: 'top', label: '置顶', values: [true, false] },
  { type: 'input', prop: 'name', label: '名称' },
  { type: 'input', prop: 'limit', label: '相同域名条数上限' },
  { type: 'switch', prop: 'checkParams', label: '检查请求链接参数', values: [true, false], text: ['开启', ''] },
  { type: 'switch', prop: 'checkBody', label: '检查请求体', values: [true, false], text: ['开启', ''] },
  { type: 'slotIn', slot: 'removeRequestUrlParams', label: '忽略请求链接参数' },
  { type: 'slotIn', slot: 'removeRequestBodyParams', label: '忽略请求体参数' },
];
const handleClose = (done: any) => {
  done();
}
const handleSubmit = async(form: any) => {
  console.log(storageItem, form)
  if (form.compare) {
    if (!(storageSetting.value.openMock && storageSetting.value.openSave)) {
      await ElMessage.info('需同时开启MOCK和保存请求后，下次请求对比才会生效');
    }

    const cur: any = tableData.value.find(n => n.storageItem.compare);
    if (cur) {
      await storage.set({
        [cur.url]: {
          ...cur.storageItem,
          compare: false
        },
      })
      ElMessage.info('取消其它置顶');
    }
  }
  // return;
  await storage.set({
    [url.value]: {
      ...toRaw(storageItem.value),
      ...form,
    },
  });
  ElMessage.success('设置成功');
  drawer.value = false;
}

const handleIgnoreDelete = async() => {
  try {
    let setting: any = await storage.get('setting');
    setting.setting.filterUrl.push(url.value);
    await storage.set({
      setting: setting.setting,
    });
    handleDelete();
  } catch (error) {
    ElMessage.error('操作失败');
  }
}

</script>

<style lang="scss">
.panel-table-column-drawer-setting {
  width: 80% !important;
  max-width: 700px;
  z-index: 99;
  .el-input {
    width: 100% !important;
  }
}
</style>
<style lang="scss" scoped>
.inline-operate {
  text-align: right;
  & > :not(first-child) {
    margin-left: 8px;
  }
  .el-input {
    width: 120px;
  }
}
.buttons {
  margin-bottom: 20px;
  .el-button {
    margin-left: 20px;
  }
}
</style>
