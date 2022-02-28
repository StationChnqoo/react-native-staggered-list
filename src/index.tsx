import { useDebounceEffect } from "ahooks";
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
  RefreshControl,
  PanResponder,
  PanResponderInstance,
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
  const [r, setR] = useState<number>(0);

  /** 手势响应 */
  let responder: PanResponderInstance = PanResponder.create({});
  const [effects, setEffects] = useState<Effects>({
    index: 0,
    minIndex: 0,
    datas: [],
  });

  const findMinColumn = () => {
    let columnsHeights = Array.from({ length: props.columns }, (_, i) =>
      parseInt(`${views[i].current?.columnHeight()}`)
    );
    let min = Math.min(...columnsHeights);
    let index = columnsHeights.findIndex((it) => it == min);
    return index;
  };

  /** 每次来一页新的数据，找一下当前的高度最小的列。 */
  useEffect(() => {
    setEffects({
      index: effects.index,
      datas: props.datas,
      minIndex: findMinColumn(),
    });
    return () => {};
  }, [props.datas]);

  /** 从 Refresh 就杜绝反复下拉刷新，不进行回调 */
  useDebounceEffect(
    () => {
      if (r > 0) {
        props?.onRefresh && props.onRefresh();
        setEffects({ index: 0, datas: [], minIndex: 0 });
        Array.from({ length: props.columns }, (_, i) =>
          views[i].current.clear()
        );
      }
      return () => {};
    },
    [r],
    { leading: true, trailing: false, wait: 5000 }
  );

  useEffect(() => {
    if (effects.datas.length > 0) {
      if (effects.index == effects.datas.length) {
        props?.onLoadComplete && props.onLoadComplete();
      } else {
        let item = effects?.datas[effects.index] ?? null;
        item && views[effects.minIndex].current?.push(item, effects.index + 1);
        setTimeout(
          () => {
            setEffects({
              index: effects.index + 1,
              datas: effects.datas,
              /** 这部分用户不可见的时候，可以容错处理。 */
              minIndex:
                effects.datas.length - effects.index >= 2 * props.columns
                  ? (effects.minIndex + 1) % props.columns
                  : findMinColumn(),
            });
          },
          effects.datas.length - effects.index > props.columns ? 100 : 1000
        );
      }
    }
    return () => {};
  }, [effects]);

  return (
    <VirtualizedList
      {...responder.panHandlers}
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
          refreshing={false}
          onRefresh={() => {
            setR(Math.random());
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
