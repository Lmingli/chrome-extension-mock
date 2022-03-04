<template>
  <div :class="{ [className]: !!className }">
    <el-form
      :model="form" 
      ref="formRef" 
      v-bind="filterItemBind({ ...props, ...attrs }, 'form')"
      :label-width="inline ? 'none' : labelWidth" 
    >
      <template v-for="(item, index) of setting">
        <template v-if="!!item.slot && item.type !== 'slotInside' && item.type !== 'slotIn'">
          <slot :name="item.slot" :form="form"></slot>
        </template>

        <el-form-item
          v-if="getVisible(item)"
          :key="index"
          v-bind="filterItemBind(item, 'item')"
          :rules="getRules(item)"
          :class="{
            [item.className]: !!item.className,
            'is-disabled': disabled,
          }"
          :style="{
            'margin-bottom': margin || null,
            'margin-left': inline && margin ? margin: 'auto',
          }"
        >

          <template v-if="item.type === 'slotInside' || item.type === 'slotIn'">
            <slot :name="item.slot" :form="form"></slot>
          </template>

          <template v-else-if="item.type === 'text'">
            <div class="form-item-text">{{ form[item.prop] || item.default }}</div>
          </template>

          <template v-else-if="item.type === 'input' || item.type === 'textarea'">
            <el-input
              v-model="form[item.prop]" 
              v-bind="item"
              :type="item.type === 'textarea' ? 'textarea' : ''"
              :placeholder="item.placeholder || `请输入${item.label}`" 
              :style="item.width || itemWidth ? `width: ${item.width || itemWidth};` : 'auto'"
              @keyup.native.enter="handleKeyup"
              @change="handleItemChange"
            ></el-input>
          </template>

          <template v-else-if="item.type === 'inputNumber'">
            <el-input-number
              v-model="form[item.prop]" 
              v-bind="item"
              :placeholder="item.placeholder || `请输入${item.label}`" 
              :style="item.width || itemWidth ? `width: ${item.width || itemWidth};` : 'auto'"
              @keyup.native.enter="handleKeyup"
              @change="handleItemChange"
            ></el-input-number>
          </template>

          <template v-else-if="item.type === 'select'">
            <el-select 
              v-model="form[item.prop]" 
              v-bind="item"
              :placeholder="item.placeholder || `请选择${item.label}`" 
              :style="item.width || itemWidth ? `width: ${item.width || itemWidth};` : 'auto'"
              @change="handleItemChange(item)"
            >
              <el-option v-if="!(item.hideOptionAll || hideOptionAll)" :label="item.optionAllName || optionAllName" value="__ALL__"></el-option>
              <el-option
                v-for="enumItem in getEnum(item)"
                :label="enumItem[(item.enumKey || enumKey)[0]]"
                :value="enumItem[(item.enumKey || enumKey)[1]]"
                :key="enumItem[(item.enumKey || enumKey)[1]]"
                :disabled="enumItem['disabled']"
              ></el-option>
            </el-select>
          </template>

          <template v-else-if="item.type === 'datepicker' || item.type === 'date' || item.type === 'datetimerange' ">
            <el-date-picker
              v-model="form[item.prop]"
              v-bind="filterItemBind(item, 'datepicker')"
              :type="item.type === 'datetimerange' ? 'datetimerange' : 'date'"
              :placeholder="item.placeholder || `请选择${item.label}`"
              :value-format="item.valueFormat || 'YYYY-MM-DD'"
              :style="item.width || itemWidth ? `width: ${item.width || itemWidth};` : 'auto'"
              @change="handleItemChange(item)"
              :clearable="item.clearable || clearable"
            ></el-date-picker>
          </template>

          <template v-else-if="item.type === 'timepicker' || item.type === 'time'">
            <el-time-picker
              v-model="form[item.prop]"
              v-bind="filterItemBind(item, 'datepicker')"
              :placeholder="item.placeholder || `请选择${item.label}`"
              :value-format="item.valueFormat || 'HH:mm:ss'"
              :style="item.width || itemWidth ? `width: ${item.width || itemWidth};` : 'auto'"
              @change="handleItemChange(item)"
              :clearable="item.clearable || clearable"
            ></el-time-picker>
          </template>

          <template v-else-if="item.type === 'radio'">
            <el-radio-group 
              v-model="form[item.prop]" 
              v-bind="item"
              :placeholder="item.placeholder || `请选择${item.label}`" 
              :style="item.width || itemWidth ? `width: ${item.width || itemWidth};` : 'auto'"
              @change="handleItemChange"
            >
              <template v-if="item.childButton">
                <el-radio-button
                  v-for="enumItem in getEnum(item)"
                  :key="enumItem[(item.enumKey || enumKey)[1]]"
                  :label="enumItem[(item.enumKey || enumKey)[1]]"
                  :disabled="enumItem['disabled']"
                >{{ enumItem[(item.enumKey || enumKey)[0]] }}</el-radio-button>
              </template>
              <template v-else>
                <el-radio
                  v-for="enumItem in getEnum(item)"
                  :key="enumItem[(item.enumKey || enumKey)[1]]"
                  :label="enumItem[(item.enumKey || enumKey)[1]]"
                  :disabled="enumItem['disabled']"
                >{{ enumItem[(item.enumKey || enumKey)[0]] }}</el-radio>
              </template>
            </el-radio-group>
          </template>

          <template v-else-if="item.type === 'checkbox'">
            <el-checkbox-group 
              v-model="form[item.prop]" 
              v-bind="item"
              :placeholder="item.placeholder || `请选择${item.label}`" 
              :style="item.width || itemWidth ? `width: ${item.width || itemWidth};` : 'auto'"
              @change="handleItemChange"
            >
              <template v-if="item.childButton">
                <el-checkbox-button
                  v-for="enumItem in getEnum(item)"
                  :key="enumItem[(item.enumKey || enumKey)[1]]"
                  :label="enumItem[(item.enumKey || enumKey)[1]]"
                  :disabled="enumItem['disabled']"
                >{{ enumItem[(item.enumKey || enumKey)[0]] }}</el-checkbox-button>
              </template>
              <template v-else>
                <el-checkbox
                  v-for="enumItem in getEnum(item)"
                  :key="enumItem[(item.enumKey || enumKey)[1]]"
                  :label="enumItem[(item.enumKey || enumKey)[1]]"
                  :disabled="enumItem['disabled']"
                >{{ enumItem[(item.enumKey || enumKey)[0]] }}</el-checkbox>
              </template>
            </el-checkbox-group>
          </template>

          <template v-else-if="item.type === 'switch'">
            <customize-switch
              v-model:value="form[item.prop]"
              v-bind="item"
              @change="handleItemChange"
            ></customize-switch>
          </template>

          <!-- <template v-else-if="item.type === 'image'">
            <upload-single
              v-model="form[item.prop]"
              v-bind="item"
              :UploadFile="uploadFile(item)"
              :limit="item.limit"
              @change="handleImageItemChange(item)"
            ></upload-single>
          </template> -->

          <template v-else-if="item.type === 'color'">
            <el-color-picker 
              v-model="form[item.prop]"
              v-bind="filterItemBind(item, 'color', true)"
              @change="handleItemChange"
            ></el-color-picker>
          </template>

        </el-form-item>

      </template>

      <el-form-item v-if="!hideOperate" class="operate">
        <slot name="button-before"></slot>
        <el-button v-if="showSubmitButton" type="primary" @click="handleSubmit('click')" :loading="loading">{{ submitButtonName }}</el-button>
        <el-button v-if="showResetButton" type="danger" @click="handleReset">{{ resetButtonName }}</el-button>
        <slot name="button"></slot>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { reactive, useAttrs, ref, toRaw, watchEffect } from 'vue';
