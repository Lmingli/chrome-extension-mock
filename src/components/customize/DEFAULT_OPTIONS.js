export const pagination = {
  pageSizes: [10, 20, 50, 100],
  layout: 'total, sizes, prev, pager, next, jumper',
  // layout: 'total, prev, pager, next',
  align: 'right',
  className: '',
  pageSize: 10,
}

export const table = {
  stripe: true,
  border: false,
  size: 'default',
  headerCellStyle: {
    backgroundColor: '#f5f7fa',
    color: '#909399', 
    borderBottom: 0, 
    height: '50px',
  },
  cellStyle: {
    borderBottom: 0,
  },
  className: '',
  align: 'center',
}

export const form = {
  size: 'default',
  className: '',
  showSubmitButton: true,
  showResetButton: true,
  submitButtonName: '提交',
  resetButtonName: '重置',
  openEnterSubmit: false,
  optionAllName: '全部',
  labelWidth: '120px',
  clearable: true,
  hideOptionAll: false,
}

export const switchOpt = {
  defaultColor: ['#409EFF', '#C0CCDA'],
  className: '',
}

export const dialogForm = {
  form: {},
  size: 'default',
  closeButtonShow: true,
  closeButtonName: '关闭',
  className: '',
}
