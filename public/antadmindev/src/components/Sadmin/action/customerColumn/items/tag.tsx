import { Tag } from 'antd';
import { FC } from 'react';
const ItemsTag: FC<{ color?: string; title?: string }> = (props) => {
  const { color, title } = props;
  return <Tag color={color}>{title}</Tag>;
};

export default ItemsTag;
