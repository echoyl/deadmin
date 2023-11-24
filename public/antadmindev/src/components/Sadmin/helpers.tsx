import {
  AccountBookOutlined,
  BarChartOutlined,
  CrownOutlined,
  DashboardOutlined,
  GiftOutlined,
  GlobalOutlined,
  LockOutlined,
  MenuOutlined,
  NodeIndexOutlined,
  QuestionCircleOutlined,
  SettingOutlined,
  ShopOutlined,
  TableOutlined,
  TagOutlined,
  UserOutlined,
  WechatOutlined,
} from '@ant-design/icons';
import {
  MenuDataItem,
  ProBreadcrumb,
  ProColumns,
  ProFormCascader,
  ProFormColumnsType,
  ProRenderFieldPropsType,
  RouteContext,
  getMenuData,
} from '@ant-design/pro-components';
import { useModel, useRouteData } from '@umijs/max';
import { Image } from 'antd';
import { get } from 'rc-util';
import { useContext } from 'react';
import { Link } from 'react-router-dom';
import DebounceSelect from './DebounceSelect';
import { ConfirmRender } from './action/confirm';
import { ConfirmFormRender } from './action/confirmForm';
import CustomerColumnRender from './action/customerColumn';
import CustomerColumnRenderDev, { icons } from './action/customerColumn/dev';
import ModalJson from './action/modalJson';
import CarBrand from './carBrand';
import { isObj, isStr } from './checkers';
import { FormCalendarRender } from './formCalendar';
import { Guiges } from './guige';
import JsonEditor from './jsonEditor';
import JsonForm from './jsonForm';
import { TampShow, TmapInput } from './map/tmap';
import { ModalSelectRender } from './modalSelect';
import SaOptions, { SaEditorTable } from './options';
import { PcaRender, getPca } from './pca';
import PermGroup from './perm/group';
import UserPerm from './perm/user';
import { tableFromBreadRender } from './tableFromBread';
import TinyEditor from './tinyEditor';
import { SaTransferRender } from './transfer';
import Uploader from './uploader';
import AliyunVideo from './uploader/video';
import { wxMenuRender } from './wxMenu';

export function findParents(array, id, fieldNames = { id: 'id', children: 'child' }) {
  let parentArray = [];
  if (array.length === 0) {
    return parentArray;
  }

  function recursion(arrayNew, id) {
    for (let i = 0; i < arrayNew.length; i++) {
      let node = arrayNew[i];
      if (node[fieldNames.id] === id) {
        parentArray.unshift(node[fieldNames.id]);
        recursion(array, node.parent_id);
        break;
      } else {
        if (!!node[fieldNames.children]) {
          recursion(node[fieldNames.children], id);
        }
      }
    }
    return parentArray;
  }
  let arrayNew = array;
  parentArray = recursion(arrayNew, id);
  //console.log(parentArray,id);
  return parentArray;
}

export const iconMap = {
  dashboard: <DashboardOutlined />,
  table: <TableOutlined />,
  setting: <SettingOutlined />,
  questionCircle: <QuestionCircleOutlined />,
  wechat: <WechatOutlined />,
  menu: <MenuOutlined />,
  lock: <LockOutlined />,
  shop: <ShopOutlined />,
  user: <UserOutlined />,
  accountBook: <AccountBookOutlined />,
  global: <GlobalOutlined />,
  tag: <TagOutlined />,
  crown: <CrownOutlined />,
  nodeIndex: <NodeIndexOutlined />,
  barChart: <BarChartOutlined />,
  gift: <GiftOutlined />,
};

export const loopMenuItem = (menus: MenuDataItem[]): MenuDataItem[] =>
  menus.map(({ icon, routes, ...item }) => ({
    ...item,
    icon: icon && iconMap[icon as string],
    routes: routes && loopMenuItem(routes),
  }));
