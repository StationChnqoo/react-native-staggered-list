import React, {useEffect, useImperativeHandle, useState} from 'react';
import {View} from 'react-native';
import Item from './Item';

interface ListProps {
  id: number | string;
  useLayoutChanged: (height: number) => void;
  renderItem: (item: any) => React.ReactNode | View | React.FC;
}

type ListHandlers = {
  push: (item: any) => void;
  clear: () => void;
};

const List: React.ForwardRefRenderFunction<ListHandlers, ListProps> = (
  props,
  ref,
) => {
  const [datas, setDatas] = useState([]);
  const [itemsMap, setItemsMap] = useState<any>(Object.create(null));

  useImperativeHandle(ref, () => ({
    push: item => {
      setDatas(_datas => {
        return [..._datas, item];
      });
    },
    clear: () => {
      setDatas([]);
      setItemsMap(Object.create(null));
    },
    // height: () => {
    //   let height = 0;
    //   view.current.measure((x, y, width, height) => {
    //     height = height;
    //   });
    //   return height;
    // },
  }));

  useEffect(() => {
    let keys = Object.keys(itemsMap);
    if (keys.length == datas.length) {
      let sum = 0;
      keys.map(it => {
        sum += itemsMap[it];
      });
      props.useLayoutChanged(sum);
    }
    return () => {};
  }, [itemsMap]);

  // console.log('ListView -> List -> Item', datas);
  return (
    <View style={{flex: 1}}>
      {Array.from(datas, (_, i) => (
        <Item
          key={i}
          onMeasuredHeight={height => {
            /**
             * 以后可以优化的地方
             * 直接用 MeasuredView 套起来，直接算每一列的高度，而不是累加 Item 高度
             */
            let newItems = JSON.parse(JSON.stringify(itemsMap));
            newItems[i] = height;
            setItemsMap(newItems);
          }}>
          {props.renderItem(_)}
        </Item>
      ))}
    </View>
  );
};

export default React.forwardRef(List);
