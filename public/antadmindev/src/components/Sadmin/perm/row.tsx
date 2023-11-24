import { Checkbox, Col, Row } from 'antd';
import React from 'react';
const PermRow: React.FC<{
  label?: string;
  roleList?: Array<any> | boolean;
  options?: Array<any>;
  checkedList?: Array<string>;
  onChange?: (value: any) => void;
}> = (props) => {
  const { label, roleList = false, options = [], checkedList = [], onChange } = props;
  /**
   * checkbox 点击时触发的事件
   * @param checked 是否选中
   * @param value 选中的值
   * @param realCheckBox 是否是子权限点击 false非点击触发，不如子组件向父组件传递事件时触发该函数
   */
  const valueCheck = (checked: boolean, value: string) => {
    const index = checkedList.indexOf(value);
    //console.log(checked, value, options, index);
    if (checked) {
      if (index < 0) {
        checkedList.push(value);
      }
    } else {
      if (index > -1) {
        checkedList.splice(index, 1);
      }
    }
    onChange?.([...checkedList]);
  };

  return (
    <Row style={{ margin: '10px 0' }}>
      <Col span={3} style={{ textAlign: 'right' }}>
        {label}：
      </Col>
      <Col span={21}>
        <Row>
          {options?.map((_p) => {
            let disabled = roleList && !roleList?.includes(_p.value);
            return (
              <Col span={4} key={_p.value}>
                <Checkbox
                  disabled={disabled}
                  onChange={(e) => {
                    valueCheck(e.target.checked, e.target.value);
                  }}
                  checked={checkedList.includes(_p.value) && !disabled}
                  value={_p.value}
                >
                  {_p.label}
                </Checkbox>
              </Col>
            );
          })}
        </Row>
      </Col>
    </Row>
  );
};
export default PermRow;
