import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, browserHistory, IndexRoute } from 'react-router';
import { App, Home, Login, Register, Wall, ModifyContainer, WriteContainer } from 'containers';

import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import reducers from 'reducers';
import thunk from 'redux-thunk';

const store = createStore(reducers, applyMiddleware(thunk));

const rootElement = document.getElementById('root');
ReactDOM.render(
    <Provider store={store}>
        <Router history={browserHistory}>
            <Route path="/" component={App}>
                <IndexRoute component={Home}/>
                <Route path="home" component={Home}/>
                <Route path="write" component={WriteContainer}/>
                <Route path="modify" component={ModifyContainer}/>
                <Route path="login" component={Login}/>
                <Route path="register" component={Register}/>
                <Route path="wall/:username/:nickname" component={Wall}/>
            </Route>
        </Router>
    </Provider>, rootElement
);