import { isEmpty } from './utils';
import { form as OPTIONS } from './DEFAULT_OPTIONS';

const props = defineProps({
  setting: {
    type: Array,
    required: true,
  },
  form: {
    default: {},
  },
  loading: Boolean,
  Enum: {},
  validate: Boolean,
  size: {
    type: String,
    default: () => OPTIONS.size,
  },
  className: {
    type: String,
    default: () => OPTIONS.className,
  },
  showSubmitButton: {
    type: Boolean,
    default: () => OPTIONS.showSubmitButton,
  },
  showResetButton: {
    type: Boolean,
    default: () => OPTIONS.showResetButton,
  },
  submitButtonName: {
    type: String,
    default: () => OPTIONS.submitButtonName,
  },
  resetButtonName: {
    type: String,
    default: () => OPTIONS.resetButtonName,
  },
  openEnter: {
    type: Boolean,
    default: () => OPTIONS.openEnterSubmit,
  },
  margin: String,
  optionAllName: {
    type: String,
    default: () => OPTIONS.optionAllName,
  },
  labelWidth: {
    type: String,
    default: () => OPTIONS.labelWidth,
  },
  itemWidth: String,
  clearable: {
    type: Boolean,
    default: () => OPTIONS.clearable,
  },
  hideOptionAll: {
    type: Boolean,
    default: () => OPTIONS.hideOptionAll,
  },
  enumKey: {
    type: Array,
    default: () => (['label', 'value']),
  },
  hideOperate: Boolean,
  cleanProps: Boolean,
  disabled: Boolean,
  operate: Array,
  cleanEmpty: Boolean,
  inline: Boolean,
  immediate: {
    type: Boolean,
    default: false,
  },
  fullWidth: Boolean,
});
const attrs = useAttrs();
const emits = defineEmits(['update:loading', 'submit']);

const setting = ref(props.setting.map(n => {
  if (props.validate) {
    return n;
  } else {
    let newN = { ...n };
    delete newN.required;
    delete newN.rules;
    return newN;
  }
}));

let form = reactive({
  ...setting.value.reduce((prev, cur) => {
    let defaultValue = null;
    if (cur.type === 'checkbox') {
      defaultValue = [];
    }
    prev[cur.prop] = cur.default ?? defaultValue;
    return prev;
  }, {}),
  ...props.form,
});

watchEffect(() => {
  for (let n in props.form) {
    form[n] = props.form[n];
  }
})

