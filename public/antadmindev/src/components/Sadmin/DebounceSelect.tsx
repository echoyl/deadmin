import request from '@/services/ant-design-pro/sadmin';
import { ProFormSelect } from '@ant-design/pro-form';
import { useLocation } from '@umijs/max';
import { Empty, Spin } from 'antd';
import type { SelectProps } from 'antd/es/select';
import debounce from 'lodash/debounce';
import React, { useMemo, useRef, useState } from 'react';
import { isStr } from './checkers';
export interface DebounceSelectProps<ValueType = any>
  extends Omit<SelectProps<ValueType>, 'options' | 'children'> {
  fetchOptions: (search: string) => Promise<ValueType[]> | string;
  debounceTimeout?: number;
  params?: object;
}

export default function DebounceSelect<
  ValueType extends { key?: string; label: React.ReactNode; value: string | number } = any,
>({ fetchOptions, debounceTimeout = 400, params = {}, ...props }: DebounceSelectProps) {
  const [fetching, setFetching] = useState(false);
  const [options, setOptions] = useState<ValueType[]>([]);
  const fetchRef = useRef(0);
  if (isStr(fetchOptions)) {
    const url = fetchOptions;
    const { pathname } = useLocation();
    fetchOptions = async (value: string) => {
      const { data } = await request.get(url, {
        params: { keyword: value, pageSize: 50, search: 1, from_path: pathname, ...params },
      });
      return data;
    };
  }

  const debounceFetcher = useMemo(() => {
    const loadOptions = (value: string) => {
      if (isStr(fetchOptions)) return;
      if (!value && options.length > 0) {
        return;
      }
      fetchRef.current += 1;
      const fetchId = fetchRef.current;
      setOptions([]);
      setFetching(true);

      fetchOptions(value).then((newOptions) => {
        if (fetchId !== fetchRef.current) {
          // for fetch callback order
          return;
        }

        setOptions(newOptions);
        setFetching(false);
      });
    };

    return debounce(loadOptions, debounceTimeout);
  }, [fetchOptions, debounceTimeout, options]);
  const fieldProps = {
    fieldNames: props.fieldNames ? props.fieldNames : { label: 'name', value: 'id' },
    onSearch: debounceFetcher,
    filterOption: false,
    notFoundContent: fetching ? <Spin size="small" /> : <Empty />,
    showSearch: true,
    labelInValue: true,
    onFocus: () => {
      if (options.length < 1) {
        setFetching(true);
        debounceFetcher('');
      }
    },
  };
  //console.log(props, fieldProps, props.fieldProps);
  // props.fieldProps = { ...fieldProps, ...props.fieldProps };

  return <ProFormSelect {...props} fieldProps={fieldProps} options={options} />;
}
