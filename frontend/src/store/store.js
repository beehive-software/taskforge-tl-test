import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunk from 'redux-thunk';


import projectReducer from './reducers/projectReducer';



const rootReducer = combineReducers({
  projects: projectReducer,
  // Add other reducers here as your application grows
});


const store = createStore(
  rootReducer,
  applyMiddleware(thunk)
);

export default store;