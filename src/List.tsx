import React, { useEffect, useImperativeHandle, useRef, useState } from "react";
import { Text, View } from "react-native";
import Item from "react-native-staggered-list/src/Item";

interface ListProps {
  id: number | string;
  renderItem: (item: any) => React.ReactNode | View | React.FC;
}

type ListHandlers = {
  push: (item: any, index: number) => void;
  clear: () => void;
  columnHeight: () => number;
};

const List: React.ForwardRefRenderFunction<ListHandlers, ListProps> = (
  props,
  ref
) => {
  const [datas, setDatas] = useState([]);
  const [sum, setSum] = useState(Object.assign({}));
  const [indexes, setIndexes] = useState([]);

  useImperativeHandle(ref, () => ({
    push: (item, index) => {
      setDatas((_datas) => {
        return [..._datas, item];
      });
      setIndexes(indexes.concat(index));
    },
    clear: () => {
      setDatas([]);
      setIndexes([]);
      setSum(Object.create(null));
    },
    columnHeight: () => {
      let s = 0;
      for (let key in sum) {
        s += sum[key];
      }
      return s;
    },
  }));

  return (
    <View style={{ flex: 1 }}>
      {Array.from(datas, (_, i) => (
        <View style={{ position: "relative" }}>
          <Item
            onMeasuredHeight={(h) => {
              let _sum = JSON.parse(JSON.stringify(sum));
              _sum[i] = h;
              setSum(_sum);
            }}
            key={i}
          >
            {props.renderItem(_)}
          </Item>
          {/* <Text
            style={{
              color: "#FF5252",
              bottom: 16,
              right: 16,
              position: "absolute",
            }}
          >
            {indexes[i]}
          </Text> */}
        </View>
      ))}
    </View>
  );
};

export default React.forwardRef(List);
