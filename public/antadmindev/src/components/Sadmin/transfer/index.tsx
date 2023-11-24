import { App, Transfer } from 'antd';
import { TransferDirection } from 'antd/es/transfer';
import { FC, useContext, useEffect, useState } from 'react';
import { isStr } from '../checkers';
import { SaContext } from '../posts/table';

const SaTransfer: FC<{
  titles?: React.ReactNode[];
  dataSource?: any[];
  selectVerify?: string | ((d: any) => boolean);
  value?: string[] | number[];
  onChange?: (v: any) => void;
  dataName?: string;
}> = (props) => {
  //const [options, setOptions] = useState([]);
  //console.log(compareVersions(version, '4.23.0'));
  const { titles, dataSource, selectVerify, value = [], onChange } = props;

  //const oriTargetKeys = mockData.filter((item) => Number(item.key) % 3 > 1).map((item) => item.key);

  const [targetKeys, setTargetKeys] = useState<string[]>(value.map((v) => v.toString()));
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [disabled, setDisabled] = useState(false);
  const { message } = App.useApp();

  const changeCheck = (
    targetKeys: string[] = [],
    selectedKeys: string[] = [],
    type: 'change' | 'select' = 'change',
  ) => {
    //console.log('all data is ', dataSource, targetKeys, selectedKeys);
    const targets = targetKeys.map((v) => {
      return dataSource?.find((val) => val.key == v);
    });
    const selected = selectedKeys.map((v) => {
      return dataSource?.find((val) => val.key == v);
    });
    const all = [...targets, ...selected];

    if (type == 'select') {
      if (isStr(selectVerify)) {
        return new Function('data', `${selectVerify}`)(all);
      } else if (selectVerify) {
        return selectVerify(all);
      }
    }
    //change暂时不做了
    return true;
  };

  const handleChange = (
    newTargetKeys: string[],
    direction: TransferDirection,
    moveKeys: string[],
  ) => {
    setTargetKeys(newTargetKeys);
    onChange?.(newTargetKeys);
    //const enable = changeCheck(newTargetKeys,[],);
    //setDisabled(!enable);

    // console.log('targetKeys: ', newTargetKeys);
    // console.log('direction: ', direction);
    // console.log('moveKeys: ', moveKeys);
  };

  const handleSelectChange = (sourceSelectedKeys: string[], targetSelectedKeys: string[]) => {
    const enable = changeCheck(sourceSelectedKeys, targetKeys, 'select');
    if (enable !== true) {
      message.info(enable);
      return;
    }

    setSelectedKeys([...sourceSelectedKeys, ...targetSelectedKeys]);

    // console.log('sourceSelectedKeys: ', sourceSelectedKeys);
    // console.log('targetSelectedKeys: ', targetSelectedKeys);
  };

  const handleDisable = (checked: boolean) => {
    setDisabled(checked);
  };

  return (
    <>
      <Transfer
        dataSource={dataSource}
        titles={titles}
        targetKeys={targetKeys}
        selectedKeys={selectedKeys}
        onChange={handleChange}
        onSelectChange={handleSelectChange}
        render={(item) => item.title}
        disabled={disabled}
        oneWay
        style={{ marginBottom: 16 }}
        listStyle={{
          width: 250,
          height: 300,
        }}
      />
    </>
  );
};

const SaTransferMiddle = (props) => {
  const { dataName } = props;
  const [dataSource, setDataSource] = useState<any[]>([]);
  const { formRef } = useContext(SaContext);
  useEffect(() => {
    if (dataName && formRef.current) {
      const d = formRef.current?.getFieldValue?.(dataName);
      console.log('get form value', d);
      setDataSource(d);
    }
  }, [formRef?.current]);
  return dataSource.length > 0 ? <SaTransfer {...props} dataSource={dataSource} /> : null;
};

export const SaTransferRender = (text, props) => {
  //console.log('saFormTable here', props);
  const { fieldProps } = props;

  return <SaTransferMiddle {...fieldProps} />;
};

export default SaTransfer;
