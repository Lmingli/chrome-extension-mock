<template>
  <div style="width: 900px;padding: 0 20px 40px;">
    <setting style="padding-top: 10px;"></setting>

    <div style="padding-top: 20px;">仅可选择已设置名称的数据</div>
    <customize-table
      :data="tableData"
      :column="tableColumn"
      style="margin-top: 10px;"
    >
      <template #select>
        <el-table-column>
          <template #default="{ row }">
            <el-select :model-value="active[row.key]" filterable placeholder="Select" @change="handleSelectChange($event, row)">
              <el-option
                v-for="item in row.value"
                :key="item.timestamp"
                :label="item.name"
                :value="item.timestamp"
              ></el-option>
            </el-select>
          </template>
        </el-table-column>
      </template>
    </customize-table>

    <div style="margin-top: 20px;">
      <router-link :to="{ path: '/options' }" target="_blank">跳转至选项页</router-link>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, toRaw, onMounted } from 'vue';
import { storage } from '@/utils/Chrome';
import { ElMessage } from 'element-plus';

const tableData = ref([]);
const tableColumn = [
  { label: "url", prop: 'key' },
  { slot: 'select' },
];
const active = reactive({});
const setData = async() => {
  try {
    const data = await storage.get();
    tableData.value = Object.entries(data).filter(n => n[1] instanceof Array).map(n => ({
      key: n[0],
      value: n[1].filter(n => !!n.name),
    }))
    
    console.log(tableData.value);
    for (let n of tableData.value) {
      const asd = n.value?.find(n => n.active)?.timestamp ?? ''
      console.log(asd)
      active[n.key] = asd;
      console.log(active)
    }
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
  let newVal = row.value;
  for (let n of newVal) {
    n.active = false;
  }
  newVal.find(n => n.timestamp === val).active = true;
  await storage.set({
    [row.key]: toRaw(newVal),
  });
  ElMessage.success('设置成功');
}
</script>

<style lang='scss' scoped>

</style>
