import {createStore as _createStore} from 'redux';
import {combineReducers} from 'redux';
import contracts from './modules/contracts';

export default function createStore () {
	const reducers = combineReducers({
	  contracts: contracts
	})

	const store = _createStore(reducers);

	return store;
}