import request from '@/services/ant-design-pro/sadmin';
import { Form, Select } from 'antd';
import { useEffect, useRef, useState } from 'react';

const CarBrand = (props) => {
  //console.log('cp', props);

  const brandUrl = 'donglifeng/carBrands';

  const fieldNames = { label: 'name', value: 'id', children: 'children' };

  const [brandData, setBrandData] = useState([]);
  const [seriesData, setSeriesData] = useState([]);
  const [typeData, setTypeData] = useState([]);
  const ref = useRef(false);

  const handleBrandChange = (value) => {
    request.get(brandUrl, { params: { type: 1, brandId: value, hasIndex: 1 } }).then((res) => {
      setSeriesData(res?.data);
    });
  };
  const handleSeriesChange = (value) => {
    request.get(brandUrl, { params: { type: 2, seriesId: value } }).then((res) => {
      setTypeData(res?.data);
    });
  };

  useEffect(() => {
    let is = false;
    const getBrand = async () => {
      const { data } = await request.get(brandUrl, { params: { hasIndex: 1 } });
      if (!is) {
        setBrandData(data);
      }
    };

    getBrand();
    return () => {
      is = true;
    };
  }, []);

  const { Option, OptGroup } = Select;
  return (
    <>
      <Form.Item label="车辆品牌选择">
        <Select
          placeholder="请选择车辆品牌"
          onChange={handleBrandChange}
          optionFilterProp="children"
          showSearch
          //fieldNames={fieldNames}
        >
          {brandData?.map((brand) => (
            <OptGroup key={brand.name} label={brand.name}>
              {brand.children.map((opt) => (
                <Option value={opt.id} key={opt.id} label={opt.name}>
                  {opt.name}
                </Option>
              ))}
            </OptGroup>
          ))}
        </Select>
      </Form.Item>

      <Form.Item label="车系选择">
        <Select
          placeholder="请先选择品牌"
          onChange={handleSeriesChange}
          optionFilterProp="children"
          showSearch
          //fieldNames={fieldNames}
        >
          {seriesData.map((brand) => (
            <OptGroup key={brand.name} label={brand.name}>
              {brand.children.map((opt) => (
                <Option value={opt.id} key={opt.id} label={opt.name}>
                  {opt.name}
                </Option>
              ))}
            </OptGroup>
          ))}
        </Select>
      </Form.Item>

      <Form.Item label="车型选择">
        <Select
          placeholder="请先选择品牌车系"
          options={typeData}
          //optionFilterProp="name"
          optionLabelProp="optName"
          fieldNames={fieldNames}
          labelInValue={true}
          {...props}
        />
      </Form.Item>
    </>
  );
};
export default CarBrand;
