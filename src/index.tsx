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
  // 绘制进度
  const [index, setIndex] = useState(0);
  // datas / columnsHeights 更改后 item 的 Push
  const [datas, setDatas] = useState([]);
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

  useEffect(() => {
    props.onMeasure && props?.onMeasure(measureResult);
    return () => {};
  }, [measureResult]);

  useEffect(() => {
    // views[findMinColumn()].current.push(datas[index]);
    // console.log(`Datas.length: ${props.datas.length}`);
    setDatas(JSON.parse(JSON.stringify(props.datas)));
    return () => {};
  }, [props.datas]);

  useEffect(() => {
    // console.log(`ListView 第${index}个 item.`);
    if (datas.length > 0) {
      for (let i = index; i < datas.length; i++) {
        let view = views[i % props.columns].current;
        view && view.push(datas[i]);
      }
      props?.onLoadComplete && props.onLoadComplete();
      setIndex((t) => t + 1);
    }
    // console.log('index: ', index);
    return () => {};
  }, [datas]);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              props.onRefresh && props.onRefresh();
              setIndex(0);
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