declare type saColumnsExtend = {
  requestParam?: { url?: string; params?: object };
  requestDataName?: string;
  valueEnumDataName?: string;
  columns?: saFormColumnsType;
};
export declare type saValueTypeMapType<T = any, ValueType = 'text'> = ProFormColumnsType<
  T,
  | ValueType
  | 'uploader'
  | 'tinyEditor'
  | 'saEditorTable'
  | 'jsonEditor'
  | 'tmapInput'
  | 'tmapShow'
  | 'pca'
  | 'permGroup'
  | 'userPerm'
  | 'debounceSelect'
  | 'jsonForm'
  | 'carBrand'
  | 'link'
  | 'saFormList'
  | 'saFormTable'
  | 'guigePanel'
  | 'expre'
  | 'confirm'
  | 'modalJson'
  | 'confirmForm'
  | 'modalSelect'
  | 'customerColumn'
  | 'customerColumnDev'
  | 'cdependency'
  | 'wxMenu'
  | 'formCalendar'
  | 'aliyunVideo'
  | 'saTransfer'
  | 'html'
>;
export declare type saFormColumnsType = Array<saValueTypeMapType | saColumnsExtend | string>;
export declare type saTableColumnsType = Array<
  ProColumns | saValueTypeMapType | saColumnsExtend | string
