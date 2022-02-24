import React, { useEffect, useState } from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControl,
  ScrollView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
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
  datas: any[];
};

interface StaggeredListProps {
  columns: number;
  datas: any[];
  /** Header / footer */
  header?: React.ReactNode | View | React.FC;
  footer?: React.ReactNode | View | React.FC;
  renderItem: (item: any) => React.ReactNode | View | React.FC;
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
    datas: [],
  });

  // 各个高度的测量结果
  const [measureResult, setMeasureResult] = useState<MeasureResult>({
    footer: 0,
    header: 0,
  });
  const [refreshing, setRefreshing] = useState(false);

  /**
   * Header 和 Footer 测量结果发生改变的时候
   * @param key
   * @param value
   */
  const useMeasureResultChanged = (key: keyof MeasureResult, value: any) => {
    const _measureResult = JSON.parse(JSON.stringify(measureResult));
    _measureResult[key] = value;
    setMeasureResult(_measureResult);
  };

  /**
   * 绘制进度或者数据源改变的时候
   * @param key
   * @param value
   */
  const useEffectsChanged = (key: keyof Effects, value: any) => {
    const _effects = JSON.parse(JSON.stringify(effects));
    _effects[key] = value;
    setEffects(_effects);
  };

  useEffect(() => {
    props.onMeasure && props?.onMeasure(measureResult);
    return () => {};
  }, [measureResult]);

  useEffect(() => {
    // views[findMinColumn()].current.push(datas[index]);
    // console.log(`Datas.length: ${props.datas.length}`);
    useEffectsChanged("datas", [...props.datas]);
    return () => {};
  }, [props.datas]);

  useEffect(() => {
    if (effects.datas.length > 0) {
      if (effects.index == effects.datas.length) {
        props?.onLoadComplete && props.onLoadComplete();
      } else {
        let i = effects.index % props.columns;
        let item = effects?.datas[effects.index] ?? null;
        item && views[i].current?.push(item);
        useEffectsChanged("index", effects.index + 1);
      }
    }
    return () => {};
  }, [effects]);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              props.onRefresh && props.onRefresh();
              setEffects({ index: 0, datas: [] });
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
      >
        <Item
          onMeasuredHeight={(height) => {
            useMeasureResultChanged("header", height);
          }}
        >
          {props?.header ?? <View />}
        </Item>
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
        <Item
          onMeasuredHeight={(height) => {
            useMeasureResultChanged("footer", height);
          }}
        >
          {props?.footer ?? null}
        </Item>
      </ScrollView>
    </View>
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
