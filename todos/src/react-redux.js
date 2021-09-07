/* eslint-disable react/forbid-prop-types */
/* eslint-disable react/jsx-props-no-spreading */
import React, {
  useContext, useState, useEffect,
} from 'react';
import PropTypes from 'prop-types';

// 创建一个 context
const MyContext = React.createContext(null);

const connect = (mapStateToProps, mapDispatchToProps) => (WrappedComponent) => {
  function Connect(props) {
    const { store } = useContext(MyContext);
    function updateProps() {
      const stateProps = mapStateToProps ? mapStateToProps(store.getState(), props) : {};
      const dispatchProps = mapDispatchToProps ? mapDispatchToProps(store.dispatch, props) : {};
      const fn = store.dispatch;
      const params = {
        // 整合普通的 props 和从 state 生成的 props
        ...stateProps,
        ...dispatchProps,
        ...props,
        dispatch: fn,
      };
      return params;
    }
    const [allProps, setAllProps] = useState(updateProps());

    useEffect(() => {
      store.subscribe(() => {
        setAllProps(updateProps());
      });
    });

    // eslint-disable-next-line react/jsx-filename-extension
    return <WrappedComponent {...allProps} />;
  }

  return Connect;
};

function Provider({ store, children }) {
  const value = {
    store,
  };
  return (
    <MyContext.Provider value={value}>
      <div>{children}</div>
    </MyContext.Provider>
  );
}
Provider.propTypes = {
  store: PropTypes.object,
  children: PropTypes.object,
};
Provider.defaultProps = {
  store: {},
  children: {},
};
export { Provider, connect };
