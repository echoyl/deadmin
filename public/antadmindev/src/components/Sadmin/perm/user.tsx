import { ProForm } from '@ant-design/pro-components';
import { Button, ButtonProps } from 'antd';
import { FC, useContext, useState } from 'react';
import ButtonDrawer from '../action/buttonDrawer';
import { saFormColumnsType } from '../helpers';
import { SaForm } from '../posts/post';
import { SaContext, saTablePros } from '../posts/table';

interface actionConfirm {
  msg?: string;
  btn?: ButtonProps;
  method?: 'post' | 'delete';
  url?: string;
  data?: {};
  dataId?: number;
  formColumns?: saFormColumnsType;
  callback?: (value: any) => void;
}

export const UserPermForm: FC<
  saTablePros & {
    callback?: ((value: any) => void) | boolean;
    setOpen?: (open: boolean) => void;
    contentRender?: any;
  }
> = (props) => {
  //const [detail, setDetail] = useState();
  const { setOpen, contentRender } = props;
  const [roleid, setRoleid] = useState(0);
  const [form] = ProForm.useForm();
  const [data, setData] = useState();
  const { actionRef } = useContext(SaContext);
  const changeRole = (roleid: any) => {
    if (!roleid) return;
    //console.log('role_perms list ', data.role_perms[roleid]);
    //form.setFieldValue('perms2', data.role_perms[roleid].join(','));
    //if (flag) {
    //setPermsValue(detail.role_perms[roleid].join(','));
    //console.log('value', roleid, data.role_perms[roleid].join(','));
    //console.log('prev', form.getFieldsValue());

    //console.log('after', form.getFieldsValue());
    //}
    setRoleid(roleid);
    //手动修改权限的值
  };
  const beforeGet = (data) => {
    setData(data);
    if (data.roleid) {
      setRoleid(data.roleid);
    }
  };

  return (
    <SaForm
      formTitle={false}
      beforeGet={beforeGet}
      width={1000}
      formColumns={[
        {
          title: '所属组',
          dataIndex: 'roleid',
          formItemProps: { rules: [{ required: true, message: '请选择用户所属组' }] },
          valueType: 'select',
          requestDataName: 'roleids',
          fieldProps: {
            options: [],
            fieldNames: { label: 'title', value: 'id' },
            onChange: (value) => {
              changeRole(value);
            },
          },
        },
        {
          // title: '权限',
          // dataIndex: 'perms2',
          valueType: 'cdependency',
          name: ['roleid'],
          columns:
            "({roleid})=>{return [{valueType:'permGroup',fieldProps:{roleid:roleid},dataIndex:'perms2',title:'权限'}]}",
          // valueType: 'permGroup',
          // fieldProps: {
          //   roleid: roleid,
          // },
        },
        'id',
      ]}
      form={form}
      formProps={{
        contentRender,
        submitter: {
          searchConfig: { resetText: '取消' },
          resetButtonProps: {
            onClick: () => {
              setOpen?.(false);
            },
          },
        },
      }}
      msgcls={({ code }) => {
        if (!code) {
          setOpen?.(false);
          actionRef.current?.reload();
          return;
        }
      }}
      {...props}
    />
  );
};

const UserPerm: FC<actionConfirm> = (props) => {
  const {
    msg = '权限分组',
    btn = { title: '配置', type: 'primary', size: 'small' },
    dataId,
  } = props;
  const { url } = useContext(SaContext);
  //const [form] = Form.useForm<{ desc: string }>();
  return (
    <ButtonDrawer
      title={msg}
      width={1200}
      trigger={
        <Button type={btn.type} size={btn.size}>
          {btn.title}
        </Button>
      }
    >
      <UserPermForm paramExtra={{ id: dataId }} url={url + '/show'} />
    </ButtonDrawer>
  );
};

export default UserPerm;
