const createStore = (reducer, initialState) => {
  let state;
  let listeners = [];

  const getState = () => state;

  const subscribe = (listener) => {
    listeners.push(listener);
    // 返回值在 react-redux 中很重要！！
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  };

  const dispatch = (action) => {
    state = reducer(state, action);
    listeners.forEach((listener) => listener());
    return state;
  };

  state = initialState || dispatch({});

  return { getState, subscribe, dispatch };
};

const combineReducers = (reducers) => {
  const keys = Object.keys(reducers);
  // 检测每一个 reducers[keys[i]] 是否是函数，不是则过滤掉

  // 检测每一个 reducer 是否有默认值，没有则抛出错误

  const finalReducerKeys = keys;
  const finalReducers = reducers;

  return (state = {}, action) => {
    const nextState = {};
    let hasChanged = false;

    for (let i = 0; i < finalReducerKeys.length; i += 1) {
      // 遍历 state 的属性
      // 取当前属性
      const key = finalReducerKeys[i];
      // 取对应的 reducer
      const reducer = finalReducers[key];
      // 取 state 中当前属性对应的值
      const previousStateForKey = state[key];
      // 将 state 中当前属性对应的值 和 action 传入 reducer ，得到 nextState
      const nextStateForKey = reducer(previousStateForKey, action);

      // 若 nextState 为 undefined ，则抛出错误

      nextState[key] = nextStateForKey;

      // 若当前 action 未改变 state 当前属性的值， nextStateForKey === previousStateForKey
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
    }
    // 若 state 所有的属性的值均未改变，则返回 oldState ,便于后续做性能优化
    return hasChanged ? nextState : state;
  };
};

export {
  createStore,
  combineReducers,
};
