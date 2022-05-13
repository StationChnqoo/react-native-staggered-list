import React, {
  JSXElementConstructor,
  ReactElement,
  useImperativeHandle,
  useState,
} from "react";
import { VirtualizedList } from "react-native";
import Item from "./Item";

interface ListProps {
  id: number | string;
  onEndReached: () => void;
  renderItem: (
    item: any
  ) => ReactElement<any, string | JSXElementConstructor<any>>;
}

type ListHandlers = {
  clear: () => void;
  columnHeight: () => number;
  push: (item: any, index: number) => void;
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
    <VirtualizedList
      data={datas}
      scrollEventThrottle={100}
      listKey={`Columns: ${props.id}`}
      getItemCount={() => datas.length}
      getItem={(datas, index) => datas[index]}
      onEndReached={() => {
        props.onEndReached();
      }}
      keyExtractor={(item, index) => `Item: ${indexes[index]}`}
      renderItem={(item) => (
        <Item
          onMeasuredHeight={(h) => {
            let _sum = JSON.parse(JSON.stringify(sum));
            _sum[item.index] = h;
            setSum(_sum);
          }}
          key={item.index}
        >
          {props.renderItem(item.item)}
        </Item>
      )}
    />
  );
};

export default React.forwardRef(List);
