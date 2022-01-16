<template>
  <el-container :class="$attrs.class">
    <el-header>
      <customize-form
        v-bind="searchBarConf"
        v-model:loading="loading.searchBar"
        @submit="handleSubmitSearch"
        :setting="searchBarSetting"
        :Enum="Enum"
        inline
        :validate="false"
      >
        <template #button>
          <el-button type="success" @click="handleAdd">新建</el-button>
        </template>
      </customize-form>
    </el-header>

    <el-main>
      <customize-table
        v-bind="tableConf"
        :data="tableData"
        :column="tableColumn"
        v-loading="loading.table"
      >
        <template v-for="slot in slotsList" v-slot:[slot]>
          <slot :name="slot"></slot>
        </template>

        <template #after>
          <el-table-column label="操作" align="center" :width="tableConf.operateWidth">
            <template #default="{ row }">
              <el-button type="primary" size="small" @click="handleEdit(row.id)">编辑</el-button>
              <slot name="tableButton" :id="row.id"></slot>
            </template>
          </el-table-column>
        </template>
      </customize-table>
    </el-main>

    <el-footer height="70px">
      <customize-pagination
        v-model:current="page.current"
        v-model:size="page.size"
        :total="page.total"
        @change="handleChangePage"
        style="padding-bottom: 30px;"
      ></customize-pagination>
    </el-footer>

    <customize-dialog-form
      v-bind="dialogConf"
      :form="editData"
      :title="['新建', '编辑']"
      v-model:visible="dialogVisible" 
      @submit="handleSubmitDialog"
      v-model:loading="loading.form"
      :setting="formSetting"
      :Enum="Enum"
      validate
    ></customize-dialog-form>
  </el-container>
</template>

<script setup>
import { computed, reactive, ref, useSlots } from 'vue';
import { ElMessage } from 'element-plus';
import { clean } from './utils';

const props = defineProps({
  pageSetting: {
    type: Array,
    required: true,
  },
  searchBarProps: Array,
  dialogProps: Array,
  Enum: {
    type: Object,
    default: () => ({}),
  },
  tableProps: Array,
  tableDataFn: Function,
  editDataFn: Function,
  submitFn: Function,
  paginationProps: {
    type: Array,
    default: () => ['current', 'size'],
  },

  searchBarConf: Object,
  dialogConf: Object,
  tableConf: Object,
});
const slots = useSlots();


const fetchParams = ref({});
const tableData = ref([]);
const page = reactive({
  current: 1,
  total: 0,
  size: 10,
});
const loading = reactive({
  table: false,
  searchBar: false,
  form: false,
});
const dialogVisible = ref(false);
const editData = ref(null);

const searchBarSetting = computed(() => props.pageSetting.filter(n => (!n.belong || n.belong === 'searchBar') && props.searchBarProps.includes(n.prop)));
const formSetting = computed(() => props.pageSetting.filter(n => (!n.belong || n.belong === 'dialog') && props.dialogProps.includes(n.prop)));
const tableColumn = computed(() => props.pageSetting.filter(n => (!n.belong || n.belong === 'table') && props.tableProps.includes(n.prop)));
const slotsList = computed(() => Object.keys(slots).filter(n => props.tableProps.includes(n)));

/* 请求数据 */
const fetchData = async() => {
  const params = clean({
    ...fetchParams.value,
    [props.paginationProps[0]]: page.current,
    [props.paginationProps[1]]: page.size,
  });
  loading.table = true;
  try {
    const { data, total } = await props.tableDataFn(params);
    tableData.value = data ?? [];
    page.total = total ?? 0;
  } catch (error) {
    console.log(error);
    tableData.value = [];
    props.total = 0;
  }
  loading.table = false;
  loading.searchBar = false;
}
fetchData();

/* 搜索相关 */
const handleSubmitSearch = (searchParams) => {
  page.current = 1;
  fetchParams.value = searchParams;
  fetchData();
}

/* 分页相关 */
const handleChangePage = () => {
  fetchData();
}

/* 弹窗相关 */
const handleAdd = () => {
  editData.value = null
  dialogVisible.value = true;
}
const handleEdit = async(id) => {
  dialogVisible.value = true;
  editData.value = await props.editDataFn(id);
}
const handleSubmitDialog = async(form) => {
  /* 提交表单 */
  try {
    await props.submitFn(form);
    ElMessage.success('提交成功');
    dialogVisible.value = false;
    editData.value = null;
  } catch (error) {
    console.log(error)
  }
  loading.form = false;
}

defineExpose({
  fetchData,
});
</script>

<style lang="scss" scoped>
.el-container {
  padding-top: 30px;
  height: 100vh;
  .el-header {
    min-height: 40px;
    height: auto;
  }
}
</style>
