# react-native-staggered-list

`react-native` 可以自己测量 Item 高度的瀑布流组件。之所以起这个名字，是因为在 `Android` 开发中，官方的 `RecycleView` 有一个瀑布流的 `LayoutManager` 就叫 `Staggered`，因此有了 `StaggeredList`。

因为这一段时间忙着上线，这个组件可能会更新比较慢，如果对你有了帮助，请点击一下右上角的 `Star`，当然如果有什么建议欢迎提 `issues` 和 `pr`。

## 命名规范

整体的设计思想模仿的是 `FlastList`，提供以下内容的自定义。

- columns: `number`

  - 几列。

- datas: `any []`

  - 数据源。

- renderItem: `(item: any) => React.Node`

  - 渲染 Item 的控制权交给开发着自己。

- onCompleted: `() => void`

  - 数据渲染完成的回调，方便分页等业务。

- header: `React.Node`

  - HeaderView。

- footer: `React.Node`

  - FooterView。

- showsVerticalScrollIndicator: `boolean`
  - 是否显示纵向滚动条。

## 实现原理

其实原理比较简单，只是实现的过程比较麻烦。

## 还需要完善的工作

因为目前项目着急上线，目前暂时能想到的还有以下的内容要做。

- `ScrollView` 里面套 `VirtualList` 是否可行，今天下午试了一把感觉好像是不行，还是会有警告。

- 性能:这个有时间接着优化，准备长期维护这个项目。

- 下拉刷新:今天注意到 `ScrollView` 里面也有 `RefreshControl`，下个版本补充上。

- 打包: 目前 `tsx` 只支持 `ts` 項目，我看网上有 `tsc` 和 `webpack` 的配置，能打包输出 `/dist/` 生成 `index.d.ts` 暂时没学会。

## 版本更新记录

### Version 1.0.0

🍀 Published react-native-staggered-list，支持分页加载 & Header & Footer 等功能。
