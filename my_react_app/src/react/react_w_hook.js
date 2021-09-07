/*
	处理了函数组件
	函数组件的 fiber 无 dom 属性
*/

// 创建 dom 元素对象
function createElement(type, props, ...children) {
	return {
		type,
		props: {
			...props,
			children: children.map((child) =>
				typeof child === "object" ? child : createTextElement(child)
			),
		},
	};
}

// 创建文本 dom 元素对象
function createTextElement(text) {
	return {
		type: "TEXT_ELEMENT",
		props: {
			nodeValue: text,
			children: [],
		},
	};
}

function createDom(fiber) {
	const dom =
		fiber.type === "TEXT_ELEMENT"
			? document.createTextNode("")
			: document.createElement(fiber.type);

	updateDom(dom, {}, fiber.props);

	return dom;
}

const isEvent = (key) => key.startsWith("on");
// dom 的属性
const isProperty = (key) => key !== "children" && !isEvent(key);
// 用在新 dom ，筛选出所有新 dom 有，旧 dom 没有；新旧 dom 都有，但不相等的属性（即要在旧 dom 上更新的属性）
const isNew = (prev, next) => (key) => prev[key] !== next[key];
// 用在旧 dom ，筛选出所有不在新 dom 中的属性
const isGone = (prev, next) => (key) => !(key in next);
function updateDom(dom, prevProps, nextProps) {
	//移除旧的或有变化的事件
	Object.keys(prevProps)
		.filter(isEvent)
		.filter((key) => !(key in nextProps) || isNew(prevProps, nextProps)(key))
		.forEach((name) => {
			const eventType = name.toLowerCase().substring(2);
			dom.removeEventListener(eventType, prevProps[name]);
		});
	// 移除旧的属性
	Object.keys(prevProps)
		.filter(isProperty)
		.filter(isGone(prevProps, nextProps))
		.forEach((name) => {
			dom[name] = "";
		});

	// 添加新的或有变化的属性
	Object.keys(nextProps)
		.filter(isProperty)
		.filter(isNew(prevProps, nextProps))
		.forEach((name) => {
			dom[name] = nextProps[name];
		});
	// 添加新的事件
	Object.keys(nextProps)
		.filter(isEvent)
		.filter(isNew(prevProps, nextProps))
		.forEach((name) => {
			const eventType = name.toLowerCase().substring(2);
			dom.addEventListener(eventType, nextProps[name]);
		});
}

// 将 fiber 树添加进真实 dom
function commitRoot() {
	deletions.forEach(commitWork);
	commitWork(wipRoot.child);
	currentRoot = wipRoot;
	// console.log("currentRoot", currentRoot);
	wipRoot = null;
	effectCallback.forEach((func) => func());
	effectCallback = [];
}
function commitWork(fiber) {
	if (!fiber) {
		return;
	}

	// 函数组件的 fiber 没有 dom ，因此需要向上查找
	let domParentFiber = fiber.parent;
	while (!domParentFiber.dom) {
		domParentFiber = domParentFiber.parent;
	}
	const domParent = domParentFiber.dom;

	if (fiber.effectTag === "PLACEMENT" && fiber.dom != null) {
		// console.log("添加节点");
		domParent.appendChild(fiber.dom);
	} else if (fiber.effectTag === "UPDATE" && fiber.dom != null) {
		// console.log("更新节点");
		updateDom(fiber.dom, fiber.alternate.props, fiber.props);
	} else if (fiber.effectTag === "DELETION") {
		// console.log("删除节点");
		commitDeletion(fiber, domParent);
	}
	commitWork(fiber.child);
	commitWork(fiber.sibling);
}

function commitDeletion(fiber, domParent) {
	if (fiber.dom) {
		// 当前 fiber 有 dom
		domParent.removeChild(fiber.dom);
	} else {
		// 当前 fiber 无 dom ，是一个函数组件
		// 要删除的真实 dom 在后代里
		commitDeletion(fiber.child, domParent);
	}
}

// 构建 fiber 树
// fiber 架构采用的是深度优先遍历
function render(element, container) {
	// console.log("执行render");
	// 构建根 fiber
	wipRoot = {
		dom: container,
		props: {
			// jsx 编译之后的结果， element 是一个有 type 和 props 属性的对象
			children: [element],
		},
		alternate: currentRoot,
	};
	deletions = [];
	nextUnitOfWork = wipRoot;
}

// 下一次要执行的任务
let nextUnitOfWork = null;
// 指向上一次构建的 fiber 树
let currentRoot = null;
// 相当于一个头指针指向当前构建的 fiber 树的根 fiber
let wipRoot = null;
let deletions = null;

function workLoop(deadline) {
	// console.log("执行 loop");
	// 根据空余时间判断当前是否要中断循环
	let shouldYield = false;

	// 循环执行任务
	while (nextUnitOfWork && !shouldYield) {
		// console.log("执行任务");
		nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
		shouldYield = deadline.timeRemaining() < 1;
	}

	if (!nextUnitOfWork && wipRoot) {
		// 渲染
		commitRoot();
	}

	requestIdleCallback(workLoop);
}

