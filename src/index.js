import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import App from './App.js';
import * as utils from './utils';
import PropTypes from 'prop-types';
import store from './store';
import { schemaSlice } from './store/schemaSlice.js';

export default function schemaEditor(config = {}) {
  if (config.lang) {
    utils.setLang(config.lang);
  }

  const Model = {
    schema: {
      ...loadActions(schemaSlice.actions),
    },
  };
  if (config.format) {
    Model.__jsonSchemaFormat = config.format;
  } else {
    Model.__jsonSchemaFormat = utils.format;
  }

  if (config.mock) {
    Model.__jsonSchemaMock = config.mock;
  }

  const Component = (props) => {
    return (
      <Provider store={store} className="wrapper">
        <App Model={Model} {...props} />
      </Provider>
    );
  };

  Component.propTypes = {
    data: PropTypes.string,
    onChange: PropTypes.func,
    showEditor: PropTypes.bool,
  };
  return Component;
}

function loadActions(originalActions) {
  var keys = Object.keys(originalActions);
  var actions = {};
  keys.forEach(function (key) {
    actions[key] = function actionCreator(params) {
      return store.dispatch(originalActions[key](params));
    };
  });
  return actions;
}
