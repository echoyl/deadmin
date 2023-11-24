import { findParents, SaBreadcrumbRender, search2Obj } from '@/components/Sadmin/helpers';
import { PageContainer } from '@ant-design/pro-components';
//import { PageContainer } from '@ant-design/pro-layout';
import { useSearchParams } from '@umijs/max';
import { Col, Row, Tree } from 'antd';
import Title from 'antd/lib/typography/Title';
import React, { useState } from 'react';
import { saConfig } from '../config';
import './style.less';
import type { saTablePros } from './table';
import SaTable from './table';

const PostsList: React.FC<saTablePros> = (props) => {
  //console.log('props', props);
  const {
    tableTitle = false,
    path,
    leftMenu = {
      name: 'categorys',
      url_name: 'category_id',
      title: '分类选择',
      field: { title: 'label', key: 'value' },
    },
  } = props;
  //const url = 'posts/posts';
  if (leftMenu) {
  }
  // const {
  //   name: categorysName = 'categorys',
  //   title: treeTitle = '分类选择',
  //   url_name: category_id_name = 'category_id',
  //   field: treeFieldNams = { title: 'label', key: 'value' },
  // } = leftMenu;
  const categorysName = leftMenu ? leftMenu.name : '';
  const treeTitle = leftMenu ? leftMenu.title : '';
  const category_id_name = leftMenu ? leftMenu.url_name : '';
  const treeFieldNams = leftMenu ? leftMenu.field : false;

  const [categorys, setCategorys] = useState([]);

  //const setUrlSearch = useUrlSearchParams({}, { disabled: false })[1];
  const [searchParams, setUrlSearch] = useSearchParams();

  //const query = usep();
  //console.log(searchParams, 333);
  const searchCategoryId = searchParams.get(category_id_name);
  const [category_id, setKey] = useState(
    searchCategoryId
      ? isNaN(searchCategoryId)
        ? searchCategoryId
        : parseInt(searchCategoryId)
      : 0,
  );
  //let location = useLocation();
  const [expandedKeys, setExpandedKeys] = useState([]);
  // useEffect(() => {
  //   request.get(url).then((ret) => {
  //     setCategorys([...ret.search.categorys]);
  //     //获取分类父级路径
  //     //console.log(category_id, 222);
  //     if (category_id.length > 0 && expandedKeys.length < 1) {
  //       const category_parent_keys = findParents(ret.search.categorys, category_id[0], {
  //         id: 'value',
  //         children: 'children',
  //       });
  //       console.log(category_parent_keys, 111);
  //       setExpandedKeys(category_parent_keys);
  //     }
  //   });
  // }, []);
  //log('categorys',categorys);
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
      <Row gutter={[24, 16]} style={categorys.length > 1 ? { marginLeft: 0, marginRight: 0 } : {}}>
        {categorys.length > 1 && (
          <Col span={3} title={treeTitle} style={{ background: '#fff', paddingTop: 20 }}>
            <Title level={5}>{treeTitle}</Title>
            <Tree
              selectedKeys={[category_id]}
              expandedKeys={expandedKeys}
              treeData={categorys}
              fieldNames={treeFieldNams}
              onSelect={(keys) => {
                let key = 0;
                if (keys.length > 0) {
                  key = keys.pop();
                }
                setKey(key);
                let url_search_obj = search2Obj([category_id_name]);
                if (key) {
                  url_search_obj[category_id_name] = key + '';
                }
                setUrlSearch({ ...url_search_obj });
              }}
              onExpand={(keys) => {
                setExpandedKeys(keys);
              }}
            />
          </Col>
        )}
        <Col span={categorys.length > 1 ? 21 : 24}>
          <SaTable
            {...props}
            paramExtra={
              category_id
                ? {
                    ...props.paramExtra,
                    [category_id_name]: category_id,
                  }
                : { ...props.paramExtra }
            }
            beforeTableGet={(ret) => {
              if (!leftMenu) {
                return;
              }
              if (categorys.length > 0 || !ret.search?.[categorysName]) {
                return;
              }

              //开始左侧菜单才设置数据
              setCategorys([...ret.search[categorysName]]);

              //获取分类父级路径
              if (category_id && expandedKeys.length < 1) {
                const category_parent_keys = findParents(ret.search[categorysName], category_id, {
                  id: 'value',
                  children: 'children',
                });
                console.log(category_parent_keys, 111);
                setExpandedKeys(category_parent_keys);
              }
            }}
            tableProps={
              props.tableProps
              // ? props.tableProps
              // : {
              //     tableRender: (_, dom) => (
              //       <>
              //         <div
              //           style={{
              //             height: 16,
              //             width: '100%',
              //             backgroundColor: 'transparent',
              //           }}
              //         ></div>
              //         {dom}
              //       </>
              //     ),
              //   }
            }
          />
        </Col>
      </Row>
    </PageContainer>
  );
};

export default PostsList;
