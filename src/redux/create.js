import {createStore as _createStore, applyMiddleware} from 'redux';
import {combineReducers} from 'redux';
import contracts from './modules/contracts';
import reduxMiddleware from './middleware/reduxMiddleware';


export default function createStore () {
	const reducers = combineReducers({
		contracts
	})
	const store = _createStore(reducers, applyMiddleware(reduxMiddleware()));

	return store;
}