import React from 'react';
import ReactDOM from 'react-dom';
import createStore from './redux/create';
import {Provider} from 'react-redux';
import ContractPage from './containers/ContractPage';

module.exports = () => {
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
  
  ReactDOM.render(<App />, container);
  
};

//TODO: resolver inicio de react