>;
//只有table中渲染才有props.record form中渲染是没有record ,只有当前字段的数据信息
export const saValueTypeMap: Record<string, ProRenderFieldPropsType> = {
  uploader: {
    render: (image, props) => {
      if (typeof image != 'object') {
        image = image ? JSON.parse(image) : [];
      }
      const preview = image.map((file, index) => {
        const [url] = file.url.split('?');
        return url;
      });
      const type = props.fieldProps.type ? props.fieldProps.type : 'image';
      //console.log(image, props);
      return (
        <>
          {type == 'image' ? (
            <Image.PreviewGroup items={preview}>
              {image.map((file, index) => {
                if (!props.fieldProps.max || props.fieldProps.max >= index + 1) {
                  return (
                    <Image width={48} src={file.url} key={file.uid ? file.uid : Math.random()} />
                  );
                }
              })}
            </Image.PreviewGroup>
          ) : (
            image.map((file, index) => {
              if (!props.fieldProps.max || props.fieldProps.max >= index + 1) {
                return (
                  <a href={file.url} target="_blank">
                    {file.name}
                  </a>
                );
              }
            })
          )}
        </>
      );
    },
    renderFormItem: (text, props) => {
      return <Uploader {...props.fieldProps} />;
    },
  },
  aliyunVideo: {
    render: (image, props) => {
      return <>-</>; //列表默认不显示
    },
    renderFormItem: (text, props) => {
      return <AliyunVideo {...props.fieldProps} />;
    },
  },
  saFormTable: {
    render: (text) => {
      console.log('read only');
      return text;
    },
    renderFormItem: tableFromBreadRender,
  },
  wxMenu: {
    render: wxMenuRender,
    renderFormItem: wxMenuRender,
  },
  tinyEditor: {
    render: (text) => text,
    renderFormItem: (text, props) => {
      return <TinyEditor {...props.fieldProps} />;
    },
  },
  guigePanel: {
    render: (text, props) => <Guiges {...props.fieldProps} />,
    renderFormItem: (text, props) => {
      return <Guiges {...props.fieldProps} />;
    },
  },
  saEditorTable: {
    render: (text) => text,
    renderFormItem: (text, props) => {
      return <SaEditorTable {...props.fieldProps} />;
    },
  },
  jsonEditor: {
    render: (text) => text,
    renderFormItem: (text, props) => {
      return <JsonEditor {...props.fieldProps} />;
    },
  },
  tmapInput: {
    render: (text) => text,
    renderFormItem: (text, props) => {
      return <TmapInput {...props.fieldProps} />;
    },
  },
  tmapShow: {
    render: (text) => {
      console.log(text);
      if (isStr(text)) {
        text = text ? JSON.parse(text) : {};
      }
      return <TampShow {...text} />;
    },
  },
  pca: {
    render: (text, props) => {
      //console.log('pca props', props);
      const { fieldProps } = props;
      return <PcaRender text={text} level={fieldProps.level} topcode={fieldProps.topCode} />;
    },
    renderFormItem: (text, props) => {
      // console.log('pca props', props, topCode, props.fieldProps);
      // return <SaPcaRender {...props.fieldProps} />;
      const level = props.fieldProps.level ? props.fieldProps.level : 3;
      const topCode = props.fieldProps.topCode ? props.fieldProps.topCode : '';
      delete props.fieldProps.topCode;
      //console.log('pca props', props, topCode, props.fieldProps);
      if (props.fieldProps.value) {
        if (isJsonString(props.fieldProps.value)) {
          props.fieldProps.value = JSON.parse(props.fieldProps.value);
        }
        if (Array.isArray(props.fieldProps.value)) {
          props.fieldProps.value = props.fieldProps.value.map((v) => parseInt(v));
        }
      }
      return (
        <ProFormCascader
          noStyle
          {...props.fieldProps}
          fieldProps={{ ...props.fieldProps }}
          request={async () => {
            const data = await getPca(level, topCode);
            return data;
          }}
        />
      );
    },
  },
  permGroup: {
    renderFormItem: (text, props) => {
      // console.log('permGroup', props);
      return <PermGroup {...props.fieldProps} />;
    },
    render: (text) => text,
  },
  debounceSelect: {
    renderFormItem: (text, props) => {
      //console.log(props.fieldProps);
      return <DebounceSelect {...props.fieldProps} />;
    },
    render: (text) => {
      console.log(text);
      return <span>{text?.label}</span>;
    },
  },
  jsonForm: {
    renderFormItem: (text, props) => {
      return <JsonForm {...props.fieldProps} />;
    },
    render: (text) => text,
  },
  carBrand: {
    renderFormItem: (text, props) => {
      return <CarBrand {...props.fieldProps} />;
    },
  },
  link: {
    render: (link, props) => {
      if (isObj(link)) {
        return <Link to={link.href}>{link.title}</Link>;
      } else {
        const { fieldProps, record } = props;
        const { path, foreign_key, local_key } = fieldProps;
        if (path) {
          return (
            <Link to={path + '?' + foreign_key + '=' + (local_key ? record[local_key] : link)}>
              {link}
            </Link>
          );
        } else {
          return link;
        }
      }
    },
  },
  expre: {
    render: (_, props) => {
      if (!props.record) {
        props.record = _;
      }

      return tplComplie(props.fieldProps.exp, props);
      //console.log('expre', _, props);
      // const ExpRE = /^\s*\{\{([\s\S]*)\}\}\s*$/;
      // const matched = props.fieldProps.exp.match(ExpRE);
      // if (!matched) return _;

      // return new Function('$root', `with($root) { return (${matched[1]}); }`)(props);
    },
  },
  saFormList: {
    renderFormItem: (text, props) => {
      //console.log('out', props);
      const { fieldProps } = props;
      const name = fieldProps.dataIndex ? fieldProps.dataIndex : fieldProps.id;
      return (
        <SaOptions
          name={name}
          columns={props.columns}
          {...fieldProps}
          //itemprops={{ ...props }}
          //key={Math.random()}
          //initialValue={[...props.fieldProps.value]}
        />
      );
    },
    render: (text) => text,
  },
  //合并到customerColumn组件中使用
  confirm: {
    render: ConfirmRender,
  },
  //合并到customerColumn组件中使用
  confirmForm: {
    render: (_, props) => {
      return <ConfirmFormRender record={props.record} {...props.fieldProps} />;
    },
    renderFormItem: (_, props) => {
      //console.log('confirmForm render', _, props);
      return <ConfirmFormRender {...props.fieldProps} />;
    },
  },
  modalJson: {
    renderFormItem: (text, props) => {
      //console.log('props', props);
      return <ModalJson {...props.fieldProps} />;
    },
    render: (text) => text,
  },
  userPerm: {
    render: (text, props) => {
      return <UserPerm dataId={props.record.id} {...props.fieldProps} />;
    },
  },
  modalSelect: {
    render: ModalSelectRender,
    renderFormItem: ModalSelectRender,
  },
  customerColumn: {
    render: (text, props) => {
      //console.log(props);
      const { fieldProps } = props;
      const { items } = fieldProps;
      return (
        <CustomerColumnRender {...fieldProps} type="table" record={props.record} text={text} />
      );
    },
    renderFormItem: (text, props) => {
      //console.log(props);
      const { fieldProps } = props;
      const { items } = fieldProps;
      return <CustomerColumnRender {...fieldProps} type="form" record={{}} text={text} />;
    },
  },
  customerColumnDev: {
    renderFormItem: CustomerColumnRenderDev,
    render: CustomerColumnRenderDev,
  },
  formCalendar: {
    renderFormItem: FormCalendarRender,
    render: FormCalendarRender,
  },
  saTransfer: {
    render: SaTransferRender,
    renderFormItem: SaTransferRender,
  },
  html: {
    render: (text, props) => {
      return <div dangerouslySetInnerHTML={{ __html: text }}></div>;
    },
  },
};

