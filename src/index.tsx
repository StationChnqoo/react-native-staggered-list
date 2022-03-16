import React, { JSXElementConstructor, ReactElement } from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
  VirtualizedList,
  RefreshControl,
} from "react-native";
import * as Animatable from "react-native-animatable";

interface StaggeredListProps<ItemT> {
  data: ItemT[];
  numColumns?: number | undefined;
  contentContainerStyle?: StyleProp<ViewStyle>;
  onEndReached?:
    | ((info: { distanceFromEnd: number }) => void)
    | null
    | undefined;
  onEndReachedThreshold?: number | null | undefined;
  onRefresh?: (() => void) | null | undefined;
  onScroll?:
    | ((event: NativeSyntheticEvent<NativeScrollEvent>) => void)
    | undefined;
  refreshing?: boolean | null | undefined;
  removeClippedSubviews?: boolean | undefined;
  scrollEventThrottle?: number | undefined;
  showsVerticalScrollIndicator?: boolean | undefined;
  style?: StyleProp<ViewStyle>;
  ListEmptyComponent?: ReactElement<any, string | JSXElementConstructor<any>>;
  ListHeaderComponent?: ReactElement<any, string | JSXElementConstructor<any>>;
  ListFooterComponent?: ReactElement<any, string | JSXElementConstructor<any>>;
  renderItem: (
    item: ItemT,
    column: number,
    i: number
  ) => ReactElement<any, string | JSXElementConstructor<any>>;
}

/**
 * 泛型的支持
 * 参考: https://stackoverflow.com/questions/59947787/generictype-in-react-fcpropst
 * @param props
 * @returns
 */
const StaggeredList = <ItemT extends {}>(props: StaggeredListProps<ItemT>) => {
  const numColumns = props?.numColumns ?? 2;
  const showsVerticalScrollIndicator =
    props?.showsVerticalScrollIndicator ?? false;
  const removeClippedSubviews = props?.removeClippedSubviews ?? true;
  const onEndReachedThreshold = props?.onEndReachedThreshold ?? 0.2;
  const scrollEventThrottle = props?.scrollEventThrottle ?? 100;

  const defaultProps = {
    showsVerticalScrollIndicator,
    removeClippedSubviews,
    onEndReachedThreshold,
    scrollEventThrottle,
  };
  return (
    <VirtualizedList
      {...defaultProps}
      onScroll={props?.onScroll ?? props.onScroll}
      ListHeaderComponent={props?.ListHeaderComponent ?? null}
      ListEmptyComponent={props?.ListEmptyComponent ?? null}
      ListFooterComponent={props?.ListFooterComponent ?? null}
      data={[""]}
      style={[{ flex: 1 }, props?.style ?? {}]}
      onEndReached={props?.onEndReached && props.onEndReached}
      refreshControl={
        <RefreshControl
          refreshing={props.refreshing ?? false}
          onRefresh={props?.onRefresh && props.onRefresh}
        />
      }
      renderItem={(info) => (
        <View
          style={[
            { flexDirection: "row", justifyContent: "space-around" },
            props?.contentContainerStyle ?? null,
          ]}
        >
          {Array.from({ length: numColumns }, (_, i) => (
            <View
              style={{ width: `${100 / numColumns}%` }}
              key={`Column ${i + 1}`}
            >
              {props.data.map((__, _i) => {
                if (_i % numColumns == i) {
                  return (
                    <Animatable.View
                      useNativeDriver={true}
                      delay={_i * 100}
                      animation={"fadeInDown"}
                      duration={618}
                      key={`Column ${i + 1} --> Datas[${_i}]`}
                    >
                      {props.renderItem(__, i, _i)}
                    </Animatable.View>
                  );
                } else {
                  return null;
                }
              })}
            </View>
          ))}
        </View>
      )}
      keyExtractor={(item, index) => `react-native-miui`}
      getItemCount={(data) => 1}
      getItem={(data, index) => data[index]}
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
