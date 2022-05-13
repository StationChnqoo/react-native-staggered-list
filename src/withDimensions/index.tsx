/**
 * 给了图片尺寸的时候，采用列的最小高度进行填充排列
 * TypeScript
 * https://gist.github.com/Venryx/7cff24b17867da305fff12c6f8ef6f96
 *
 * - 1. 泛型的支持
 * - 2. `tsconfig.json` 支持 [参考 ReadME.md]
 */
import React, {
  ForwardRefExoticComponent,
  JSXElementConstructor,
  ReactElement,
  RefAttributes,
  useEffect,
  useRef,
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

type ScrollToOffset = {
  y: number;
  animated?: boolean;
};

interface WaterfallWithDimensionsProps<ItemT> {
  /**
   * FlastList 规范的 PropTypes，命名都一模一样，功能也一模一样。
   * 请参考: https://www.react-native.cn/docs/flatlist
   */
  data: ItemT[];
  /** 是都允许下拉刷新 */
  bounces?: boolean;
  numColumns?: number | undefined;
  contentContainerStyle?: StyleProp<ViewStyle>;
  onEndReached?: (info: { distanceFromEnd: number }) => void;
  onEndReachedThreshold?: number | null | undefined;
  onRefresh?: () => void;
  onScroll?:
    | ((event: NativeSyntheticEvent<NativeScrollEvent>) => void)
    | undefined;
  refreshing?: boolean;
  removeClippedSubviews?: boolean | undefined;
  scrollEventThrottle?: number | undefined;
  showsVerticalScrollIndicator?: boolean | undefined;
  style?: StyleProp<ViewStyle>;
  ListEmptyComponent?: ReactElement<any, string | JSXElementConstructor<any>>;
  ListHeaderComponent?: ReactElement<any, string | JSXElementConstructor<any>>;
  ListFooterComponent?: ReactElement<any, string | JSXElementConstructor<any>>;
  renderItem: (
    item: ItemT,
    column: number
  ) => ReactElement<any, string | JSXElementConstructor<any>>;
}

interface WaterfallRefProps {
  /** 滚动到指定位置 */
  scrollToOffset: (params: ScrollToOffset) => void;
}

/**
 * 泛型的支持
 * 参考: https://stackoverflow.com/questions/59947787/generictype-in-react-fcpropst
 * @param props
 * @returns
 */

export const WaterfallWithDimensions = React.forwardRef(
  <T extends { dimensions: { height: number; width: number } }>(
    props: WaterfallWithDimensionsProps<T>,
    ref: React.Ref<WaterfallRefProps>
  ) => {
    let waterfall = useRef();
    const {
      data = [],
      bounces = true,
      numColumns = 2,
      showsVerticalScrollIndicator = false,
      removeClippedSubviews = true,
      onEndReachedThreshold = 0.2,
      scrollEventThrottle = 100,
      refreshing = false,
      style,
      contentContainerStyle,
      onRefresh,
      onScroll,
      onEndReached,
      renderItem,
      ListHeaderComponent = null,
      ListFooterComponent = null,
      ListEmptyComponent = null,
    } = props;

    const defaultProps = {
      bounces,
      showsVerticalScrollIndicator,
      removeClippedSubviews,
      onEndReachedThreshold,
      scrollEventThrottle,
      ListHeaderComponent,
      ListFooterComponent,
      ListEmptyComponent,
    };

    React.useImperativeHandle(ref, () => ({
      scrollToOffset: (params: ScrollToOffset) => {
        let { animated = false, y = 0 } = params;
        // @ts-ignore
        waterfall.current.scrollToOffset({ animated, y });
      },
    }));

    const [datas, setDatas] = useState<T[][]>(
      Array.from({ length: numColumns }, (_, i) => [])
    );

    /**
     * 更新 `datas` 前，当前所有列的最短的一列
     * 因为分页的时候，`{data} = props`进来的时候，是一个 `concat(...)` 以后的数组
     * 所以目前的方案是 `data` 一进来，所有的高度重置，重新进行计算
     * @param _datas
     * @returns Math.max(0, index);
     */
    const findMinColumnIndex = (_datas: T[][]) => {
      let sums = Array.from({ length: numColumns }, (_, i) => 0);
      for (let i = 0; i < numColumns; i++) {
        let d = _datas[i];
        for (let j = 0; j < d.length; j++) {
          sums[i] += Math.floor(d[j]?.dimensions?.height ?? 0);
        }
      }
      let min = Math.min(...sums);
      return Math.max(
        sums.findIndex((it) => it == min),
        0
      );
    };

    useEffect(() => {
      let _datas: T[][] = Array.from({ length: numColumns }, (_, i) => []);
      for (let i = 0; i < data.length; i++) {
        let min = findMinColumnIndex(_datas);
        // _datas[min].push(data[i]);
        /** 最小的列添加 `data[i]`，其他列添加 `Object.create(null)` */
        for (let j = 0; j < _datas.length; j++) {
          _datas[j].push(min == j ? data[i] : Object.create(null));
        }
      }
      setDatas(_datas);
      return function () {};
    }, [data]);

    return (
      <VirtualizedList
        {...defaultProps}
        data={["react-native-staggered-list"]}
        // @ts-ignore
        ref={(ref) => (waterfall.current = ref)}
        getItemCount={(data) => 1}
        getItem={(data, index) => data[index]}
        style={[{ flex: 1 }, style]}
        onScroll={onScroll}
        keyExtractor={(item, index) => `react-native-staggered-list`}
        onEndReached={(info) => {
          /**
           * 🐞 有可能刚进来的时候，`props.data` 还没进来，但是他认为已经到达底部了。
           * console.log(`info.distanceFromEnd: ${info.distanceFromEnd}`);
           * info.distanceFromEnd > 16 && props?.onEndReached && props.onEndReached(info)
           */
          data.length > 0 && onEndReached?.(info);
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={(info) => (
          <View style={[{ flexDirection: "row" }, contentContainerStyle]}>
            {Array.from({ length: numColumns }, (_, i) => (
              <View key={`Column ${i + 1}`}>
                {datas[i].map((__, j) => {
                  if (JSON.stringify(__) == "{}") {
                    return null;
                  } else {
                    return (
                      <View key={`Column ${i + 1} --> Datas[${j}]`}>
                        {renderItem(__, j)}
                      </View>
                    );
                  }
                })}
              </View>
            ))}
          </View>
        )}
      />
    );
  }
);

const styles = StyleSheet.create({});

type Handle<T1> = T1 extends ForwardRefExoticComponent<RefAttributes<infer T2>>
  ? T2
  : never;

export type WaterfallWithDimensions = Handle<typeof WaterfallWithDimensions>;
