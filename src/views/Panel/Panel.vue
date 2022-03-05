<template>
  <el-container style="height: 100%;">
    <el-header height="auto">
      <Setting></Setting>
    </el-header>

    <el-main>
      <PanelOperate @setStorage="setStorage" v-model:searchString="searchString" />

      <customize-table
        :data="tableData.filter(n => n.url.includes(searchString))"
        :column="tableColumn"
        style="margin-top: 10px;"
        :expand-row-keys="expandRowKeys"
        row-key="url"
        @row-click="handleRowClick"
        @expand-change="handleExpandChange"
        :row-style="rowStyle"
        :stripe="false"
      >
        <template #expand>
          <el-table-column type="expand" align="center">
            <template #default="{ row }">

              <customize-table
                v-if="(row.storageItem.data instanceof Array)"
                :data="row.storageItem.data"
                :column="expandColumn"
                :show-header="false"
                class="table-inside"
                @row-click="(a: any, b: any) => handleExpandRowClick(a, b, row)"
                max-height="300px"
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
          <el-table-column label="url" prop="url" min-width="200px">
            <template #default="{ row }">
              <el-tag v-if="row.storageItem.top" type="danger" effect="dark" style="margin-right: 5px;cursor: pointer;" @click="handleCancelTop(row)">置顶</el-tag>
              <el-tooltip effect="dark" :content="row.url" placement="top">{{ row.storageItem.name ?? tableUrlFormatter(row.url) }}</el-tooltip>
            </template>
          </el-table-column>
        </template>

        <template #after>
          <el-table-column label="操作" align="center" prop="operate" width="400px">
            <template #default="{ row }">
              <TableOperate :url="row.url" :storageItem="row.storageItem" :tableData="tableData" :storageSetting="storageSetting" @add="handleAdd" />
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
import { StorageItem, StorageItemData, StorageSetting } from '~/interfaces/common.interface';
import PanelOperate from './PanelOperate.vue';
import TableOperate from './TableOperate.vue';
const ResponseTextDialog = defineAsyncComponent(() => import('@/components/ResponseTextDialog.vue'));

interface Column {
  url: string;
  storageItem: StorageItem;
  count: number | string;
  size: number;
}

const storageSetting = ref<StorageSetting>(DefaultSetting());
const searchString = ref('');

const tableData = shallowRef<Column[]>([]);
const tableColumn = [
  { slot: 'expand' },
  { slot: 'url' },
  { label: 'count', prop: 'count' },
  { label: 'size', prop: 'size' },
];
const tableUrlFormatter = (cellValue: string) => {
  let value = cellValue;
  for (let n of storageSetting.value.listUrlRemoveStr) {
    value = value.replace(n, '');
  }
  return value;
}

const setStorage = async() => {
  try {
    const data = await storage.get();
    let tmp: Column[] = [];
    for (const n in data) {
      if (n === 'setting') {
        storageSetting.value = <StorageSetting>data[n];
        continue;
      };
      if (n === 'tmp') {
        continue;
      }
      const storageItem: StorageItem = data[n];
      tmp.push({
        url: n,
        storageItem: storageItem,
        count: storageItem?.data instanceof Array ? storageItem.data.length : JSON.stringify(storageItem),
        size: JSON.stringify(storageItem).length,
      });
    }
    tmp = tmp.sort((a,b) => !a.storageItem.top && b.storageItem.top ? b.storageItem.timestamp - a.storageItem.timestamp : -1);
    tableData.value = tmp;
  } catch (error) {
    console.log(error)
  }
}
onMounted(() => {
  try {
    setStorage();
    storage.onchange(setStorage);
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



const handleCancelTop = async({ url, storageItem }: Column) => {
  storageItem.top = false;
  await storage.set({
    [url]: toRaw(storageItem),
  });
}

const handleAdd = (url: string) => {
  if (expandRowKeys.value.includes(url)) {
    expandRowKeys.value.splice(expandRowKeys.value.indexOf(url), 1);
  }
  expandRowKeys.value.push(url);
}


const expandRowKeys = ref<string[]>([]);
const handleExpandChange = (_row: any, expanded: Column[]) => {
  expandRowKeys.value = expanded.map(n => n.url);
}
const handleRowClick = ({ url, storageItem }: Column, column: any) => {
  if (!(storageItem.data instanceof Array)) {
    return;
  }
  if (!column || ['url', 'operate'].includes(column.property)) {
    return;
  }
  if (expandRowKeys.value.includes(url)) {
    expandRowKeys.value.splice(expandRowKeys.value.indexOf(url), 1);
  } else {
    expandRowKeys.value.push(url);
  }
}
const rowStyle = ({ row, rowIndex }: any) => {
  return {
    'background-color': rowIndex % 2 === 0 ? 'rgb(236, 245, 255)' : 'rgb(245, 254, 240)',
  }
}




const handleCancelActive = async(row: Column) => {
  let newVal = row.storageItem;
  for (let n of newVal.data) {
    n.active = false;
  }
  await storage.set({
    [row.url]: toRaw(newVal),
  });
  ElMessage.success('设置成功');
}
const handleChooseActive = async(row: Column, expandRow: StorageItemData) => {
  let newVal = row.storageItem;
  for (let n of newVal.data) {
    n.active = false;
  }
  let cur = newVal.data.find(n => n.timestamp === expandRow.timestamp);
  if (cur) {
    cur.active = true;
  }
  console.log(toRaw(newVal))
  await storage.set({
    [row.url]: toRaw(newVal),
  });
  ElMessage.success('设置成功');
}
const handleExpandDelete = async(row: Column, expandRow: StorageItemData) => {
  let newVal = row.storageItem;
  const idx = newVal.data.findIndex(n => n.timestamp === expandRow.timestamp);
  newVal.data.splice(idx, 1);
  await storage.set({
    [row.url]: toRaw(newVal),
  });
  ElMessage.success('删除成功');
}
const handleExpandName = async(row: Column, expandRow: StorageItemData) => {
  let newVal = row.storageItem;
  let cur = newVal.data.find(n => n.timestamp === expandRow.timestamp);
  if (cur) {
    cur.name = expandRow.name;
  }
  await storage.set({
    [row.url]: toRaw(newVal),
  });
  ElMessage.success('设置成功');
}



const dialogVisible = ref(false);
const responseText = ref();
const dialogInfo = reactive<any>({
  timestamp: 0,
  row: {},
  property: '',
});
// 点击response
const handleExpandRowClick = function(a: StorageItemData, b: any, row: Column) {
  if (!!b && ['requestParams', 'requestBody', 'response'].includes(b.property)) {
    responseText.value = a[b.property];
    dialogVisible.value = true;
    dialogInfo.timestamp = a.timestamp;
    dialogInfo.row = row;
    dialogInfo.property = b.property;
  }
}
const handleTextDialogChange = async(text: string) => {
  console.log(text)
  let newVal: StorageItem = dialogInfo.row.storageItem
  let cur = newVal.data.find((n) => n.timestamp === dialogInfo.timestamp);
  if (cur) {
    cur[dialogInfo.property] = text;
  }
  await storage.set({
    [dialogInfo.row.url]: toRaw(newVal),
  });
  ElMessage.success('保存成功');
}

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
