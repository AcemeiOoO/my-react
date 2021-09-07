import React from "react";
// import { useState, useEffect } from "react";
import { useState } from "./hooks";

function Counter() {
	let [count, setCount] = useState(0);
	let [num, setNum] = useState(0);

	// useEffect(() => {
	// 	console.log("<myhook> callback is running");
	// 	document.title = `You clicked ${count} times`;
	// });

	console.log("<myhook> render is running");

	return (
		<>
			<p>Clicked {count} times</p>
			<button onClick={() => setCount(count + 1)}>Click</button>
			<br></br>
			<p>Clicked {num} times</p>
			<button onClick={() => setNum(num + 1)}>Click</button>
		</>
	);
}

function Todos() {
	let [type, setType] = useState("ALL");
	let [todoList, setTodoList] = useState([]);

	const handleSet = (id) => {
		setTodoList(
			todoList.map((item) =>
				item.id === id ? { ...item, complete: !item.complete } : item
			)
		);
	};

	const addTodo = () => {
		setTodoList([
			...todoList,
			{
				id: todoList.length > 0 ? todoList[todoList.length - 1].id + 1 : 0,
				text: document.getElementById("addValue").value,
				complete: false,
			},
		]);
	};

	return (
		<>
			<input type="text" id="addValue"></input>
			<button onClick={addTodo}>Add Todo</button>
			<ul>
				{todoList.map((item, index) => {
					if (
						type === "ALL" ||
						(item.complete && type === "DONE") ||
						(!item.complete && type === "UNDONE")
					) {
						return (
							<li
								key={item.id}
								onClick={() => handleSet(index)}
								style={{
									textDecoration: item.complete ? "line-through" : "none",
								}}
							>
								{item.text}
							</li>
						);
					}
				})}
			</ul>
		</>
	);
}

function App() {
	return (
		<>
			<hr></hr>
			<h1>这里是我的 hook </h1>
			<Counter />
			<br></br>
			{/* <Todos /> */}
			<hr></hr>
		</>
	);
}

export default App;
