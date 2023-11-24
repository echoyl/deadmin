import request from '@/services/ant-design-pro/sadmin';
import { AreaMap } from '@ant-design/maps';
import { useEffect, useState } from 'react';

const DemoAreaMap = () => {
  const [data, setData] = useState({ type: 'FeatureCollection', features: [] });

  useEffect(() => {
    asyncFetch();
  }, []);

  const asyncFetch = () => {
    request
      .get('test')
      .then((json) => setData(json))
      .catch((error) => {
        console.log('fetch data failed', error);
      });
  };
  const config = {
    map: {
      type: 'mapbox',
      style: 'blank',
      center: [120.19382669582967, 30.258134],
      zoom: 13,
      pitch: 0,
    },
    source: {
      data: data,
      parser: {
        type: 'geojson',
      },
    },
    autoFit: true,
    color: {
      field: 'unit_price',
      value: ['#1A4397', '#3165D1', '#6296FE', '#98B7F7', '#DDE6F7', '#F2F5FC'].reverse(),
      scale: {
        type: 'quantile',
      },
    },
    style: {
      opacity: 1,
      stroke: '#fff',
      lineWidth: 0.8,
      lineOpacity: 1,
    },
    state: {
      active: true,
      select: {
        stroke: 'yellow',
        lineWidth: 1.5,
        lineOpacity: 0.8,
      },
    },
    label: {
      visible: true,
      field: 'name',
      style: {
        fill: 'black',
        opacity: 0.5,
        fontSize: 12,
        spacing: 1,
        padding: [15, 15],
      },
    },
    tooltip: {
      //items: ['name', 'unit_price'],
      items: [
        {
          field: 'name',
          alias: '省份',
        },
        {
          field: 'unit_price',
          alias: '价格',
        },
      ],
    },

    zoom: {
      position: 'bottomright',
    },
    legend: {
      position: 'bottomleft',
    },
  };

  return <AreaMap {...config} />;
};

export default DemoAreaMap;
