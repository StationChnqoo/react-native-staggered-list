import React, {
  JSXElementConstructor,
  ReactElement,
  useEffect,
  useState,
} from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControl,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
  VirtualizedList,
} from "react-native";
import Item from "./Item";
import List from "./List";

/** Header 和 Footer 的测量结果 */
type MeasureResult = {
  header: number;
  footer: number;
};

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
  /** Header、List、Footer 的测量结果 */
  onMeasure?: (measureResult: MeasureResult) => void;
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

  // 各个高度的测量结果
  const [measureResult, setMeasureResult] = useState<MeasureResult>({
    footer: 0,
    header: 0,
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
    props.onMeasure && props?.onMeasure(measureResult);
    return () => {};
  }, [measureResult]);

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
      style={{ flex: 1 }}
      ListHeaderComponent={
        <Item
          onMeasuredHeight={(h) => {
            setMeasureResult({ header: h, footer: measureResult.footer });
          }}
        >
          {props?.header ?? null}
        </Item>
      }
      ListFooterComponent={
        <Item
          onMeasuredHeight={(h) => {
            setMeasureResult({ header: measureResult.header, footer: h });
          }}
        >
          {props?.footer ?? null}
        </Item>
      }
      data={[""]}
      keyExtractor={(item, index) => `StaggeredList: ${index}`}
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
      getItem={(datas, index) => datas[index]}
      getItemCount={() => 1}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            props.onRefresh && props.onRefresh();
            Array.from({ length: props.columns }, (_, i) =>
              views[i].current.clear()
            );
          }}
        />
      }
      scrollEventThrottle={100}
      onScroll={(e) => {
        props.onScroll && props?.onScroll(e);
      }}
      showsVerticalScrollIndicator={
        props?.showsVerticalScrollIndicator ?? false
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