export const tplComplie = (exp: string | undefined, props: any) => {
  if (!exp) {
    return false;
  }
  const ExpRE = /^\s*\{\{([\s\S]*)\}\}\s*$/;
  const matched = exp.match(ExpRE);
  if (!matched || !matched[1]) return exp;
  try {
    return new Function('$root', `with($root) { return (${matched[1]}); }`)(props);
  } catch (e) {
    console.log('表达式错误，请重写', exp,props);
    return false;
  }
};

export const stateSwitchProps = {
  checkedChildren: '开启',
  unCheckedChildren: '关闭',
  defaultChecked: true,
};

export const boolSwitchProps = {
  checkedChildren: '是',
  unCheckedChildren: '否',
};

export const shenheSwitchProps = {
  checkedChildren: '审核通过',
  unCheckedChildren: '审核中',
};

export function isJsonString(str) {
  try {
    const toObj = JSON.parse(str); // json字符串转对象
    /*
        判断条件 1. 排除null可能性 
                 2. 确保数据是对象或数组
    */
    if (toObj && typeof toObj === 'object') {
      return true;
    }
  } catch {}
  return false;
}

export const isDev = () => {
  const { initialState } = useModel('@@initialState');
  return initialState?.settings.dev;
};

export function log(...data: any) {
  console.log(data);
}

export const getFromObject = (record, dataIndex) => {
  const value = Array.isArray(dataIndex) ? get(record, dataIndex) : record[dataIndex];
  return value;
};

export function search2Obj(unsetNames: string[]): { [key: string]: any } {
  let search = window.location.search;
  if (search) {
    console.log('search is', decodeURIComponent(search));
    search = decodeURIComponent(search);
    let search_arr: { [key: string]: any } = {};
    search
      .substring(1)
      .split('&')
      .forEach((v) => {
        let [key, val] = v.split('=');
        if (!unsetNames?.includes(key)) {
          search_arr[key] = val;
        }
      });

    return search_arr;
    //return parse(search);
  }
  return {};
}

let IDX = 36,
  HEX = '';
while (IDX--) HEX += IDX.toString(36);
export function uid(len?: number) {
  let str = '',
    num = len || 11;
  while (num--) str += HEX[(Math.random() * 36) | 0];
  return str;
}
export const SaBreadcrumbRender = (props) => {
  const { match = false, path } = props;
  const detail = match ? [{ title: '详情' }] : [];
  const value = useContext(RouteContext);
  const { route } = useRouteData();
  const { items: bitem } = value?.breadcrumb;
  let items = bitem ? bitem : [];
  if (!bitem) {
    //没有的话 读取
    const bread = getBread(path);
    if (bread?.data?.names) {
      items = bread?.data?.names;
    } else {
      //还是没有的话读取匹配的路由的name信息
      if (route.name) {
        items = [{ title: route.name }];
      }
    }
  }
  const _items = [...items, ...detail];
  //最外层菜单去除链接
  // _items.map((v, k) => {
  //   if (k < items.length - 1) {
  //     v.linkPath = '';
  //   }
  // });
  return <ProBreadcrumb items={_items} />;
};

export const getBread = (path: string) => {
  if (!path) {
    return null;
  }
  const { initialState } = useModel('@@initialState');
  const { breadcrumb } = getMenuData(initialState?.currentUser?.menuData);

  if (path == '/') {
    //首页默认跳转第一个菜单
    path = initialState?.currentUser?.menuData[0]?.path;
  }

  if (path.substring(0, 1) == '/') {
    path = path.substring(1);
  }
  if (breadcrumb['/' + path]) {
    return breadcrumb['/' + path];
  }
  return null;
};
export const parseIcon = (icon) => {
  if (icon) {
    if (isStr(icon)) {
      if (icons[icon]) {
        return icons[icon];
      } else {
        return null;
      }
    } else {
      return icon;
    }
  }
  return null;
};
