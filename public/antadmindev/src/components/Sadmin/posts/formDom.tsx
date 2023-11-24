import request from '@/services/ant-design-pro/sadmin';
import { BetaSchemaForm, ProFormColumnsType } from '@ant-design/pro-components';
import { Cascader } from 'antd';
import dayjs from 'dayjs';
import { ReactNode } from 'react';
import { isArr, isStr } from '../checkers';
import { getFromObject, saFormColumnsType, tplComplie } from '../helpers';
export const defaultColumnsLabel = {
  id: '序号',
  category_id: '分类选择',
  displayorder: '排序',
  state: '状态',
  option: '操作',
  coption: '操作',
};

const unsetReadonlyKey = (data: Record<string, any>, cls: any[]) => {
  cls.map((v) => {
    if (v.valueType == 'group') {
      unsetReadonlyKey(data, v.columns);
    } else {
      if (v.readonly === true) {
        if (Array.isArray(v.dataIndex)) {
          delete data[v.dataIndex[0]];
        } else {
          delete data[v.dataIndex];
        }
      }
    }
  });
};

export const beforePost = (data: Record<string, any>, formColumns: any[]) => {
  //console.log(formColumns, data);
  unsetReadonlyKey(data, formColumns);
};
export const beforeGet = (data: Record<string, any>) => {};

interface formFieldsProps {
  formColumnsIndex?: string[];
  labels?: Record<string, any>;
  categoryType?: 'select' | 'cascader';
  detail?: Record<string, any>;
  columns?: ReactNode | ((value: any) => void);
  enums?: Record<string, any>;
  initRequest?: boolean;
  user?: any; //后台用户信息
}

export const GetFormFields: React.FC<{ columns: ProFormColumnsType[] | saFormColumnsType }> = ({
  columns,
}) => {
  //console.log('GetFormFields', columns);
  return (
    <BetaSchemaForm
      layoutType="Embed"
      // rowProps={{
      //   gutter: [10, 10],
      // }}
      // colProps={{
      //   span: 12,
      // }}
      // grid={true}
      // name="hahaha"
      // onFinish={async (values) => {
      //   console.log(values);
      // }}
      columns={columns}
    />
  );
};

export const getFormFieldColumns = (props: formFieldsProps) => {
  const {
    labels = {},
    categoryType,
    detail = {},
    columns = [],
    enums = {},
    initRequest = false,
    user,
  } = props;

  if (!initRequest) return [];
  const allLabels = { ...defaultColumnsLabel, ...labels };

  //console.log('inner detail', detail);
  //console.log('categoryType', categoryType);
  const customerColumns =
    typeof columns == 'function' ? columns(detail) : isArr(columns) ? [...columns] : [];
  //console.log(detail);
  const categoryProps = {
    placeholder: '请选择' + allLabels.category_id,
    options: detail.categorys ? detail.categorys : enums.categorys,
  };

  //const { initialState } = useModel('@@initialState');

  const defaulColumns: { [key: string]: any } = {
    category_id: {
      title: allLabels.category_id,
      valueType: categoryType,
      dataIndex: 'category_id',
      fieldProps:
        categoryType == 'select'
          ? {
              ...categoryProps,
              mode: 'multiple',
            }
          : {
              ...categoryProps,
              multiple: true,
              showCheckedStrategy: Cascader.SHOW_CHILD,
            },
      formItemProps: {
        rules: [
          {
            required: true,
            message: '请选择' + allLabels.category_id,
          },
        ],
      },
    },

    id: {
      dataIndex: 'id',
      formItemProps: { hidden: true },
    },
    parent_id: {
      dataIndex: 'parent_id',
      formItemProps: { hidden: true },
    },
  };
  const parseColumns = (v) => {
    if (typeof v == 'string') {
      if (defaulColumns[v]) {
        //console.log(defaulColumns[c]);
        return { ...defaulColumns[v] };
      }
    } else {
      //加入if条件控制
      if (v.fieldProps?.if) {
        const show = tplComplie(v.fieldProps?.if, {
          record: detail,
          user,
        });
        //console.log('v.fieldProps?.if', v.fieldProps?.if, show);
        if (!show) {
          return false;
        }
      }

      if (v.requestParam) {
        v.request = async () => {
          const { data } = await request.get(v.requestParam.url, { params: v.requestParam.params });
          return data;
        };
      }
      const requestName = v.requestDataName
        ? v.requestDataName
        : v.fieldProps?.requestDataName
        ? v.fieldProps.requestDataName
        : false;
      if (requestName) {
        // v.request = async () => {
        //   return enums[v.requestDataName] ? enums[v.requestDataName] : detail[v.requestDataName];
        // };
        let options = [];
        if (isArr(requestName)) {
          //数组只从详情中获取
          options = getFromObject(detail, requestName);
        } else {
          options = enums?.[requestName] ? enums[requestName] : detail?.[requestName];
        }

        //console.log('has requestName is', requestName, enums, detail, options);
        v.fieldProps = {
          ...v.fieldProps,
          options: options ? options : [],
        };
      }

      if (v.fieldProps?.requestNames) {
        //将请求返回的数据赋值到formitem中的fieldProps配置中
        v.fieldProps.requestNames.forEach((name) => {
          const requestData = enums[name] ? enums[name] : detail[name];
          if (requestData) {
            v.fieldProps[name] = requestData;
          }
        });
      }

      if (v.valueType == 'saFormList') {
        //将name设置到属性当中 因为 valueTypeMap 中会丢失name 先在这里添加修改下
        v.fieldProps = { ...v.fieldProps, dataIndex: v.dataIndex };
      }
      if (v.valueType == 'modalSelect' && !v.fieldProps.name) {
        //将name设置到属性当中 因为 valueTypeMap 中会丢失name 先在这里添加修改下
        v.fieldProps = { ...v.fieldProps, name: v.dataIndex };
      }

      if (v.valueType == 'cdependency') {
        v.valueType = 'dependency';
        //dependency不需要 title 和 dataindex
        delete v.title;
        delete v.dataIndex;
        v.columns = ((body) => {
          return new Function(`return ${body}`)();
        })(v.columns);
        //console.log('cdependency', v);
      }
      //支持日期中的presets的value的字符串格式日期
      if (v.fieldProps?.presets) {
        //console.log('presets is', v);
        v.fieldProps.presets = v.fieldProps.presets.map((val) => {
          val.value = val.value.map((_v) => {
            if (isStr(_v)) {
              _v = dayjs(_v);
            }
            return _v;
          });
          return val;
        });
      }
      if (v.fieldProps?.showTime?.defaultValue) {
        //console.log('presets is', v);
        if (isArr(v.fieldProps.showTime.defaultValue)) {
          v.fieldProps.showTime.defaultValue = v.fieldProps.showTime.defaultValue.map((val) => {
            if (isArr(val)) {
              return dayjs(val[0], val[1]);
            } else {
              return dayjs(val, 'HH:mm:ss');
            }
          });
          console.log('showTime is', v);
        }
      }

      if (v.columns && Array.isArray(v.columns)) {
        v.columns = v.columns
          .map((_v) => parseColumns(_v))
          .filter((c) => {
            return c !== false;
          });
      }
      return v;
    }

    return false;
  };

  const _columns = customerColumns
    .map((c) => parseColumns(c))
    .filter((c) => {
      return c !== false;
    });
  //console.log('_columns', _columns);
  return _columns;
};