// requestIdleCallback 是浏览器的 API ，会在浏览器空闲的时候被调用。
//      但其兼容性不好，且触发频率不稳定
// 现在用 scheduler
requestIdleCallback(workLoop);

// 执行任务，并返回下一次要执行的任务
function performUnitOfWork(fiber) {
	// 通过 createElement 创建的节点的类型，是 Function 则说明传进来的是函数组件
	const isFunctionComponent = fiber.type instanceof Function;

	// console.log("fiber", fiber);
	if (isFunctionComponent) {
		updateFunctionComponent(fiber);
	} else {
		updateHostComponent(fiber);
	}

	// 返回下一次执行的 fiber 节点
	if (fiber.child) {
		return fiber.child;
	}
	let nextFiber = fiber;
	while (nextFiber) {
		if (nextFiber.sibling) {
			return nextFiber.sibling;
		}
		nextFiber = nextFiber.parent;
	}
}

let hookFiber = null;
let hookIndex = null;

// 函数组件，有 props
function updateFunctionComponent(fiber) {
	// console.log("函数组件", fiber);
	hookFiber = fiber;
	hookIndex = 0;
	hookFiber.hooks = [];

	// 如何获取父组件的 props ？
	// fiber.type 是一个函数，将父组件的 props 当作参数传入函数组件
	const children = [fiber.type(fiber.props)];
	reconcileChildren(fiber, children);
}
// 普通组件，无 props 和 state
function updateHostComponent(fiber) {
	// console.log("普通组件", fiber);
	if (!fiber.dom) {
		// 此时虽然创建了 dom 元素，但并未添加进页面，是在渲染的时候一起添加进页面的
		fiber.dom = createDom(fiber);
	}
	// fiber.props.children 是一个对象数组，对象有 type 和 props 属性
	reconcileChildren(fiber, fiber.props.children);
}

function reconcileChildren(wipFiber, elements) {
	let index = 0;
	// 传过来的 elements 是根 fiber 的 children
	let oldFiber = wipFiber.alternate && wipFiber.alternate.child;
	let prevSibling = null;

	while (index < elements.length || oldFiber != null) {
		const element = elements[index];

		let newFiber = null;

		const sameType = oldFiber && element && element.type === oldFiber.type;
		if (sameType) {
			// 更新节点
			newFiber = {
				type: oldFiber.type,
				props: element.props,
				dom: oldFiber.dom,
				parent: wipFiber,
				alternate: oldFiber,
				effectTag: "UPDATE",
			};
		}
		if (element && !sameType) {
			// 增加节点
			newFiber = {
				type: element.type,
				props: element.props,
				dom: null,
				parent: wipFiber,
				alternate: null,
				effectTag: "PLACEMENT",
			};
		}
		if (oldFiber && !sameType) {
			// 删除 oldFiber 的节点
			oldFiber.effectTag = "DELETION";
			deletions.push(oldFiber);
		}

		if (oldFiber) {
			oldFiber = oldFiber.sibling;
		}

		if (index === 0) {
			// 当前 fiber 是第一个孩子
			// 将父 fiber 的 child 属性指向当前 fiber
			wipFiber.child = newFiber;
		} else if (element) {
			// 当前 fiber 不是第一个孩子
			// 将上一个孩子的 sibling 指向当前 fiber
			prevSibling.sibling = newFiber;
		}
		prevSibling = newFiber;
		index++;
	}
}

// 函数组件根 fiber 构建完成后就会执行
// 再接着构建后面的 fiber
function useState(initial) {
	// hookFiber 指向函数组件，会被下一个函数组件的 fiber 覆盖
	// 覆盖掉也没关系，因为函数内的所有 hook 保存在函数 fiber 的 hook 属性中
	// console.log("hookFiber", hookFiber);
	const oldHook =
		hookFiber &&
		hookFiber.alternate &&
		hookFiber.alternate.hooks &&
		hookFiber.alternate.hooks[hookIndex];
	// console.log("oldHook", oldHook);
	const hook = {
		state: oldHook ? oldHook.state : initial,
		queue: [],
	};

	const actions = oldHook ? oldHook.queue : [];
	// actions.forEach((action) => {
	// 	hook.state = action(hook.state);
	// });
	actions.length > 0 && (hook.state = actions[actions.length - 1]);

	const setState = (action) => {
		hook.queue.push(action);
		// 初始化
		wipRoot = {
			dom: currentRoot.dom, //container, 一般是 id = "root" 的 div
			props: currentRoot.props,
			alternate: currentRoot,
		};
		deletions = [];
		// 重新渲染
		nextUnitOfWork = wipRoot;
	};
	// console.log("currentRoot", currentRoot);
	hookFiber && hookFiber.hooks.push(hook);
	hookIndex++;
	return [hook.state, setState];
}

let effectCallback = [];
function useEffect(callback, arr) {
	// 页面渲染完成后再执行
	effectCallback.push(callback);

	const oldfiber = hookFiber && hookFiber.alternate;
	oldfiber.prevEffectArr = oldfiber.currentEffectArr;
	oldfiber.currentEffectArr = arr;

	// 若 callback 里用到的变量没有包括在 arr 中会报错
}

const MyReact = {
	createElement,
	render,
	useState,
	useEffect,
};
export default MyReact;
