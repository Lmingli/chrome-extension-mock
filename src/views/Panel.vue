<template>
  <el-container style="height: 100%;">
    <el-header height="auto">
      <setting></setting>
    </el-header>

    <el-main>
      <el-button type="primary" @click="setData">刷新</el-button>
      <el-button type="danger" @click="handleClear">全部清空</el-button>
      <el-input v-model="searchString" placeholder="url过滤" style="margin-left: 12px;width: 140px;" clearable></el-input>
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
                @row-click="(a, b) => handleExpandRowClick(a, b, row)"
              >
                <template #before>
                  <el-table-column align="center" width="100px">
                    <template #default="{ row: expandRow }">
                      <el-button v-if="expandRow.active" type="success" @click="handleCancelActive(row)">当前</el-button>
                      <el-button v-else @click="handleChooseActive(row, expandRow)">选择</el-button>
                    </template>
                  </el-table-column>
                </template>
                <template #after>
                  <el-table-column align="center">
                    <template #default="{ row: expandRow }">
                      <el-input v-model="expandRow.name" placeholder="输入名称"></el-input>                    
                    </template>
                  </el-table-column>
                  <el-table-column align="center" width="240px">
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

        <template #after>
          <el-table-column label="操作" align="center" prop="operate" width="300px">
            <template #default="{ row }">
              <el-button v-if="showUncheck(row)" type="warning" @click="handleUnchek(row)">取消已选择</el-button>
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

  <response-text-dialog v-if="dialogVisible" v-model="dialogVisible" :data="responseText" @change="handleTextDialogChange"></response-text-dialog>
</template>

<script setup>
import { onMounted, ref, toRaw, shallowRef, defineAsyncComponent, reactive } from 'vue';
import { storage } from '@/utils/Chrome';
import { ElMessage, ElMessageBox } from 'element-plus';
console.log(storage)

const settingData = ref({});

const tableData = shallowRef([]);
const tableColumn = [
  { slot: 'expand' },
  { label: 'url', prop: 'key', formatter: (row, column, cellValue, index) => {
    let value = cellValue;
    for (let n of settingData.value.listUrlRemoveStr) {
      value = value.replace(n, '');
    }
    return value;
  }, minWidth: '200px' },
  { label: 'count', prop: 'count' },
  { label: 'size', prop: 'size' },
];
const setData = async() => {
  try {
    const data = await storage.get();
    let tmp = [];
    for (let n in data) {
      if (n === 'setting') {
        settingData.value = data[n];
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
  { label: 'method', prop: 'method' },
  { label: 'requestParams', prop: 'requestParams' },
  { label: 'requestBody', prop: 'requestBody', 'show-overflow-tooltip': true },
  { label: 'response', prop: 'response', 'show-overflow-tooltip': true },
];



const handleDelete = async ({ key }) => {
  await storage.remove(key);
  ElMessage.success('删除成功');
  tableData.value.splice(tableData.value.findIndex(n => n.key === key), 1);
}
const showUncheck = ({ value }) => value.findIndex(n => n.active === true) > -1;
const handleUnchek = async({ key, value }) => {
  value.find(n => n.active === true).active = false;
  await storage.set({
    [key]: toRaw(value),
  });
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

const searchString = ref('');


const expandRowKeys = ref([]);
const handleExpandChange = (row, expanded) => {
  expandRowKeys.value = expanded.map(n => n.key);
}
const handleRowClick = ({ key, value }, column) => {
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
const rowStyle = ({ row, rowIndex }) => {
  return {
    'background-color': rowIndex % 2 === 0 ? 'rgb(236, 245, 255)' : 'rgb(245, 254, 240)',
  }
}




const handleCancelActive = async(row) => {
  let newVal = row.value;
  for (let n of newVal) {
    n.active = false;
  }
  await storage.set({
    [row.key]: toRaw(newVal),
  });
  ElMessage.success('设置成功');
}
const handleChooseActive = async(row, expandRow) => {
  let newVal = row.value;
  for (let n of newVal) {
    n.active = false;
  }
  newVal.find(n => n.timestamp === expandRow.timestamp).active = true;
  console.log(toRaw(newVal))
  await storage.set({
    [row.key]: toRaw(newVal),
  });
  ElMessage.success('设置成功');
}
const handleExpandDelete = async(row, expandRow) => {
  let newVal = row.value;
  const idx = newVal.findIndex(n => n.timestamp === expandRow.timestamp);
  newVal.splice(idx, 1);
  await storage.set({
    [row.key]: toRaw(newVal),
  });
  ElMessage.success('删除成功');
}
const handleExpandName = async(row, expandRow) => {
  let newVal = row.value;
  newVal.find(n => n.timestamp === expandRow.timestamp).name = expandRow.name;
  await storage.set({
    [row.key]: toRaw(newVal),
  });
  ElMessage.success('设置成功');
}



const ResponseTextDialog = defineAsyncComponent(() => import('./ResponseTextDialog.vue'));
const dialogVisible = ref(false);
const responseText = ref();
const dialogInfo = reactive({
  timestamp: '',
  row: {},
  property: '',
});
// 点击response
const handleExpandRowClick = function(a, b, row) {
  if (['requestParams', 'requestBody', 'response'].includes(b.property)) {
    responseText.value = a[b.property];
    dialogVisible.value = true;
    dialogInfo.timestamp = a.timestamp;
    dialogInfo.row = row;
    dialogInfo.property = b.property;
  }
}
const handleTextDialogChange = async(text) => {
  console.log(text)
  let newVal = dialogInfo.row.value
  newVal.find(n => n.timestamp === dialogInfo.timestamp)[dialogInfo.property] = text;
  await storage.set({
    [dialogInfo.row.key]: toRaw(newVal),
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
