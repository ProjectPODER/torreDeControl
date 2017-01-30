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
  ReactDOM.render(<App />, document.getElementById('contracts_page'));
};

module.exports = {reactInit};