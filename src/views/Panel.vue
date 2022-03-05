<template>
  <el-container style="height: 100%;">
    <el-header height="auto">
      <setting></setting>
    </el-header>

    <el-main>
      <el-button type="primary" @click="setData">刷新</el-button>
      <el-button type="danger" @click="handleClear">全部清空</el-button>
      <el-input v-model="searchString" placeholder="url过滤" style="margin-left: 12px;width: 140px;" clearable></el-input>
      <el-button type="warning" style="margin-left: 12px;" @click="handleResetActive">取消全部已选择</el-button>
      <el-button type="primary" style="margin-left: 12px;" @click="handleDownload">保存配置文件</el-button>
      <el-upload action="" :show-file-list="false" accept=".json" :before-upload="handleUpload" style="margin-left: 12px;display: inline-block;">
        <el-button type="primary">上传配置文件</el-button>
      </el-upload>

      <customize-table
        :data="tableData.filter(n => n.key.includes(searchString))"
        :column="tableColumn"
        style="margin-top: 10px;"
        row-key="key"
        :expand-row-keys="expandRowKeys"
        @row-click="handleRowClick"
        @expand-change="handleExpandChange"
        :row-style="rowStyle"
        :stripe="false"
      >
        <template #expand>
          <el-table-column type="expand" align="center">
            <template #default="{ row }">

              <customize-table
                v-if="(row.value instanceof Array)"
                :data="row.value"
                :column="expandColumn"
                :show-header="false"
                class="table-inside"
                @row-click="(a: any, b: any) => handleExpandRowClick(a, b, row)"
              >
                <template #before>
                  <el-table-column align="center" width="90px">
                    <template #default="{ row: expandRow }">
                      <el-button v-if="expandRow.active" type="success" @click="handleCancelActive(row)">当前</el-button>
                      <el-button v-else @click="handleChooseActive(row, expandRow)">选择</el-button>
                    </template>
                  </el-table-column>
                </template>
                <template #after>
                  <el-table-column align="center" width="104px">
                    <template #default="{ row: expandRow }">
                      <el-input v-model="expandRow.name" placeholder="输入名称"></el-input>                    
                    </template>
                  </el-table-column>
                  <el-table-column align="center" width="220px">
                    <template #default="{ row: expandRow }">
                      <el-button type="primary" @click="handleExpandName(row, expandRow)">{{ expandRow.name ? '修改' : '设置' }}名称</el-button>
                      <el-button type="danger" @click="handleExpandDelete(row, expandRow)">删除</el-button>
                    </template>
                  </el-table-column>
                </template>
              </customize-table>

            </template>
          </el-table-column>
        </template>

        <template #url>
          <el-table-column label="url" prop="key" min-width="200px">
            <template #default="{ row }">
              <el-tooltip effect="dark" :content="row.key" placement="top">{{ tableUrlFormatter(row.key) }}</el-tooltip>
            </template>
          </el-table-column>
        </template>

        <template #after>
          <el-table-column label="操作" align="center" prop="operate" width="340px">
            <template #default="{ row }">
              <el-button v-if="showUncheck(row)" type="warning" @click="handleUnchek(row)">取消已选择</el-button>
              <el-button type="primary" @click="handleAdd(row)">新增</el-button>
              <el-popconfirm title="是否确定删除？" @confirm="handleDelete(row)">
                <template #reference>
                  <el-button type="danger">删除</el-button>
                </template>
              </el-popconfirm>
            </template>
          </el-table-column>
        </template>
      </customize-table>
    </el-main>
  </el-container>

  <ResponseTextDialog v-if="dialogVisible" v-model="dialogVisible" :data="responseText" @change="handleTextDialogChange"></ResponseTextDialog>
</template>

<script setup lang="ts">
import { onMounted, ref, toRaw, shallowRef, defineAsyncComponent, reactive } from 'vue';
import { storage } from '@/utils/Chrome';
import { ElMessage, ElMessageBox } from 'element-plus';
import { DefaultSetting } from '~/crx/DefaultSetting';
import { StorageItemData, StorageSetting } from '~/interfaces/common.interface';

interface Column {
  key: string;
  value: StorageItemData[];
  count: number;
  size: number;
}

const settingData = ref<StorageSetting>(DefaultSetting);

const tableData = shallowRef<Column[]>([]);
const tableColumn = [
  { slot: 'expand' },
  { slot: 'url' },
  { label: 'count', prop: 'count' },
  { label: 'size', prop: 'size' },
];
const tableUrlFormatter = (cellValue: string) => {
  let value = cellValue;
  for (let n of settingData.value.listUrlRemoveStr) {
    value = value.replace(n, '');
  }
  return value;
}

const setData = async() => {
  try {
    const data = await storage.get();
    let tmp: Column[] = [];
    for (let n in data) {
      if (n === 'setting') {
        settingData.value = <StorageSetting>data[n];
        continue;
      };
      if (n === 'tmp') {
        continue;
      }
      tmp.push({
        key: n,
        value: data[n],
        count: data[n] instanceof Array ? data[n].length : JSON.stringify(data[n]),
        size: JSON.stringify(data[n]).length,
      });
    }
    tableData.value = tmp;
  } catch (error) {
    console.log(error)
  }
}
onMounted(() => {
  try {
    setData();
    storage.onchange(setData);
  } catch (error) {
    console.log(error);
  }
})

