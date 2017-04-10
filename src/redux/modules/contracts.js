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
const SHOW_MODAL = 'SHOW_MODAL';
const HIDE_MODAL = 'HIDE_MODAL';
const SET_INFO_DATA = 'SET_INFO_DATA';
const SEND_CONTACT_INFO = 'SEND_CONTACT_INFO';
const SEND_CONTACT_INFO_FAIL = 'SEND_CONTACT_INFO_FAIL';
const SEND_CONTACT_INFO_SUCCESS = 'SEND_CONTACT_INFO_SUCCESS';

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
  loadingResults: false,
  filteredResults: 0,
  modalStatus: 'closed',
  contactMailStatus: 'empty',
  sendInfoData: {
    organization: null,
    email: null,
    subject: null,
    text: null
  },
  sendInfoErrors: {
    errorEmail: false,
    errorEmailLegend: null,
    errorText: false,
    errorTextLegend: null
  },
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
        ...state,
        loadingResults: true
      };
    case GET_CONTRACTS_LIST_SUCCESS:
      const contracts = action.result.data;
      return {
        ...state,
        contracts: [...state.contracts, ...contracts],
        loadingResults: false
      };
    case GET_CONTRACTS_LIST_FAIL:
      return {
        ...state,
        loadingResults: false
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
    case SHOW_MODAL: {
      return {
        ...state,
        modalStatus: 'opened',
        sendInfoErrors: {
          errorEmail: false,
          errorEmailLegend: null,
          errorText: false,
          errorTextLegend: null
        }
      };
    }
    case HIDE_MODAL: {
      return {
        ...state,
        modalStatus: 'closed',
        contactMailStatus: 'empty'
      };
    }
    case SET_INFO_DATA: {
      return {
        ...state,
        sendInfoData: {
          ...state.sendInfoData,
          ...action.data
        }
      };
    }
    case SEND_CONTACT_INFO: {
      return {
        ...state,
        contactMailStatus: 'sending'
      };
    }
    case SEND_CONTACT_INFO_SUCCESS: {
      return {
        ...state,
        sendInfoData: {
          organization: null,
          email: null,
          subject: null,
          text: null
        },
        // modalStatus: 'closed',
        contactMailStatus: 'sent'
      };
    }
    case SEND_CONTACT_INFO_FAIL: {
      const response = JSON.parse(action.error.responseText);
      return {
        ...state,
        sendInfoErrors: {
          errorEmail: Object.keys(response.messages).indexOf('email'),
          errorEmailLegend: response.messages.email,
          errorText: Object.keys(response.messages).indexOf('text'),
          errorTextLegend: response.messages.text
        },
        contactMailStatus: response.messages.message_service ? 'error' : 'wrongfields'
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
  const endpointUrl = 'http://ec2-54-83-139-8.compute-1.amazonaws.com'; // TO-DO: Al igual en en visualization.js:282 esto seria mejor si es un constante global pero no queria ponerla donde
  return {
    types: [GET_CONTRACTS_LIST, GET_CONTRACTS_LIST_SUCCESS, GET_CONTRACTS_LIST_FAIL],
    promise: () => $.get(endpointUrl + '/api/v1/contracts')
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

export function showModal() {
  return {
    type: SHOW_MODAL
  };
}

export function hideModal() {
  return {
    type: HIDE_MODAL
  };
}

export function setInfoData(data) {
  return {
    type: SET_INFO_DATA,
    data
  };
}

export function sendContactMail(data) {
  return {
    types: [SEND_CONTACT_INFO, SEND_CONTACT_INFO_SUCCESS, SEND_CONTACT_INFO_FAIL],
    promise: () => $.post('mailserver/message.php', data)
  };
}
