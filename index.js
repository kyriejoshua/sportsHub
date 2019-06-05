import React, {Component} from 'react'
import { render } from 'react-dom'
import AppRouter from './routes/'
import { createBrowserHistory } from 'history'
import './index.css'
const history = createBrowserHistory()

// 对应博客地址: [理解 react-router 中的 history](http://kyriejoshua.github.io/jo.github.io/2018/07/29/understanding-history-with-react-router/)

// 对 `react-router` 的分析，目前准备主要集中在三点
// 1. `history` 的分析
// 2. `react-router` 原理分析
// 3. `react-router` 内部匹配原理
// 这里着重理解 `history`

// `history` v4.6+ 在内部主要导出了三个方法
// `createBrowserHistory`,`createHashHistory`,`createMemoryHistory`
// 它们分别有着自己的作用:
// `createBrowserHistory` 是为现代主流浏览器提供的 api
// `createHashHistory` 是为不支持 `history` 功能的浏览器提供的 api
// `createMemoryHistory` 则是为 `node` 环境提供的 api
// 我们就先从最接地气的 `createBrowserHistory` 也就是我们上文中使用的方法开始看起
/**
 * Creates a history object that uses the HTML5 history API including
 * pushState, replaceState, and the popstate event.
 */
// 在方法开始的注释里，它说明了是基于 H5 的 history 创建对象，对象内包括了一些常用的方法譬如
// `pushState`,`replaceState`,`popstate` 等
// 那么它具体返回了什么内容呢，下面就是它目前所有的方法和属性
// const history = {
//   length: globalHistory.length, // 当前存的历史栈的数量
//   action: "POP",
//   location: initialLocation,
//   createHref,
//   push,
//   replace,
//   go,
//   goBack,
//   goForward,
//   block,
//   listen
// }
// `globalHistory.length` 显而易见是当前存的历史栈的数量。
// `createHref` 根据根路径创建新路径，在根路径上添加原地址所带的 `search`, `pathname`, `path` 参数, 推测作用是将路径简化
// `location` 当前的 `location`, 可能含有以下几个属性。
  // `path` - (string) 当前 `url` 的路径 `path`.
  // `search` - (string) 当前 `url` 的查询参数 `query string`.
  // `hash` - (string) 当前 `url` 的哈希值 `hash`.
  // `state` - - (object) 存储栈的内容。仅存在浏览器历史和内存历史中。
// `block` 阻止浏览器的默认导航。用于在用户离开页面前弹窗提示用户相应内容。[the history docs](https://github.com/ReactTraining/history#blocking-transitions)

// 其中，`go`,`goBack`,`goForward` 是对原生 `history.go` 的简单封装
// 剩下的方法相对复杂些，因此在介绍 `push`, `replace` 等方法之前，先来了解下 `transitionManager`. 因为下面的很多实现，都用到了这个对象所提供的方法

// 首先看下该对象返回了哪些方法：
// const transitionManager = {
//   setPrompt,
//   confirmTransitionTo,
//   appendListener,
//   notifyListeners
// }
// 在后续 `popstate` 相关方法中，它就应用了 `appendListener` 和与之有关的 `notifyListeners` 方法，我们就先从这些方法看起。
// 它们的设计体现了常见的订阅-发布模式，前者负责实现订阅事件逻辑，后者负责最终发布逻辑。
// let listeners = [];
// /**
//  * [description 订阅事件]
//  * @param  {Function} fn [description]
//  * @return {Function}      [description]
//  */
// const appendListener = fn => {
//   let isActive = true;
//   // 订阅事件，做了函数柯里化处理，它实际上相当于运行了 `fn.apply(this, ...args)`
//   const listener = (...args) => {
//     if (isActive) fn(...args);
//   };
//   // 将监听函数一一保存
//   listeners.push(listener);
//   return () => {
//     isActive = false;
//     listeners = listeners.filter(item => item !== listener);
//   };
// };
// /**
//  * [发布逻辑]
//  * @param  {[type]} ..args [description]
//  */
// const notifyListeners = (..args) => {
//   listeners.forEach(listener => listener(..args))
// }

// 介绍了上面两个方法的定义，先别急。后续再介绍它们的具体应用。
// 然后来看看另一个使用的较多的方法 `confirmTransitionTo`.
// const confirmTransitionTo = (
//   location,
//   action,
//   getUserConfirmation,
//   callback
// ) => {
//   if (prompt != null) {
//     const result =
//       typeof prompt === "function" ? prompt(location, action) : prompt;
//     if (typeof result === "string") {
//       if (typeof getUserConfirmation === "function") {
//         getUserConfirmation(result, callback);
//       } else {
//         callback(true);
//       }
//     } else {
//       // Return false from a transition hook to cancel the transition.
//       // 如果已经在执行，则暂时停止执行
//       callback(result !== false);
//     }
//   } else {
//     callback(true);
//   }
// };
// 实际上执行的就是从外部传进来的 `callback` 方法，只是多了几层判断，而且传入了布尔值来控制是否需要真的执行回调函数

