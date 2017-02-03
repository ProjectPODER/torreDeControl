import $ from 'jquery';
import moment from 'moment';

const IS_LOADED = 'IS_LOADED';
const FILTER_CHANGE = 'FILTER_CHANGE';
const KEYWORD_CHANGE = 'KEYWORD_CHANGE';
const GET_CONTRACTS_LIST = 'GET_CONTRACTS_LIST';
const GET_CONTRACTS_LIST_FAIL = 'GET_CONTRACTS_LIST_FAIL';
const GET_CONTRACTS_LIST_SUCCESS = 'GET_CONTRACTS_LIST_SUCCESS';
const CHANGE_SORT_CRITERIA = 'CHANGE_SORT_CRITERIA';
const PAGINATION_GO_TO_NEXT_PAGE = 'PAGINATION_GO_TO_NEXT_PAGE';
const PAGINATION_GO_TO_PREVIOUS_PAGE = 'PAGINATION_GO_TO_PREVIOUS_PAGE';
const PAGINATION_GO_TO_PAGE = 'PAGINATION_GO_TO_PAGE';
const PAGINATION_GO_TO_START = 'PAGINATION_GO_TO_START';
const SET_FILTERED_RESULTS = 'SET_FILTERED_RESULTS';

const initialState = {
  keyword: '',
  fromAmount: null,
  toAmount: null,
  contractType: 'todos',
  procedureType: 'todos',
  fromDate: null,
  toDate: null,
  contracts: [],
  loaded: false,
  sortBy: 'byTitle',
  reverse: false,
  filteredResults: 0,
  pagination: {
    page: 0,
    resultsPerPage: 10
  },
  pages: 0
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
    case PAGINATION_GO_TO_PAGE: {
      const resultsCount = state.filteredResults;
      const resultsPerPage = state.pagination.resultsPerPage;
      const lastPage = Math.ceil(resultsCount / resultsPerPage) - 1;
      const newPage = Math.min(lastPage, action.page);

      return {
        ...state,
        pagination: {
          ...state.pagination,
          page: newPage
        }
      };
    }
    case PAGINATION_GO_TO_START: {
      return {
        ...state,
        pagination: {
          ...state.pagination,
          page: 0
        }
      };
    }
    case PAGINATION_GO_TO_NEXT_PAGE: {
      const resultsCount = state.filteredResults;
      const resultsPerPage = state.pagination.resultsPerPage;
      const lastPage = Math.ceil(resultsCount / resultsPerPage) - 1;
      const newPage = Math.min(lastPage, state.pagination.page + 1);
      return {
        ...state,
        pagination: {
          ...state.pagination,
          page: newPage
        }
      };
    }
    case PAGINATION_GO_TO_PREVIOUS_PAGE: {
      const newPage = Math.max(0, state.pagination.page - 1);
      return {
        ...state,
        pagination: {
          ...state.pagination,
          page: newPage
        }
      };
    }
    case SET_FILTERED_RESULTS: {
      const resultsCount = action.filteredResults;
      const resultsPerPage = state.pagination.resultsPerPage;
      const pages = Math.ceil(resultsCount / resultsPerPage);
      return {
        ...state,
        pages,
        filteredResults: action.filteredResults
      };
    }
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

export function paginationGoToNextPage() {
  return {
    type: PAGINATION_GO_TO_NEXT_PAGE
  };
}

export function paginationGoToPreviousPage() {
  return {
    type: PAGINATION_GO_TO_PREVIOUS_PAGE
  };
}

export function paginationGoToPage(page) {
  return {
    type: PAGINATION_GO_TO_PAGE,
    page
  };
}

export function paginationGoToStart() {
  return {
    type: PAGINATION_GO_TO_START
  };
}

export function setFilteredResults(filteredResults) {
  return {
    type: SET_FILTERED_RESULTS,
    filteredResults
  };
}

export function isLoaded() {
  return {
    type: IS_LOADED
  };
}