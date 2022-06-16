<template>
  <el-container style="height: 100%;">
    <el-header height="auto">
      <Setting></Setting>
    </el-header>

    <el-main style="padding: 10px;">
      <PanelOperate @setStorage="setStorage" v-model:searchString="searchString" v-model:filterLocationUrl="filterLocationUrl" />

      <CustomizeTable
        :data="filterTableData"
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

              <CustomizeTable
                v-if="(row.storageItem.data instanceof Array)"
                :data="expandTableData(row)"
                :column="expandColumn"
                :show-header="false"
                class="table-inside"
                @row-click="(a: any, b: any) => handleExpandRowClick(a, b, row)"
                max-height="320px"
              >
                <template #before>
                  <el-table-column align="left" width="110px">
                    <template #default="{ row: expandRow }">
                      <el-button v-if="expandRow.active" type="success" size="small" @click="handleCancelActive(row)">生效</el-button>
                      <el-button v-else size="small" @click="handleChooseActive(row, expandRow)">开启</el-button>
                      <el-tag v-if="!storageSetting.tag && !!expandRow?.tag" class="expand-row-tag" size="small" type="danger">{{ expandRow.tag }}</el-tag>
                    </template>
                  </el-table-column>
                </template>
                <template #after>
                  <el-table-column align="center" width="120px">
                    <template #default="{ row: expandRow }">
                      <el-input v-model="expandRow.name" size="small" placeholder="输入名称"></el-input>                    
                    </template>
                  </el-table-column>
                  <el-table-column align="center" width="170px">
                    <template #default="{ row: expandRow }">
                      <el-button type="primary" size="small" @click="handleExpandName(row, expandRow)">{{ expandRow.name ? '修改' : '设置' }}名称</el-button>
                      <el-button type="danger" size="small" @click="handleExpandDelete(row, expandRow)">删除</el-button>
                    </template>
                  </el-table-column>
                </template>
              </CustomizeTable>

            </template>
          </el-table-column>
        </template>

        <template #url>
          <el-table-column label="url" prop="url" min-width="200px">
            <template #default="{ row }">
              <el-button v-if="row.storageItem.compare" circle type="danger" :icon="Sunny" size="small" style="margin-right: 5px;" @click="handleCancelCompare(row)"></el-button>
              <el-tag v-if="row.storageItem.top" type="danger" effect="dark" style="margin-right: 5px;cursor: pointer;" @click="handleCancelTop(row)">置顶</el-tag>
              <el-tooltip effect="dark" :content="row.url" placement="top">{{ row.storageItem.name ?? tableUrlFormatter(row.url) }}</el-tooltip>
            </template>
          </el-table-column>
        </template>

        <template #after>
          <el-table-column label="操作" align="center" prop="operate" width="330px">
            <template #default="{ row }">
              <TableColumnOperate
                :url="row.url"
                :storageItem="row.storageItem"
                :tableData="tableData"
                :storageSetting="storageSetting"
                @add="handleAdd"
              />
            </template>
          </el-table-column>
        </template>
      </CustomizeTable>
    </el-main>
  </el-container>

  <ResponseTextDialog
    v-if="dialogVisible"
    v-model="dialogVisible"
    :data="responseText"
    @change="handleTextDialogChange"
  />

</template>

<script setup lang="ts">
import { onMounted, ref, toRaw, shallowRef, defineAsyncComponent, reactive, computed, defineComponent } from 'vue';
import { storage } from '@/utils/Chrome';
import { ElMessage } from 'element-plus';
import { Sunny } from '@element-plus/icons-vue';
import { DefaultSetting } from '~/crx/DefaultSetting';
import { StorageItem, StorageItemData, StorageSetting } from '~/interfaces/common.interface';
import PanelOperate from './PanelOperate.vue';
import TableColumnOperate from './TableColumnOperate.vue';
const ResponseTextDialog = defineAsyncComponent(() => import('@/components/ResponseTextDialog.vue'));


interface Column {
  url: string;
  storageItem: StorageItem;
  count: number | string;
  size: number;
  filterCount?: number;
}

