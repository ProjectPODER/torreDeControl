import $ from 'jquery';
import moment from 'moment';

const IS_LOADED = 'IS_LOADED';
const FILTER_CHANGE = 'FILTER_CHANGE';
const KEYWORD_CHANGE = 'KEYWORD_CHANGE';
const GET_CONTRACTS_LIST = 'GET_CONTRACTS_LIST';
const GET_CONTRACTS_LIST_FAIL = 'GET_CONTRACTS_LIST_FAIL';
const GET_CONTRACTS_LIST_SUCCESS = 'GET_CONTRACTS_LIST_SUCCESS';
const CHANGE_SORT_CRITERIA = 'CHANGE_SORT_CRITERIA';

const initialState = {
  keyword: '',
  fromAmount: 0,
  toAmount: 100000000,
  contractType: 'Servicios Relacionados con la OP',
  procedureType: 'Adjudicación Directa Federal',
  fromDate: moment('1/1/2010'),
  toDate: moment(),
  contracts: [],
  loaded: false,
  sortBy: 'byTitle',
  reverse: false,
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case FILTER_CHANGE:
      const {filterName, filterValue} = action;
      return {
        ...state,
        [filterName]: filterValue
      };
    case KEYWORD_CHANGE:
      const {newKeyword} = action;
      return {
        ...state,
        keyword: newKeyword
      };
    case GET_CONTRACTS_LIST:
      return {
        ...state
      };
    case GET_CONTRACTS_LIST_SUCCESS:
      const contracts = action.result.data;
      return {
        ...state,
        contracts: [...state.contracts, ...contracts] 
      };
    case GET_CONTRACTS_LIST_FAIL:
      return {
        ...state
      };
    case IS_LOADED:
      return {
        ...state,
        loaded: true
      };
    case CHANGE_SORT_CRITERIA:
      const reverse = state.sortBy === action.newCriteria ? !state.reverse : false;
      return {
        ...state,
        sortBy: action.newCriteria,
        reverse
      };
    default:
      return state;
  }
}

export function filterChange(filterName, filterValue) {
  return {
    type: FILTER_CHANGE,
    filterName,
    filterValue
  };
}

export function keywordChange(newKeyword) {
  return {
    type: KEYWORD_CHANGE,
    newKeyword
  };
}

export function changeSortCriteria(newCriteria) {
  return {
    type: CHANGE_SORT_CRITERIA,
    newCriteria
  };
}

export function getContractsList() {
  return {
    types: [GET_CONTRACTS_LIST, GET_CONTRACTS_LIST_SUCCESS, GET_CONTRACTS_LIST_FAIL],
    promise: () => $.get('https://www.quienesquien.wiki/api/v1/contracts?dependency=Grupo%20Aeroportuario%20De%20La%20Ciudad%20De%20M%C3%A9xico,%20S.A.%20de%20C.V.&limit=1000')
  };
}

export function isLoaded() {
  return {
    type: IS_LOADED
  };
}