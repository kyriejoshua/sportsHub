## SportsHub(腹肌撕裂打卡 app)

### Required
* node v8.9.4 - webpack v4+ required
* react v16.4.2
* react-router v4.3.1

### Something
* 本意是作为 react-router 库的解读，后来顺带做了一个简易的打卡的 app 并独立了出来, 以日历方式呈现。基于 react-big-calendar, 数据保存在本地。
* UI 库使用了 [wiredelements](https://github.com/wiredjs/wired-elements) 和 [sweetalert](https://sweetalert.js.org/docs/).
* 支持打卡，编辑内容。`shift + enter` 提交。

### TODO
* 一个腹肌撕裂者的教程和内容，放在独立的面板内，显示计划锻炼内容。
    * 高抬腿 30s, 斜腹肌 30, 腿间距 30，平躺高抬腿，左右互搏，瓦坎达 forever, 摸脚脖，踩单车，斜腹肌交叉，V 字体型锻炼，平躺屈伸等。名字是瞎取的。
    * - [ ] 左侧悬浮的导航侧边栏，右边一面竖向显示数据，右边一面显示锻炼内容，一面显示月历。
    * - [x] 拆分项目，独立的项目 sportsHub.
    * - [ ] 新的整体 UI style: [baseweb](https://baseweb.design/components/select/) 不好用，只借鉴，不引入。
* 由于无法同时监听 cmd + enter, 所以目前用 shift + enter 替代。
* 缺少直接写入文件的支持。用 node 实现。

### Usage
* Run `npm start`

### Other

* 由于收到了 `github` 的安全警告，因此将 `webpack-dev-server` 升级至 **3.1.11**. 因为依赖关系， `webpack` 也不得不升至 **4.0.0**. 还添加了 `webpack-cli` 这个依赖。
* 目前当前项目已升级，暂未发现问题。其他项目后续也会升级。
* [原地址，升级后已不可见](https://github.com/kyriejoshua/react-tutorial/network/alert/react-router-deep/package.json/webpack-dev-server/open)
* 处理方案：

  ```javascript
  "dependencies": {
    "webpack-dev-server": ">=3.1.11"
  }
  ```
