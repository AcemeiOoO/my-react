import ReactDOM from "react-dom";
import App from "./App";

// 保存所有的 state
let stateList = [];

// 已经初始化了 state ，在组件重新渲染时，记录当前需要返回的 state 的下标
let stateIndex = 0;

// 是否是初始化
let isMount = true;

// console.log("js执行");
function useState(defaultValue) {
	// console.log("函数执行");
	let hook;
	if (isMount) {
		// console.log("if内");
		// 初始化，生成 hook ，并保存到 stateList
		hook = {
			state: null, //数据
			setState: () => {}, //修改数据的方法
		};
		hook.state = defaultValue;

		stateList.push(hook);
		stateIndex--;
	} else {
		// console.log("else内");
		// 已经初始化过，从 stateList 取 hook
		hook = stateList[stateIndex];
		stateIndex++;
	}

	hook.setState = (newValue) => {
		console.log("newValue", newValue);
		hook.state = newValue;

		isMount = false;
		// 严格模式下保存了两份数据，此时删除一半。有两个函数组件时会有问题
		if (stateIndex < 0) {
			stateList.splice(0, stateList.length / 2);
		}
		stateIndex = 0;
		// 每次执行完 setState 都应该重新渲染当前组件
		render();
	};

	console.log("stateList", stateList);
	return [hook.state, hook.setState];
}

function useEffect(callback, deps) {
	// dom 更新后执行这个 callback
	// 由于 callback 引用到了外部函数（即函数组件）的变量，形成了闭包，因此可以在此处调用
	console.log("useEffect is running");
	// callback();

	/*
        effect 在每次渲染之后都会执行。
        React 会在组件卸载的时候执行清除操作。
        这就是为什么 React 会在执行当前 effect 之前对上一个 effect 进行清除。
    */
}

function render() {
	ReactDOM.render(<App />, document.querySelector("#root1"));
}

export { useState, useEffect };

/*
react
    定义的是一个 state 变量
*/

// 这种写法也有问题
// let stateLink = null;
// let currentState = null;
// let isMount = true;
// function useState(defaultValue) {
//     // 判断 defaultValue 的数据类型
//     let hook;

//     if (isMount) {
//         hook = {
//             state: null,    //数据
//             setState: () => { }, //修改数据的方法
//             next: null
//         };
//         hook.state = defaultValue;

//         stateLink = stateLink || hook;
//         if (!currentState) {
//             currentState = hook;
//         } else {
//             currentState.next = hook;
//             currentState = hook;
//         }
//     } else {
//         hook = currentState;
//         currentState = currentState.next;
//     }

//     hook.setState = (newValue) => {
//         console.log('newValue', newValue);
//         hook.state = newValue;

//         isMount = false;
//         currentState = stateLink;
//         // 每次执行完 setState 都应该重新渲染当前组件
//         render();
//     };
//     return [hook.state, hook.setState];
// }
