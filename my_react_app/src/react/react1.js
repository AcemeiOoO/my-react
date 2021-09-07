// 创建 dom 元素对象
function createElement(type, props, ...children) {
	return {
		type,
		props: {
			...props,
			children: children.map((child) =>
				typeof child == "object" ? child : createTextElement(child)
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

function render(element, container) {
	console.log("执行render");
	const dom =
		element.type === "TEXT_ELEMENT"
			? document.createTextNode("")
			: document.createElement(element.type);

	// 将 props 内的属性添加到真实 dom
	Object.keys(element.props)
		.filter((key) => key !== "children")
		.forEach((name) => {
			if (name.startsWith("on")) {
				const eventType = name.toLowerCase().substring(2);
				dom.addEventListener(eventType, element.props[name]);
			} else {
				dom[name] = element.props[name];
			}
		});

	// 递归添加 children dom
	element.props.children.forEach((child) => {
		render(child, dom);
	});

	container.appendChild(dom);
}

const MyReact = {
	createElement,
	render,
};
export default MyReact;
