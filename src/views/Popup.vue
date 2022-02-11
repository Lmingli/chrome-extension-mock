<template>
  <div style="width: 900px;padding: 0 20px 40px;">
    <setting></setting>

    <div style="margin-bottom: 10px;">
      <router-link :to="{ path: '/options' }" target="_blank">跳转至选项页</router-link>
    </div>

    <div>仅可选择已设置名称的数据</div>
    <customize-table
      :data="tableData"
      :column="tableColumn"
      style="margin-top: 10px;"
    >
      <template #select>
        <el-table-column>
          <template #default="{ row }">
            <el-select :model-value="active[row.key]" filterable clearable placeholder="Select" @change="handleSelectChange($event, row)">
              <el-option
                v-for="item in row.value.filter(n => !!n.name)"
                :key="item.timestamp"
                :label="item.name"
                :value="item.timestamp"
              ></el-option>
            </el-select>
          </template>
        </el-table-column>
      </template>
    </customize-table>

  </div>
</template>

<script setup>
import { reactive, ref, toRaw, onMounted } from 'vue';
import { storage } from '@/utils/Chrome';
import { ElMessage } from 'element-plus';

const settingData = ref({});

const tableData = ref([]);
const tableColumn = [
  { label: "url", prop: 'key', formatter: (row, column, cellValue, index) => {
    let value = cellValue;
    for (let n of settingData.value.listUrlRemoveStr) {
      value = value.replace(n, '');
    }
    return value;
  } },
  { slot: 'select' },
];
const active = reactive({});
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
      if (data[n].find(n => !!n.name)) {
        tmp.push({
          key: n,
          value: data[n],
        });
        active[n] = data[n].find(n => n.active)?.timestamp ?? '';
      }
    }
    tableData.value = tmp;
    console.log(tableData.value);
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


const handleSelectChange = async(val, row) => {
  console.log(val,row)
  let newVal = row.value;
  for (let n of newVal) {
    n.active = false;
  }
  if (!!val) {
    newVal.find(n => n.timestamp === val).active = true;
  }
  await storage.set({
    [row.key]: toRaw(newVal),
  });
  ElMessage.success('设置成功');
}
</script>

<style lang='scss' scoped>

</style>
