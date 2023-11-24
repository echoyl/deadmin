import { Checkbox, Collapse, CollapseProps } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import PermRow from './row';
//import _ from 'underscore';
const PermPanel: React.FC<{
  /**
   * 单个权限数据
   */
  perm?: any;
  /**
   * 初始化用户已经有的权限
   */
  userPerms?: string[];
  /**
   * 分组权限，如果有数据那么 需要监测子权限是否在分组权限中
   */
  roleList?: string[] | boolean;

  onChange?: (value: any) => void;
  /**
   * 值变动后通知父级panel
   */
  onChangeToParent?: (state: string, values: string[]) => void;
  //panelState?: 'checked' | 'indeterminate' | 'unchecked';
  /**
   * 用户监听父级panel的全选或非选状态
   */
  panelState?: boolean;
}> = (props) => {
  const { perm, userPerms = [], roleList = false, onChange, onChangeToParent, panelState } = props;

  /**
   * 获取当前子权限的值 如果还有子权限则当前获取该子权限的最大值 即不再递归查询
   * @param ps
   * @returns
   */
  const getPemsValue = (ps: any[]): string[] => {
    let res: string[] = [];
    ps?.map((p) => {
      if (p.more) {
        res.push(p.value);
      } else {
        p.options?.map((v: any) => {
          res.push(v.value);
        });
      }
    });
    return res;
  };

  const [indeterminate, setIndeterminate] = useState(false);
  const [checked, setChecked] = useState(false);
  const [checkedList, setCheckedList] = useState<string[]>([]);

  //传递父级全选和反选事件的变量
  const [checkedAll, setCheckedAll] = useState(false);
  const [values, setValues] = useState<any>({});

  const _allOptions = getPemsValue(perm.options);
  const _options = roleList
    ? _allOptions.filter((v) => roleList.includes(v) || v.indexOf('.') < 0)
    : [..._allOptions];

  const [allOptions, setAllOptions] = useState<any>(_allOptions);
  const [options, setOptions] = useState<any>(_options);

  useEffect(() => {
    const thisChecked = userPerms.filter((v) => _options.includes(v));
    setState(thisChecked);
  }, []);

  const { Panel } = Collapse;
  const firstRenderRef = useRef(true);
  const firstRenderRef2 = useRef(true);
  /**
   * 监听上级是否全选
   */
  useEffect(() => {
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      return;
    }
    if (!panelState) {
      //未全选
      console.log('check no all');
      //setState([]);
      checkNotAll();
    } else {
      //全选
      checkALL();
      console.log('check all');
      //setState([...options]);
    }
  }, [panelState]);
  /**
   * 监听组全选是否改变（切换用户分组的时候触发 重置用户权限为所选组的权限）
   */
  useEffect(() => {
    if (firstRenderRef2.current) {
      firstRenderRef2.current = false;
      return;
    }
    const _options = allOptions.filter((v) => roleList.includes(v) || v.indexOf('.') < 0);
    setOptions(_options);
    setState([..._options], [], _options);
  }, [roleList]);

  const onChangeAll = (checked: boolean) => {
    const list = checked ? [...options] : [];
    setChecked(checked);
    setState(list);
  };

  const onRowValueChange = (value: Array<string>) => {
    setState(value);
  };

  const setState = (value: string[], _values: any = values, _options: any = options) => {
    _options = _options ? _options : options;
    const _checked = value.length && value.length == _options.length ? true : false;
    //console.log(_options, _options.length, value, value.length, perm.label);
    let _v: string[] = [];
    for (var i in _values) {
      _v = [..._v, ..._values[i]];
    }
    //console.log(values, value);
    const _value = new Set([..._v, ...value]);

    const _indeterminate = !_checked && [..._value].length ? true : false;
    if (_indeterminate != indeterminate) {
      setIndeterminate(_indeterminate);
    }
    if (_checked != checked) {
      setChecked(_checked);
    }
    if (_checked) {
      setCheckedAll(true);
    } else {
      //如果没有半选 并且value为空的情况下 才会 全部反选
      if (!_indeterminate || !value.length) {
        setCheckedAll(false);
      }
    }
    setCheckedList([...value]);

    const state = _checked ? 'checked' : _indeterminate ? 'indeterminate' : 'unchecked';
    //console.log('click', value, _values, perm.label, state, _value);
    //setAllValues([..._value]);
    onChangeToParent?.(state, [..._value]);
  };

  const checkALL = () => {
    setIndeterminate(false);
    setChecked(true);
    setCheckedAll(true);
    onChangeToParent?.('checked', [...options]);
  };

  const checkNotAll = () => {
    setIndeterminate(false);
    setChecked(false);
    setCheckedAll(false);
    onChangeToParent?.('unchecked', []);
  };

  const items: CollapseProps['items'] = [
    {
      collapsible: 'header',
      key: perm.value,
      label: perm.label,
      extra: (
        <Checkbox
          indeterminate={indeterminate}
          disabled={options.length <= 1}
          checked={checked}
          onChange={(e) => {
            onChangeAll(e.target.checked);
          }}
        >
          全选
        </Checkbox>
      ),
      children: perm.options.map((p) => {
        //console.log(p);
        return !p.more ? (
          <PermRow
            key={p.value}
            label={p.label}
            options={p.options}
            roleList={roleList}
            checkedList={checkedList}
            onChange={onRowValueChange}
          />
        ) : (
          <PermPanel
            key={p.label}
            perm={p}
            userPerms={userPerms}
            roleList={roleList}
            onChangeToParent={(state: string, _values) => {
              //子面板内容值改变
              const value = p.value;
              const index = checkedList.indexOf(value);

              if (state == 'checked') {
                if (index < 0) {
                  checkedList.push(value);
                }
              } else {
                if (index > -1) {
                  checkedList.splice(index, 1);
                }
              }

              values[value] = _values;
              //console.log('state', state, perm.label, checked, index, p, checkedList, values);
              setValues({ ...values });
              setState(checkedList, values);
              //console.log('panel value:' + p.label, values);
            }}
            panelState={checkedAll}
          />
        );
      }),
    },
  ];

  return <Collapse defaultActiveKey={[perm.value]} style={{ marginBottom: 8 }} items={items} />;
};
export default PermPanel;