// 再然后我们来看看上述方法`appendListener`, `notifyListeners` 的具体应用。前者体现在了 `popstate` 事件的订阅中
// 那么就先简单谈谈 `popstate` 事件
// 当做出浏览器动作时，会触发 `popstate` 事件, 也就是说，`popstate` 本身并不是像 `pushState` 或 `replaceState` 一样是 `history` 的方法
// 不能使用 `history.popState` 这样的方式来调用
// 而且，直接调用 `history.pushState` 或 `history.replaceState` 不会触发 popstate 事件
// 在事件监听方法 `listen` 中涉及了 `popstate` 的使用，在源码中可以看到以下两个方法 `listen` 和 `checkDOMListeners`
// 它们就是上述订阅事件的具体调用方
// 首先自然是初始化
// const transitionManager = createTransitionManager();
// const PopStateEvent = "popstate";
// const HashChangeEvent = "hashchange";

// const checkDOMListeners = delta => {
//   listenerCount += delta;
//   if (listenerCount === 1) {
//     // 其实这里也是最常见最简单的订阅事件
//     window.addEventListener(PopStateEvent, handlePopState);
//     if (needsHashChangeListener)
//       window.addEventListener(HashChangeEvent, handleHashChange);
//   } else if (listenerCount === 0) {
//     window.removeEventListener(PopStateEvent, handlePopState);
//     if (needsHashChangeListener)
//       window.removeEventListener(HashChangeEvent, handleHashChange);
//   }
// };

// /**
//  * [订阅事件的具体调用方]
//  * @param  {Function} listener [description]
//  * @return {Function}          [description]
//  */
// const listen = listener => {
//   // 返回一个解绑函数
//   const unlisten = transitionManager.appendListener(listener);
//   checkDOMListeners(1);
//   // 返回的函数负责取消
//   return () => {
//     checkDOMListeners(-1);
//     unlisten();
//   };
// };
// 简言之，调用 `listen` 就是给 `window` 绑定了相应方法，再次调用之前 `listen` 返回的函数则是取消

// 然后来看看发布事件的具体调用方
// 在该方法中最终发布
// const setState = nextState => {
//   Object.assign(history, nextState);
//   history.length = globalHistory.length;
//   // 执行所有的监听函数
//   transitionManager.notifyListeners(history.location, history.action);
// };

// 下面的方法则应用了 `confirmTransitionTo`.
// `push`, `replace` 是原生方法的扩展，它们都用到了上述方法，都负责实现跳转，因此内部有较多逻辑相同
// 这里以 `push` 为例, 它其实就是对原生的 `history.pushState` 的强化
// const push = (path, state) => {
//   const action = "PUSH";
//   const location = createLocation(path, state, createKey(), history.location);
//   // 过渡方法的应用
//   transitionManager.confirmTransitionTo(
//     location,
//     action,
//     getUserConfirmation,
//     ok => {
//        // 布尔值，用于判断是否需要执行
//       if (!ok) return;
//       const href = createHref(location);
//       const { key, state } = location;
//       // 在支持 history 的地方则使用 history.pushState 方法实现
//       if (canUseHistory) {
//         globalHistory.pushState({ key, state }, null, href);
//       } else {
//         window.location.href = href;
//       }
//     }
//   );
// };

// 这篇文章快完成的时候，我才发现 `react-router` 仓库里是有 `history` 的介绍的
// 此时我一脸茫然，内容虽然不多，却非常值得参考。这里做部分翻译和理解，当作对上文的补充
// [原地址](https://raw.githubusercontent.com/ReactTraining/react-router/master/packages/react-router/docs/api/history.md)
// *`history is mutable`*
// 在原文档中，说明了 `history` 对象是可变的。因此建议在 `react-router` 中获取
// [`location`](https://github.com/ReactTraining/react-router/blob/master/packages/react-router/docs/api/location.md)
// 时可以使用 [`Route`](https://github.com/ReactTraining/react-router/blob/master/packages/react-router/docs/api/Route.md)
// 的 `props` 的方式来替代 `history.location` 的方式
// 这样的方式会确保你的流程处于 React 的生命周期中。例如：
// ```jsx
// class Comp extends React.Component {
//   componentWillReceiveProps(nextProps) {
//     // 正确的打开方式
//     const locationChanged = nextProps.location !== this.props.location

//     // 错误的打开方式，因为 history 是可变的，所以这里总是不等的 // will *always* be false because history is mutable.
//     const locationChanged = nextProps.history.location !== this.props.history.location
//   }
// }

// <Route component={Comp}/>

// 更多内容请查看[the history documentation](https://github.com/ReactTraining/history#properties).
// 在使用方法之前，它首先用几个工具函数做了判断，判断该浏览器是否适用

const App = () => (
  <AppRouter history={history} />
)

render(<App/>, document.body.querySelector('#app'))
