import React from "react";
import ReactDOM from "react-dom";
import App from "./App";

import MyReact from "./react/react_w_hook";
import MyApp from "./myApp";

/*
    自己实现的 hook
    实现功能：useState
            存在问题：由于严格模式下，开发环境的组件会执行两次，目前只支持一个函数组件内多次使用 useState ，不支持多个组件使用
*/
ReactDOM.render(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
	document.getElementById("root1")
);

/*
    自己实现的 react + hook
    实现功能：
        react
            调度
                使用浏览器的 API —— requestIdleCallback() 在浏览器空闲的时候执行构建逻辑
            协调
                采用 fiber 架构，即 vdom 。从 react 的根组件开始(一般是id = "root" 的 div)构建一个 fiber 树保存起来，在下一次渲染时，对比两次的 fiber 树，给树中的每个 fiber 节点添加 'PLACEMENT','DELETION','UPDATE'，即增删改的标记，在渲染阶段根据标记改变真实 dom。
                fiber 树的节点是通过 child, parent, sibling 属性链接起来。
                由于协调和渲染阶段是分开的，给每个 fiber 节点打标记是可中断的循环更新。
            渲染   
                根据标记改变真实 dom。
                改变完之后将这次渲染的 fiber 树保存下来。
        hook
            useState

            useEffect
                先渲染完成再执行回调
                尚未完成：
                    1. 返回一个函数的处理逻辑
                    2. 第二个参数 array 的相关逻辑
                        问题：若有两个 useState 生成的变量，且同为基础类型，值一样，现传给 useEffect 其中一个，如何判断传给 useEffect 的对应的是哪一个变量？
                        接收到的是 [0]

*/
MyReact.render(<MyApp></MyApp>, document.getElementById("root2"));
