import React from 'react';
import {StyleSheet, View} from 'react-native';

export interface ItemProps {
  onMeasuredHeight: (height: number) => void;
}

const Item: React.FC<ItemProps> = props => {
  return (
    <View
      onLayout={layout => {
        // console.log(layout.nativeEvent.layout);
        layout.nativeEvent.layout.height > 0 &&
          props.onMeasuredHeight(layout.nativeEvent.layout.height);
      }}>
      {props.children}
    </View>
  );
};

const defaultStyles = StyleSheet.create({});

export default Item;