const expandColumn = [
  { label: 'method', prop: 'method', width: '70px' },
  { label: 'requestParams', prop: 'requestParams', 'show-overflow-tooltip': true },
  { label: 'requestBody', prop: 'requestBody', 'show-overflow-tooltip': true },
  { label: 'response', prop: 'response', 'show-overflow-tooltip': true, minWidth: '100px' },
];



const handleDelete = async ({ key }: Column) => {
  await storage.remove(key);
  ElMessage.success('删除成功');
  tableData.value.splice(tableData.value.findIndex(n => n.key === key), 1);
}
const showUncheck = ({ value }: Column) => value.findIndex(n => n.active === true) > -1;
const handleUnchek = async({ key, value }: Column) => {
  const cur = value.find(n => n.active === true);
  if (cur) {
    cur.active = false;
  }
  await storage.set({
    [key]: toRaw(value),
  });
}

const handleAdd = ({ key }: Column) => {
  const data = tableData.value.find(n => n.key === key);
  if (!data) {
    return;
  }
  const last = data.value[data.value.length - 1];
  data.value.push({
    active: false,
    method: last.method,
    name: "",
    requestBody: "{}",
    requestParams: "{}",
    response: "{}",
    timestamp: Date.now(),
  })
  if (expandRowKeys.value.includes(key)) {
    expandRowKeys.value.splice(expandRowKeys.value.indexOf(key), 1);
  }
  expandRowKeys.value.push(key);
}


const handleClear = async() => {
  try {
    await ElMessageBox.confirm(`是否确定清空？`, '提示');
    await storage.clear();
    ElMessage.success('清空成功');
    setData();
  } catch (error) {
    console.log(error);
  }
}
const handleResetActive = async() => {
  try {
    await ElMessageBox.confirm(`取消全部已选择`, '提示');
    let data = await storage.get();
    for (let n in data) {
      if (data[n] && data[n] instanceof Array) {
        for (let x of data[n]) {
          if (x.active === true) {
            x.active = false;
          }
        }
      }
    }
    await storage.set(data);
    ElMessage.success('操作成功');
  } catch (error) {
    console.log(error);
  }
}


const searchString = ref('');


const expandRowKeys = ref<string[]>([]);
const handleExpandChange = (_row: any, expanded: Column[]) => {
  expandRowKeys.value = expanded.map(n => n.key);
}
const handleRowClick = ({ key, value }: Column, column: any) => {
  if (!(value instanceof Array)) {
    return;
  }
  if (['key', 'operate'].includes(column.property)) {
    return;
  }
  if (expandRowKeys.value.includes(key)) {
    expandRowKeys.value.splice(expandRowKeys.value.indexOf(key), 1);
  } else {
    expandRowKeys.value.push(key);
  }
}
const rowStyle = ({ row, rowIndex }: any) => {
  return {
    'background-color': rowIndex % 2 === 0 ? 'rgb(236, 245, 255)' : 'rgb(245, 254, 240)',
  }
}




const handleCancelActive = async(row: Column) => {
  let newVal = row.value;
  for (let n of newVal) {
    n.active = false;
  }
  await storage.set({
    [row.key]: toRaw(newVal),
  });
  ElMessage.success('设置成功');
}
const handleChooseActive = async(row: Column, expandRow: StorageItemData) => {
  let newVal = row.value;
  for (let n of newVal) {
    n.active = false;
  }
  let cur = newVal.find(n => n.timestamp === expandRow.timestamp);
  if (cur) {
    cur.active = true;
  }
  console.log(toRaw(newVal))
  await storage.set({
    [row.key]: toRaw(newVal),
  });
  ElMessage.success('设置成功');
}
const handleExpandDelete = async(row: Column, expandRow: StorageItemData) => {
  let newVal = row.value;
  const idx = newVal.findIndex(n => n.timestamp === expandRow.timestamp);
  newVal.splice(idx, 1);
  await storage.set({
    [row.key]: toRaw(newVal),
  });
  ElMessage.success('删除成功');
}
const handleExpandName = async(row: Column, expandRow: StorageItemData) => {
  let newVal = row.value;
  let cur = newVal.find(n => n.timestamp === expandRow.timestamp);
  if (cur) {
    cur.name = expandRow.name;
  }
  await storage.set({
    [row.key]: toRaw(newVal),
  });
  ElMessage.success('设置成功');
}



const ResponseTextDialog = defineAsyncComponent(() => import('./ResponseTextDialog.vue'));
const dialogVisible = ref(false);
const responseText = ref();
const dialogInfo = reactive<any>({
  timestamp: 0,
  row: {},
  property: '',
});
// 点击response
const handleExpandRowClick = function(a: StorageItemData, b: any, row: Column) {
  if (['requestParams', 'requestBody', 'response'].includes(b.property)) {
    responseText.value = a[b.property];
    dialogVisible.value = true;
    dialogInfo.timestamp = a.timestamp;
    dialogInfo.row = row;
    dialogInfo.property = b.property;
  }
}
const handleTextDialogChange = async(text: string) => {
  console.log(text)
  let newVal: StorageItemData[] = dialogInfo.row.value
  let cur = newVal.find((n) => n.timestamp === dialogInfo.timestamp);
  if (cur) {
    cur[dialogInfo.property] = text;
  }
  await storage.set({
    [dialogInfo.row.key]: toRaw(newVal),
  });
  ElMessage.success('保存成功');
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
.table-inside {
  padding-left: 20px;
  margin-top: -10px;
  & :deep(.el-table__inner-wrapper) {
    border: 1px solid #DCDFE6;
    border-top: none;
  }
}
</style>
