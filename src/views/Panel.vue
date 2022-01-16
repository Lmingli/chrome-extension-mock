<template>
  <setting style="padding-top: 10px;"></setting>
  <div style="margin-top: 30px;">
    <el-button type="primary" @click="setData">刷新</el-button>
    <el-button type="danger" @click="handleClear">全部清空</el-button>
    <customize-table
      :data="tableData"
      :column="tableColumn"
      style="margin-top: 10px;"
      row-key="key"
      :expand-row-keys="expandRowKeys"
      @row-click="handleRowClick"
      @expand-change="handleExpandChange"
    >
      <template #expand>
        <el-table-column type="expand" align="center">
          <template #default="{ row }">

            <customize-table
              v-if="(row.value instanceof Array)"
              :data="row.value"
              :column="expandColumn"
              :show-header="false"
              style="padding-left: 40px;"
              @row-click="(a, b) => handleExpandRowClick(a, b, row)"
            >
              <template #before>
                <el-table-column align="center" width="100px">
                  <template #default="{ row: expandRow }">
                    <el-button v-if="expandRow.active" type="success">当前</el-button>
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
        <el-table-column label="操作" align="center" width="120px" prop="operate">
          <template #default="{ row }">
            <el-popconfirm title="是否确定删除？" @confirm="handleDelete(row)">
              <template #reference>
                <el-button type="danger">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </template>
    </customize-table>
  </div>

  <response-text-dialog v-if="dialogVisible" v-model="dialogVisible" :data="responseText" @change="handleTextDialogChange"></response-text-dialog>
</template>

<script setup>
import { onMounted, ref, toRaw, shallowRef, defineAsyncComponent, reactive } from 'vue';
import { storage } from '@/utils/Chrome';
import { ElMessage, ElMessageBox } from 'element-plus';
console.log(storage)

const tableData = shallowRef([]);
const tableColumn = [
  { slot: 'expand' },
  { label: 'key', prop: 'key' },
  { label: 'count', prop: 'count', minWidth: '200px' },
];
const setData = async() => {
  try {
    const data = await storage.get();
    tableData.value = Object.entries(data).map(n => ({
      key: n[0],
      value: n[1],
      count: n[1] instanceof Array ? n[1].length : JSON.stringify(n[1]),
    }))
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
  { label: 'requestBody', prop: 'requestBody' },
  { label: 'response', prop: 'response', minWidth: '300%' },
];



const handleDelete = async ({ key }) => {
  await storage.remove(key);
  ElMessage.success('删除成功');

  tableData.value.splice(tableData.value.findIndex(n => n.key === key), 1);
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

const expandRowKeys = ref([]);
const handleExpandChange = (row, expanded) => {
  expandRowKeys.value = expanded.map(n => n.key);
}
const handleRowClick = ({ key, value }, column) => {
  if (!(value instanceof Array)) {
    return;
  }
  if (column.property === 'operate') {
    return;
  }
  if (expandRowKeys.value.includes(key)) {
    expandRowKeys.value.splice(expandRowKeys.value.indexOf(key), 1);
  } else {
    expandRowKeys.value.push(key);
  }
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
});
// 点击response
const handleExpandRowClick = function(a, b, row) {
  console.log(a, b, row)
  if (b.property === 'response') {
    responseText.value = a.response;
    dialogVisible.value = true;
    dialogInfo.timestamp = a.timestamp;
    dialogInfo.row = row;
  }
}
const handleTextDialogChange = async(text) => {
  console.log(text)
  let newVal = dialogInfo.row.value
  newVal.find(n => n.timestamp === dialogInfo.timestamp).response = text;
  await storage.set({
    [dialogInfo.row.key]: toRaw(newVal),
  });
  ElMessage.success('保存成功');
}
</script>

<style lang='scss' scoped>

</style>
