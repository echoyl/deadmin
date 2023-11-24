import request from '@/services/ant-design-pro/sadmin';
import { Calendar, CalendarProps } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { useEffect, useState } from 'react';
import ButtonModal from '../action/buttonModal';
import FormFromBread from '../formFromBread';
import { getBread } from '../helpers';

const FormCalendar: React.FC<{
  width?: number;
  title?: string;
  url?: string;
  data?: { [key: string]: any };
  defaultContent?: string;
  onlyFuture?: boolean; //是否只有未来日期可选
  path?: string;
}> = (props) => {
  const [open, setOpen] = useState(false);
  const [selectMonth, setSelectMonth] = useState<string>();
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [selectDate, setSelectDate] = useState<string>();
  const onSelect = (date: Dayjs, { source }) => {
    //弹出配置form
    const value = date.format('YYYY-MM-DD');
    const now = dayjs().format('YYYY-MM-DD');
    if (source === 'date') {
      if (onlyFuture && value < now) {
        return;
      }
      setOpen(true);
      setSelectDate(value);
    }
  };

  const {
    width = 800,
    title = '日历设置 - 单独设置日期后，会覆盖通用设置值',
    defaultContent = '-',
    onlyFuture = true,
    path = '',
  } = props;
  const bread = getBread(path);
  const url = bread?.data?.url ? bread?.data.url : '';
  //这里可能需要再抽一层 ButtonModalForm 出来
  const [allData, setAllData] = useState<Array<Record<string, any>>>();

  const initData = async (params?: { [key: string]: any }) => {
    if (!url) {
      return;
    }
    const ret = await request.get(url, { params: { ...params, month: selectMonth } });
    setAllData(ret.data);
  };

  useEffect(() => {
    initData();
  }, [selectMonth]);

  const getListData = (value: Dayjs): Record<string, any> | undefined => {
    const date = value.format('YYYY-MM-DD');
    const content = allData?.find((v) => v.date == date);
    return content ? content : { content: defaultContent };
  };

  const dateCellRender = (value: Dayjs) => {
    const listData = getListData(value);
    return <div dangerouslySetInnerHTML={{ __html: listData?.content }}></div>;
  };

  const cellRender: CalendarProps<Dayjs>['cellRender'] = (current, info) => {
    if (info.type === 'date') return dateCellRender(current);
    return info.originNode;
  };

  const onChange = (value: Dayjs) => {
    const month = value.format('YYYY-MM');
    setSelectMonth(month);
  };

  return (
    <>
      <Calendar onSelect={onSelect} cellRender={cellRender} onPanelChange={onChange} />
      <ButtonModal
        open={open}
        width={width}
        title={title}
        afterOpenChange={(open) => {
          setOpen(open);
        }}
      >
        <FormFromBread
          fieldProps={{
            path,
            props: {
              paramExtra: { date: selectDate },
              postExtra: { date: selectDate },
              formProps: {
                submitter: {
                  searchConfig: { resetText: '取消' },
                  resetButtonProps: {
                    onClick: () => {
                      setOpen?.(false);
                    },
                  },
                },
              },
              msgcls: ({ code }) => {
                //setConfirmLoading(false);
                if (!code) {
                  //actionRef.current?.reload();
                  //设置弹出层关闭，本来会触发table重新加载数据后会关闭弹层，但是如果数据重载过慢的话，这个会感觉很卡所以在这里直接设置弹层关闭
                  setOpen(false);
                  initData();
                  return;
                }
              },
            },
          }}
        />
      </ButtonModal>
    </>
  );
};

export const FormCalendarRender = (text, props) => {
  console.log(props);
  return <FormCalendar {...props.fieldProps} />;
};

export default FormCalendar;
