import request from '@/services/ant-design-pro/sadmin';
import { TreeSelect } from 'antd';
import { DataNode } from 'antd/es/tree';
import React, { useContext, useEffect, useState } from 'react';
import { SaContext } from '../posts/table';
import PermPanel from './panel';
const PermGroup2: React.FC<{
  perms?: Array<any>;
  onChange?: (value: any) => void;
  roleList?: string[] | boolean;
  roleid?: number;
  value?: any;
}> = (props) => {
  const { onChange, value, roleid } = props;
  const [values, setValues] = useState({});
  //const initValues = value ? value.split(',') : [];
  //console.log('role value', value);
  const [initValues, setInitValues] = useState([]);
  const [perms, setPerms] = useState();
  const [roleList, setRoleList] = useState();
  const [rolePerms, setRolePerms] = useState();
  //通过请求获取后台所有的权限及角色的权限
  const getData = async (rid) => {
    const { data } = await request.get('perm/role/perms');
    setPerms(data.perms);
    setRolePerms(data.role_perms);
    //console.log('get data roleid is', rid);
    if (rid) {
      //console.log('has init roleid', rid, data.role_perms[rid]);
      setRoleList(data.role_perms[rid]);
    }
  };
  const { formRef } = useContext(SaContext);

  useEffect(() => {
    if (formRef.current) {
      const _values = formRef?.current?.getFieldsValue();
      if (_values.perms2) {
        //初始化用户的权限 这里将纯数字的数据删除 本来就没用，会导致选择bug
        //const ivalue = _values.perms2.split(',').filter((v) => !/^\d+$/.test(v));
        const ivalue = _values.perms2.split(',');
        setInitValues(ivalue);
        //console.log('setInitValues here', ivalue);
      }
      getData(_values.roleid);
      //console.log('formRef is ready', formRef?.current?.getFieldsValue());
    }
  }, [formRef]);

  useEffect(() => {
    if (roleid && rolePerms?.[roleid]) {
      setRoleList(rolePerms?.[roleid]);
      console.log('roleid is real change', rolePerms?.[roleid]);
      formRef.current?.setFieldValue('perms2', rolePerms?.[roleid].join(','));
    }
  }, [roleid]);

  return perms?.map((perm) => {
    return (
      <PermPanel
        key={perm.value}
        perm={perm}
        userPerms={initValues}
        roleList={roleList}
        onChangeToParent={(state, _values) => {
          //console.log(state, values);
          values[perm.value] = _values;
          setValues({ ...values });
          //将数据解构
          let _v: string[] = [];
          for (var i in values) {
            _v = [..._v, ...values[i]];
          }
          onChange?.([..._v].join(','));
        }}
      />
    );
  });
};

const PermGroup: React.FC<{
  onChange?: (value: any) => void;
  roleList?: string[] | boolean;
  roleid?: number;
  value?: any;
}> = (props) => {
  const { value: ivalue, roleid = 0, onChange: onValueChange } = props;
  const [perms, setPerms] = useState<DataNode[]>();
  const [value, setValue] = useState([]);
  const { formRef } = useContext(SaContext);
  const [init, setInit] = useState(false);

  const getData = async (roleid: number) => {
    const { data } = await request.get('perm/role/perms', { params: { roleid } });
    setPerms(data.perms);
    //console.log('get data ivalue is', ivalue, init);
    if (ivalue && !init) {
      setInit(true);
      setValue(ivalue.split(','));
    } else {
      //console.log('set roleid s perms',roleid,data.role_perms2);
      if (roleid && data.role_perms2) {
        setValue(data.role_perms2);
        formRef.current?.setFieldValue('perms2', data.role_perms2?.join(','));
      }
    }

    // setRolePerms(data.role_perms);
    // //console.log('get data roleid is', rid);
    // if (rid) {
    //   //console.log('has init roleid', rid, data.role_perms[rid]);
    //   setRoleList(data.role_perms[rid]);
    // }
  };

  useEffect(() => {
    if (formRef.current) {
      getData(roleid);
    }
  }, [formRef, roleid]);

  const onChange = (newValue: string[]) => {
    //console.log('onChange ', newValue);
    setValue(newValue);
    onValueChange?.(newValue.join(','));
  };

  const tProps = {
    treeData: perms,
    value,
    fieldNames: { title: 'label', key: 'value', children: 'options' },
    onChange,
    treeCheckable: true,
    //showCheckedStrategy: SHOW_PARENT,
    placeholder: '请勾选权限设置',
    style: {
      width: '100%',
    },
    maxTagCount: 5,
    allowClear: true,
  };

  return <TreeSelect {...tProps} />;
};
export default PermGroup;
