import React, {
  JSXElementConstructor,
  ReactElement,
  useEffect,
  useState,
} from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
  VirtualizedList,
  RefreshControl
} from "react-native";
import List from "./List";

type Effects = {
  index: number;
  minIndex: number;
  datas: any[];
};

interface StaggeredListProps {
  columns: number;
  datas: any[];
  /** Header / footer */
  header?: ReactElement<any, string | JSXElementConstructor<any>>;
  footer?: ReactElement<any, string | JSXElementConstructor<any>>;
  renderItem: (
    item: any
  ) => ReactElement<any, string | JSXElementConstructor<any>>;
  /** 加载完成 */
  onLoadComplete?: () => void;
  /** 显示纵向滚动条 */
  showsVerticalScrollIndicator?: boolean;
  /** 滑动事件 */
  onScroll?: (e: NativeSyntheticEvent<NativeScrollEvent>) => void;
  /** 刷新 */
  onRefresh?: () => void;
  /** 内容的样式 */
  columnsStyle?: StyleProp<ViewStyle>;
}

const StaggeredList: React.FC<StaggeredListProps> = (props) => {
  // 每一列的 ref
  type ListHandlers = React.ElementRef<typeof List>;
  const views = Array.from({ length: props.columns }, (_, i) =>
    React.useRef<ListHandlers>()
  );

  const [effects, setEffects] = useState<Effects>({
    index: 0,
    minIndex: 0,
    datas: [],
  });

  const [refreshing, setRefreshing] = useState(false);

  const findMinColumn = () => {
    let columnsHeights = Array.from({ length: props.columns }, (_, i) =>
      parseInt(`${views[i].current?.columnHeight()}`)
    );
    let min = Math.min(...columnsHeights);
    let index = columnsHeights.findIndex((it) => it == min);
    return index;
  };

  useEffect(() => {
    // views[findMinColumn()].current.push(datas[index]);
    // console.log(`Datas.length: ${props.datas.length}`);
    /** 每次来一页新的数据，找一下当前的高度最小的列 */
    setEffects({
      index: effects.index,
      datas: props.datas,
      minIndex: findMinColumn(),
    });
    return () => {};
  }, [props.datas]);

  useEffect(() => {
    if (effects.datas.length > 0) {
      if (effects.index == effects.datas.length) {
        props?.onLoadComplete && props.onLoadComplete();
      } else {
        let item = effects?.datas[effects.index] ?? null;
        item && views[effects.minIndex].current?.push(item, effects.index + 1);
        setTimeout(() => {
          setEffects({
            index: effects.index + 1,
            datas: effects.datas,
            /** 默认按照从左到右依次填充，然后等最后剩了 props.columns 个数的时候，由小到大填充 */
            minIndex:
              effects.datas.length - effects.index > props.columns
                ? (effects.minIndex + 1) % props.columns
                : findMinColumn(),
          });
        }, 100);
      }
    }
    return () => {};
  }, [effects]);

  return (
    <VirtualizedList
      data={[""]}
      style={{ flex: 1 }}
      getItemCount={() => 1}
      scrollEventThrottle={100}
      getItem={(datas, index) => datas[index]}
      ListHeaderComponent={props?.header ?? null}
      ListFooterComponent={props?.footer ?? null}
      onScroll={(e) => {
        props.onScroll && props?.onScroll(e);
      }}
      showsVerticalScrollIndicator={
        props?.showsVerticalScrollIndicator ?? false
      }
      keyExtractor={(item, index) => `react-native-staggered-list: ${index}`}
      renderItem={(info) => (
        <View style={[styles.viewColumns, props?.columnsStyle ?? null]}>
          {Array.from({ length: props.columns }, (_, i) => (
            <List
              key={i}
              id={i}
              renderItem={(item) => props.renderItem(item)}
              ref={(ref) => (views[i].current = ref)}
            />
          ))}
        </View>
      )}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            props?.onRefresh && props.onRefresh();
            setEffects({ index: 0, datas: [], minIndex: 0 });
            Array.from({ length: props.columns }, (_, i) =>
              views[i].current.clear()
            );
          }}
        />
      }
    />
  );
};

const styles = StyleSheet.create({
  view: {
    flex: 1,
    alignItems: "center",
  },
  viewColumns: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

export default StaggeredList;
