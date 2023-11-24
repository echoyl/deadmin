import { PageContainer } from '@ant-design/pro-components';
import React, { useState } from 'react';
import { saConfig } from '../config';
import { SaBreadcrumbRender } from '../helpers';
import './style.less';
import type { saTablePros } from './table';
import SaTable from './table';
type CategoryProps = {
  expandAll?: boolean;
} & saTablePros;

const Category: React.FC<CategoryProps> = (props) => {
  //console.log(url);
  const [ekeys, setEkeys] = useState<number[]>([]);
  const { tableProps: tp = {} } = props;
  const defaultProps = {
    level: 1,
    openType: 'drawer',
    tableColumns: ['id', 'title', 'displayorder', 'created_at', 'state', 'option'],
    formColumns: ['title', 'displayorder', 'state', 'parent_id'],
    expandAll: true,
    labels: { title: '名称', created_at: '创建时间' },
    ...props,
  };
  //console.log('props', props);
  const { tableTitle = false, expandAll = true, path } = props;

  const tableProps = {
    search: false,
    columnsState: {
      persistenceKey: 'pro-table-singe-demos',
      persistenceType: 'localStorage',
    },
    pagination: false,
    dateFormatter: 'string',
    expandable: {
      expandedRowKeys: ekeys,
      onExpand: (is, record) => {
        if (is) {
          ekeys.push(record.id);
          setEkeys(ekeys);
        } else {
          const index = ekeys.findIndex((k) => k == record.id);
          if (index > -1) {
            ekeys.splice(index, 1);
            setEkeys(ekeys);
          }
        }
      },
    },
    ...tp,
  };

  return (
    <PageContainer
      title={tableTitle}
      className="saContainer"
      fixedHeader={saConfig.fixedHeader}
      header={{
        breadcrumbRender: (_, dom) => {
          return <SaBreadcrumbRender path={path} />;
        },
      }}
    >
      <SaTable
        {...defaultProps}
        beforeTableGet={(ret) => {
          const keys: number[] = [];
          const render = (sdata: any[], t_level: number = 0) => {
            //console.log(sdata);
            sdata.forEach((item) => {
              item._level = t_level;
              if (item.children) {
                //console.log(item.id);
                keys.push(item.id);
                render(item.children, t_level + 1);
              }
            });
          };
          render(ret.data);
          //console.log(keys);
          if (expandAll) {
            setEkeys(keys);
          }
          if (props.beforeTableGet) {
            props.beforeTableGet(ret);
          }
        }}
        tableProps={tableProps}
      />
    </PageContainer>
  );
};

export default Category;