const filterItemBind = (item, type, del=false) => {
  let allItems = [];
  switch (type) {
    case 'form':
    case 'item':
      allItems = ['className'];
      break;
    case 'datepicker':
      allItems = ['prop', 'label', 'default', 'width', 'rules', 'required', 'msg', 'validType', 'prefixIcon', 'className', 'labelWidth', 'slot', 'slotInside', 'slotIn', 'dataType'];
      break;
    case 'color':
      allItems = ['disabled', 'size', 'color-format', 'popper-class', 'predefine'];
      break;
    default:
      break;
  }

  let newItems = {};
  for (let n in item) {
    if (allItems.includes(n) === del) {
      newItems[n] = item[n];
    }
  }
  return newItems
}

const getVisible = (item) => {
  // 获取该item是否展示。[prop, 'a'] / function
  if (!item.visible) {
    return true;
  } else {
    if (item.visible instanceof Array) {
      return form[item.visible[0]] === item.visible[1];
    } else if (typeof item.visible === 'function') {
      return item.visible(form);
    } else {
      console.log('visible属性为array或function');
      return true;
    }
  }
}

const getRules = (item) => {
  if (!props.validate) {
    return null;
  }
  // 获取验证规则 rules，required、msg、validType
  let rule = [];
  if (item.required) {
    const msg = item.msg || (['select', 'radio', 'checkbox', 'date', 'image', 'datepicker', 'timepicker'].includes(item.type) ? '请选择' : '请输入') + item.label;
    rule.push({ required: true, message: msg });
  } 
  if (item.validType) {
    const EnumMsg = {
      url: '请输入正确的链接',
      email: '请输入正确的email',
      date: '请输入正确的日期',
    }
    rule.push({ type: item.validType, message: EnumMsg[item.validType] });
  }
  if (item.validMax) {
    if (item.validMin) {
      const msg = `长度为${item.validMin}~${item.validMax}个字符`
      rule.push({ min: item.validMin, max: item.validMax, message: item.validLenMsg || msg });
    } else {
      const msg = `最多输入${item.validMax}个字符`
      rule.push({ max: item.validMax, message: item.validLenMsg || msg });
    }
  }
  if (item.rules && typeof item.rules === 'object') {
    if (item.rules instanceof Array) {
      rule.push(...item.rules);
    } else {
      rule.push(item.rules);
    }
  } 
  return rule.length > 0 ? rule : null;
}

const getEnum = ({ enum: Enum, prop }) => {
  // 获取枚举，['a', 'b'] / [{ label: 'a', value: 'a' }] / { a: 'a' }
  if (!Enum) {
    if (!!props.Enum && !!prop) {
      return getEnum({
        enum: props.Enum[prop],
      });
    } else {
      return [];
    }
  } else if (Enum instanceof Array && Enum.length > 0) {
    if (typeof Enum[0] === 'object') {
      return Enum;
    } else {
      return Enum.map(n => ({
        [props.enumKey[0]]: n,
        [props.enumKey[1]]: n,
      }))
    }
  } else {
    return Object.entries(Enum).map(n => ({
      [props.enumKey[0]]: n[1],
      [props.enumKey[1]]: n[0],
    }));
  }
}


const handleKeyup = () => {
  // 开启回车搜索
  if (props.openEnter) {
    handleSubmit();
  }
}
const handleItemChange = () => {
  // 开启自动提交
  if (props.immediate) {
    handleSubmit();
  }
}


const formRef = ref();
const handleReset = () => {
  try {
    formRef.value.resetFields();
  } catch (error) {
    console.log('resetFields--error', error);
  }
  for (let n in form) {
    if (setting.value.find(x => x.prop === n)?.type === 'checkbox') {
      form[n] = [];
    } else if (setting.value.find(x => x.prop === n)?.type === 'switch') {
      form[n] = setting.value.find(x => x.prop === n)?.default;
    } else {
      form[n] = '';
    }
  }
  try {
    formRef.value.clearValidate();
  } catch (error) {
    console.log(error);
  }
}
const reset = () => {
  handleReset();
}
defineExpose({ reset });


const handleSubmit = async(mode) => {
  // 表单验证
   try {
    await formRef.value.validate();
  } catch (error) {
    console.log('验证未通过', error, form)
    return;
  }

  let newForm = toRaw(form);

  for (let n in newForm) {
    if (newForm[n] === '__ALL__') {
      newForm[n] = null;
    }
  }

  // 清理数据
  if (props.cleanProps) {
    const allSettingProps = setting.value.filter(n => getVisible(n)).map(n => n.prop).join(',').split(',');
    for (let n in newForm) {
      if (!allSettingProps.includes(n)) {
        delete newForm[n];
      }
    }
  }

  if (props.cleanEmpty) {
    for (let n in form) {
      if (isEmpty(form[n])) {
        delete form[n];
      }
    }
  }

  // 清除未配置prop数据
  delete newForm[undefined];

  emits('update:loading', true);
  emits('submit', newForm);

  return Promise.resolve(form);
}

</script>

<style lang='scss' scoped>

</style>