const storageSetting = ref<StorageSetting>(DefaultSetting());
const searchString = ref('');
const filterLocationUrl = ref(false);
const currentLocationUrl = ref('');
try {
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse): void => {
    if (!!msg.locationUrl) {
      currentLocationUrl.value = msg.locationUrl;
    }
  })
} catch (error) {}

const tableData = shallowRef<Column[]>([]);
const filterTableData = computed(() => {
  let data = tableData.value;
  if (!!searchString.value) {
    data = data.filter(n => new RegExp(searchString.value).test(n.url) || new RegExp(searchString.value).test(n.storageItem?.name ?? ''));
  }
  if (filterLocationUrl.value && !!currentLocationUrl.value) {
    data = data.filter(n => n.storageItem.data.some((x) => x.locationUrl === currentLocationUrl.value));
  }
  return data;
});
const expandTableData = (row: Column) => {
  const data = row.storageItem.data
                .filter((n: any) => !row.storageItem.columnFilter || n?.response?.indexOf(row.storageItem.columnFilter) > -1)
                .filter((n: any) => !filterLocationUrl.value || n.locationUrl === currentLocationUrl.value);
  row.filterCount = data.length;
  return data;
};

const tableColumn = [
  { slot: 'expand' },
  { slot: 'url' },
  { label: 'count', prop: 'count', formatter: (row: Column) => row.filterCount !== undefined ? `${row.filterCount}/${row.count}` : row.count },
  { label: 'size', prop: 'size'},
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
    storageSetting.value = (await storage.get('setting')).setting;

    const data = await storage.get();
    let tmp: Column[] = [];
    for (const n in data) {
      if (n === 'setting') {
        continue;
      };
      if (n === 'tmp') {
        continue;
      }
      let storageItem: StorageItem = data[n];
      if (!!storageSetting.value.tag) {
        storageItem.data = storageItem.data.filter((n) => n.tag === storageSetting.value.tag);
        if (storageItem.data.length === 0) {
          continue;
        }
      }
      tmp.push({
        url: n,
        storageItem: storageItem,
        count: storageItem?.data instanceof Array ? storageItem.data.length : JSON.stringify(storageItem),
        size: JSON.stringify(storageItem).length,
      });
    }
    tmp = tmp.sort((a,b) => {
      if (!a.storageItem.top && b.storageItem.top) {
        return 1;
      }
      if (a.storageItem.top && !b.storageItem.top) {
        return -1;
      }
      return b.storageItem.timestamp - a.storageItem.timestamp;
    })
    console.log(tmp)
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
  { label: 'requestParams', prop: 'requestParams', 'show-overflow-tooltip': true, width: '120px' },
  // { label: 'requestBody', prop: 'requestBody', 'show-overflow-tooltip': true },
  { label: 'response', prop: 'response', 'show-overflow-tooltip': true },
];



const handleCancelCompare = async({ url, storageItem }: Column) => {
  storageItem.compare = false;
  await storage.set({
    [url]: toRaw(storageItem),
  });
  ElMessage.info('取消对比');
}
const handleCancelTop = async({ url, storageItem }: Column) => {
  storageItem.top = false;
  await storage.set({
    [url]: toRaw(storageItem),
  });
  ElMessage.info('取消置顶');
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


chrome?.runtime?.onMessage?.addListener((msg, sender, sendResponse) :boolean => {
  if (!!msg.info) {
    ElMessage({
      type: 'info',
      message: msg.info,
      showClose: true,
      grouping: true,
      duration: 1200,
      customClass: 'message-info-right-offset'
    })
  }

  sendResponse();
  return true;
})

</script>

<style lang="scss">
.message-info-right-offset {
  top: 44px !important;
  left: auto;
  right: 10px;
  transform: translateX(0);
  min-width: auto;
}
</style>

<style lang='scss' scoped>
.table-inside {
  padding-left: 20px;
  margin-top: -14px;
  & :deep(.el-table__inner-wrapper) {
    border: 1px solid #DCDFE6;
    border-top: none;
  }
  .expand-row-tag {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    left: 62px;
  }
}
</style>
