# react-native-staggered-list

基于 `ScrollView` 封装的 `react-native` 可以自己测量 Item 高度的瀑布流组件。

之前看了 `GitHub` 上面几个瀑布流组件的库，基本都是踏 🐴 瞎 🐔 儿扯，还得自己手动传 `View` 的高度。就算是图片的高度后端能返回，前端 `View` 的高度呢，这个还没渲染怎么能拿到？能前端自己搞定的活儿，就不用麻烦后端的同学们。

**觉得有用，路过的各位老铁们右上角的小星星走起来，谢谢。**

![](https://net-cctv3.oss-cn-qingdao.aliyuncs.com/net.cctv3.open/StaggeredListDemo0215.gif)

## 命名规范

整体的设计思想模仿的是 `FlastList`，提供以下内容的自定义。

| Name                         | Type                                                | Description                              |
| :--------------------------- | :-------------------------------------------------- | :--------------------------------------- |
| columns                      | `number`                                            | Size of columns.                         |
| datas                        | `any []`                                            | Data source                              |
| renderItem                   | `(item: any) => React.Node`                         | Render yours custom view.                |
| onLoadComplete               | `() => void`                                        | Datas load completed.                    |
| header                       | `React.Node`                                        | Header view.                             |
| footer                       | `React.Node`                                        | Footer view.                             |
| showsVerticalScrollIndicator | `boolean`                                           | Is showing showsVerticalScrollIndicator. |
| onScroll                     | `(NativeSyntheticEvent<NativeScrollEvent>) => void` | ScrollView native event.                 |
| onMeasure                    | `(MeasureResult) => void`                           | Header、Footer、Columns measured result. |
| onRefresh                    | `() => void`                                        | Refreshed event.                         |
| columnsStyle                 | `StyleProp<ViewStyle>`                              | Columns style                            |

## How to use

```bash
npm install react-native-staggered-list
```

新建了一个空的工程，只修改了下 `App.js`。

```typescript
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { StaggeredList } from "react-native-staggered-list";
import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from "react-native/Libraries/NewAppScreen";
import souls from "./datas/soul.json";

const Section = ({ children, title }) => {
  const isDarkMode = useColorScheme() === "dark";
  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}
      >
        {title}
      </Text>
      <Text
        style={[
          styles.sectionDescription,
          {
            color: isDarkMode ? Colors.light : Colors.dark,
          },
        ]}
      >
        {children}
      </Text>
    </View>
  );
};

const App = () => {
  const isDarkMode = useColorScheme() === "dark";
  const [pageIndex, setPageIndex] = useState(0);
  const [datas, setDatas] = useState([]);

  useEffect(() => {
    let _datas = JSON.parse(JSON.stringify(datas));
    let extra = [];
    for (let i = 0; i < 10; i++) {
      let index = parseInt(`${souls.data.emojiList.length * Math.random()}`);
      let item = souls.data.emojiList[index];
      console.log(item);
      extra.push({
        id: Math.random(),
        page: `第${pageIndex + 1}页`,
        title: `第 ${i + 1} 个 Item`,
        message: item.keyWordList.join("::"),
        image: item.emojiResourceUrl,
      });
    }
    setDatas(_datas.concat(extra));
    return () => {};
  }, [pageIndex]);

  useEffect(() => {
    console.log(new Date(), datas.length);
    return () => {};
  }, [datas]);

  const size = Dimensions.get("screen").width / 3 - 4;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StaggeredList
        columns={3}
        datas={datas}
        renderItem={(item) => {
          // console.log('Using listView renderItem: ', item);
          return (
            <View style={{ padding: 2 }}>
              <View style={{ backgroundColor: "white", borderRadius: 4 }}>
                <Text style={{ fontSize: 16, color: "#333" }}>
                  {item?.title}
                </Text>
                <Text style={{ fontSize: 12, color: "#666" }}>
                  {item?.message}
                </Text>
                <Image
                  source={{ uri: item?.image }}
                  style={{ height: size, width: size }}
                />
              </View>
            </View>
          );
        }}
        onLoadComplete={() => {
          pageIndex < 10 && setPageIndex((t) => t + 1);
        }}
        header={
          <View
            style={{
              backgroundColor: isDarkMode ? Colors.black : Colors.white,
            }}
          >
            <Header />
            <Section title="Step One">
              Edit <Text style={styles.highlight}>App.js</Text> to change this
              screen and then come back to see your edits.
            </Section>
            <Section title="See Your Changes">
              <ReloadInstructions />
            </Section>
            <Section title="Debug">
              <DebugInstructions />
            </Section>
            <Section title="Learn More">
              Read the docs to discover what to do next:
            </Section>
          </View>
        }
        footer={<LearnMoreLinks />}
        onMeasure={(e) => {
          console.log(e);
        }}
        onScroll={(e) => {
          console.log(e.nativeEvent.contentOffset.y);
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "600",
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: "400",
  },
  highlight: {
    fontWeight: "700",
  },
});

export default App;
```

## 实现原理

两种思路：

- 一种就是直接挨个 `index%column` 往里面填充，适合左右两边高度差不多相等的情况。

- 另外一种就是等上一个渲染完了，然后回调完了高度，找出这几列高度最低的一个，然后渲染下一个。

~~ 目前这个组件实现的原理是第二种情况。~~

```javascript
// views[findMinColumn()].current.push(uniteEffects.datas[index.index]);
```

最开始的时候确实用的是第二个思路，但是后来发现一种场景好像不太合适。比如说如果封装一个自动高度的图片组件。他会使目前的 `Item` → `onLayout()` 两次。

> 因为 onLayout() 只要 Item 布局变了，他就会回调。

那么我就要在 `renderItem()` 里面做文章，但是 `Item` 好像拿不到 `props.children` 里面的状态，这就很麻烦。想了很多方法，感觉都不是很好。

代码贴出来:

```js
const Item: React.FC<ItemProps> = (props) => {
  return (
    <View
      onLayout={(layout) => {
        // console.log(layout.nativeEvent.layout);
        layout.nativeEvent.layout.height > 0 &&
          props.onMeasuredHeight(layout.nativeEvent.layout.height);
      }}
    >
      {React.isValidElement(props.children) &&
        React.cloneElement(props.children, {
          nextRender: (next: boolean, height: number) => {
            next && props.onMeasuredHeight(height);
          },
        })}
      {/* {props.children} */}
    </View>
  );
};
```

而且 `Item` 会不断的 `onLayout()` 还会有硬件方面性能的损失，再就是就算是拿到 `renderItem` 里面的状态的话，那也是像老母鸡 🐔 下蛋 🥚 一样，一个一个的渲染，体验上也说不过去。

综上所述，从 `1.4.0` 版本开始，准备使用第一种思路，直接从左到右挨个排列。

## 还需要完善的工作

因为目前项目着急上线，目前暂时能想到的还有以下的内容要做。

- `ScrollView` 里面套 `VirtualList` 是否可行，今天下午试了一把感觉好像是不行，还是会有警告。

- 性能: 这个有时间接着优化，准备长期维护这个项目。

- ~~打包: 目前 `tsx` 只支持 `ts` 項目，我看网上有 `tsc` 和 `webpack` 的配置，能打包输出 `/dist/` 生成 `index.d.ts` 暂时没学会。~~
  - 这个目前不是问题了，因为现在基本绝大多数项目都支持 `ts`。

## 版本更新记录

### Version 1.0.0

🍀 Published react-native-staggered-list，支持分页加载 & Header & Footer 等功能。

- Version 1.0.1
  - 🗑 删除多余依赖。
  - ✍🏻 重命名 `StaggeredListView` → `StaggeredList`。
  - 🛠 更新 README.md。
- Version 1.1.0

  - 🆕 新增原生滑动事件的回调: `onScroll: (NativeSyntheticEvent<NativeScrollEvent>) => void`。

  - 🆕 新增 Header & Columns & Footer 测量高度的回调。

  有了以上这两个事件，就可以在使用的时候，实现 `TabBar` 的渐变以及吸顶效果。

- Version 1.1.1
  - 🐞 修改初始化 `measureResult`，防止 `header` 或者 `footer` 为 `null` 造成的回调参数为空的 BUG。
- Version 1.2.0
  - 🆕 新增下拉刷新功能 `onrefresh: () => void`。
  - 🛠 更新 README.md，添加运行截图，以及示例代码。
- Version 1.2.1
  - 🛠 修改 README.md。
- Version 1.3.0
  - 🆕 新增 `Columns` 样式自定义，可以自己调节 `Header` 和 `Columns` 之间的距离，也可以自己调节 `Columns` 和屏幕两边的边距。
- Version 1.4.0
  - 🗑 移除原来除了测量除了 `header` 和 `footer` 测量的逻辑，直接从左到右每一列挨个填充 `Item`。
