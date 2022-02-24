import React, { useImperativeHandle, useState } from "react";
import { View } from "react-native";

interface ListProps {
  id: number | string;
  renderItem: (item: any) => React.ReactNode | View | React.FC;
}

type ListHandlers = {
  push: (item: any) => void;
  clear: () => void;
};

const List: React.ForwardRefRenderFunction<ListHandlers, ListProps> = (
  props,
  ref
) => {
  const [datas, setDatas] = useState([]);

  useImperativeHandle(ref, () => ({
    push: (item) => {
      setDatas((_datas) => {
        return [..._datas, item];
      });
    },
    clear: () => {
      setDatas([]);
    },
  }));

  return (
    <View style={{ flex: 1 }}>
      {Array.from(datas, (_, i) => (
        <View key={i}>{props.renderItem(_)}</View>
      ))}
    </View>
  );
};

export default React.forwardRef(List);
