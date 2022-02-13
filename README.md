# react-native-staggered-list

基于 `ScrollView` 封装的 `react-native` 可以自己测量 Item 高度的瀑布流组件。

之前看了 `GitHub` 上面的很多瀑布流组件的库，基本都是瞎 🐔 儿扯，还得自己手动传 `View` 的高度。就算是图片的高度后端能返回，前端 `View` 的高度呢，这个还没渲染怎么能拿到？

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

## 实现原理

两种思路：

- 一种就是直接挨个 `index%column` 往里面填充，适合左右两边高度差不多相等的情况。

- 另外一种就是等上一个渲染完了，然后回调完了高度，找出这几列高度最低的一个，然后渲染下一个。

目前这个组件实现的原理是第二种情况。

```javascript
views[findMinColumn()].current.push(uniteEffects.datas[index.index]);
```

## 还需要完善的工作

因为目前项目着急上线，目前暂时能想到的还有以下的内容要做。

- `ScrollView` 里面套 `VirtualList` 是否可行，今天下午试了一把感觉好像是不行，还是会有警告。

- 性能:这个有时间接着优化，准备长期维护这个项目。

- 下拉刷新:今天注意到 `ScrollView` 里面也有 `RefreshControl`，下个版本补充上。

- 打包: 目前 `tsx` 只支持 `ts` 項目，我看网上有 `tsc` 和 `webpack` 的配置，能打包输出 `/dist/` 生成 `index.d.ts` 暂时没学会。

## 版本更新记录

### Version 1.0.0

🍀 Published react-native-staggered-list，支持分页加载 & Header & Footer 等功能。

- Version 1.0.1
  - 🗑 删除多余依赖
  - ✍🏻 重命名 `StaggeredListView` → `StaggeredList`
  - ✍🏻 更新 README.md
- Version 1.1.0

  - 🆕 新增原生滑动事件的回调: `onScroll: (NativeSyntheticEvent<NativeScrollEvent>) => void`

  - 🆕 新增 Header & Columns & Footer 测量高度的回调

  有了以上这两个事件，就可以在使用的时候，实现 `TabBar` 的渐变以及吸顶效果。
