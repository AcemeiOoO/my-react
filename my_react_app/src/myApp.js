import MyReact from "./react/react_w_hook";

function Sub(props) {
	let [title, setTitle] = MyReact.useState("子组件可以是函数组件");
	return (
		<div>
			<h3>{props.title}</h3>
			{title}
			<br></br>
			<input id="updateValue" type="text" value={title}></input>
			<button
				onClick={() =>
					setTitle(
						document.getElementById("updateValue") &&
							document.getElementById("updateValue").value
					)
				}
			>
				更新
			</button>
		</div>
	);
}

function Counter() {
	let [count, setCount] = MyReact.useState(0);
	let [num, setNum] = MyReact.useState(0);

	MyReact.useEffect(() => {
		console.log("<myReact> callback is running");
		document.title = `You clicked ${count} times`;
	}, [num]);

	console.log("<myReact> render is running");
	/** @jsxRuntime classic */
	/** @jsx MyReact.createElement */
	return (
		<div>
			<p>Clicked {count} times</p>
			<button onClick={() => setCount(count + 1)}>Click</button>
			<br></br>
			<p>Clicked {num} times</p>
			<button onClick={() => setNum(num + 1)}>Click</button>
		</div>
	);
}

function MyApp() {
	let [product, setProduct] = MyReact.useState("根组件可以是函数组件");
	/** @jsxRuntime classic */
	/** @jsx MyReact.createElement */
	return (
		<div id="foo">
			<h1>这里是 react + hook</h1>
			<ul>
				<li>普通组件</li>
				<li>计算表达式{1 + 2}</li>
			</ul>
			{product}
			<br></br>
			<input id="addValue" type="text" value={product}></input>
			<button
				onClick={() =>
					setProduct(
						document.getElementById("addValue") &&
							document.getElementById("addValue").value
					)
				}
			>
				更新
			</button>
			<hr></hr>
			<Sub title="父组件传过来的数据"></Sub>
			<hr></hr>
			<Counter></Counter>
		</div>
	);
	// return MyReact.createElement(
	//     "div",
	//     { id: "foo" },
	//     MyReact.createElement("p", null, "bar"),
	//     MyReact.createElement("hr")
	// )
}
console.log("MyApp", MyApp());
export default MyApp;
