import React from 'react';
import ReactDOM from 'react-dom';
import createStore from './redux/create';
import {Provider} from 'react-redux';
import ContractPage from './containers/ContractPage';

const reactInit = () => {
  class App extends React.Component {
    render() {
      const store = createStore();
      return (
        <Provider store={store} key="provider">
          <ContractPage />
        </Provider>
    
      );
    }
  }
  const container = document.getElementById('contracts_page');
  if(container) {
    ReactDOM.render(<App />, container);
  }
};

module.exports = {reactInit};

//TODO: resolver inicio de react