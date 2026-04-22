import { createSlice, original } from '@reduxjs/toolkit';
import _ from 'underscore';
import { handleSchema } from '../schema';
import utils from '../utils';

let fieldNum = 1;

type Schema = {
  title: string;
  type: string;
  properties: Record<string, Schema>;
  required: string[];
};

interface SchemaState {
  message: string | null;
  data: Schema;
  open: {
    properties: boolean;
  };
}

const initialState: SchemaState = {
  message: null,
  data: {
    title: '',
    type: 'object',
    properties: {},
    required: [],
  },
  open: {
    properties: true,
  },
};

export const schemaSlice = createSlice({
  name: 'schema',
  initialState,
  reducers: {
    changeEditorSchemaAction: function (state, { payload }) {
      handleSchema(payload.value);
      state.data = payload.value;
    },

    changeNameAction: function (state, { payload }) {
      const oldState = original(state);
      const keys = payload.prefix;
      const name = payload.name;
      const value = payload.value;
      let oldData = oldState.data;
      let parentKeys = utils.getParentKeys(keys);
      let parentData = utils.getData(oldData, parentKeys);
      let requiredData = [].concat(parentData.required || []);
      let propertiesData = utils.getData(oldData, keys);
      let newPropertiesData = {};

      let curData = propertiesData[name];
      let openKeys = []
        .concat(keys, value, 'properties')
        .join(utils.JSONPATH_JOIN_CHAR);
      let oldOpenKeys = []
        .concat(keys, name, 'properties')
        .join(utils.JSONPATH_JOIN_CHAR);
      if (curData.properties) {
        delete state.open[oldOpenKeys];
        state.open[openKeys] = true;
      }

      if (propertiesData[value] && typeof propertiesData[value] === 'object') {
        return;
      }

      requiredData = requiredData.map((item) => {
        if (item === name) return value;
        return item;
      });

      parentKeys.push('required');
      utils.setData(state.data, parentKeys, requiredData);

      for (let i in propertiesData) {
        if (i === name) {
          newPropertiesData[value] = propertiesData[i];
        } else newPropertiesData[i] = propertiesData[i];
      }

      utils.setData(state.data, keys, newPropertiesData);
    },

    changeValueAction: function (state, { payload }) {
      const keys = payload.key;
      if (payload.value) {
        utils.setData(state.data, keys, payload.value);
      } else {
        utils.deleteData(state.data, keys);
      }
    },

    changeTypeAction: function (state, { payload }) {
      const oldState = original(state);
      const keys = payload.key;
      const value = payload.value;

      let parentKeys = utils.getParentKeys(keys);
      let oldData = oldState.data;
      let parentData = utils.getData(oldData, parentKeys);
      if (parentData.type === value) {
        return;
      }
      // let newParentData = utils.defaultSchema[value];
      let newParentDataItem = utils.defaultSchema[value];

      // 将备注过滤出来
      let parentDataItem = parentData.description
        ? { description: parentData.description }
        : {};
      let newParentData = Object.assign({}, newParentDataItem, parentDataItem);

      let newKeys = [].concat('data', parentKeys);
      utils.setData(state, newKeys, newParentData);
    },

    enableRequireAction: function (state, { payload }) {
      const oldState = original(state);
      const keys = payload.prefix;
      let parentKeys = utils.getParentKeys(keys);
      let oldData = oldState.data;
      let parentData = utils.getData(oldData, parentKeys);
      let requiredData = [].concat(parentData.required || []);
      let index = requiredData.indexOf(payload.name);

      if (!payload.required && index >= 0) {
        requiredData.splice(index, 1);
        parentKeys.push('required');
        if (requiredData.length === 0) {
          utils.deleteData(state.data, parentKeys);
        } else {
          utils.setData(state.data, parentKeys, requiredData);
        }
      } else if (payload.required && index === -1) {
        requiredData.push(payload.name);
        parentKeys.push('required');
        utils.setData(state.data, parentKeys, requiredData);
      }
    },

    requireAllAction: function (state, { payload }) {
      const oldState = original(state);
      // let oldData = oldState.data;
      let data = utils.cloneObject(payload.value);
      utils.handleSchemaRequired(data, payload.required);

      state.data = data;
    },

    deleteItemAction: function (state, { payload }) {
      const oldState = original(state);
      const keys = payload.key;

      let name = keys[keys.length - 1];
      let oldData = oldState.data;
      let parentKeys = utils.getParentKeys(keys);
      let parentData = utils.getData(oldData, parentKeys);
      let newParentData = {};
      for (let i in parentData) {
        if (i !== name) {
          newParentData[i] = parentData[i];
        }
      }

      utils.setData(state.data, parentKeys, newParentData);
    },

    addFieldAction: function (state, { payload }) {
      const oldState = original(state);
      const keys = payload.prefix;
      let oldData = oldState.data;
      let name = payload.name;
      let propertiesData = utils.getData(oldData, keys);
      let newPropertiesData = {};

      let parentKeys = utils.getParentKeys(keys);
      let parentData = utils.getData(oldData, parentKeys);
      let requiredData = [].concat(parentData.required || []);

      if (!name) {
        newPropertiesData = Object.assign({}, propertiesData);
        let ranName = 'field_' + fieldNum++;
        newPropertiesData[ranName] = utils.defaultSchema.string;
        requiredData.push(ranName);
      } else {
        for (let i in propertiesData) {
          newPropertiesData[i] = propertiesData[i];
          if (i === name) {
            let ranName = 'field_' + fieldNum++;
            newPropertiesData[ranName] = utils.defaultSchema.string;
            requiredData.push(ranName);
          }
        }
      }
      utils.setData(state.data, keys, newPropertiesData);
      // add required
      parentKeys.push('required');
      utils.setData(state.data, parentKeys, requiredData);
    },
    addChildFieldAction: function (state, { payload }) {
      const oldState = original(state);
      const keys = payload.key;
      let oldData = oldState.data;
      let propertiesData = utils.getData(oldData, keys);
      let newPropertiesData = {};

      newPropertiesData = Object.assign({}, propertiesData);
      let ranName = 'field_' + fieldNum++;
      newPropertiesData[ranName] = utils.defaultSchema.string;
      utils.setData(state.data, keys, newPropertiesData);

      // add required
      let parentKeys = utils.getParentKeys(keys);
      let parentData = utils.getData(oldData, parentKeys);
      let requiredData = [].concat(parentData.required || []);
      requiredData.push(ranName);
      parentKeys.push('required');
      utils.setData(state.data, parentKeys, requiredData);
    },

    setOpenValueAction: function (state, { payload }) {
      const oldState = original(state);
      const keys = payload.key.join(utils.JSONPATH_JOIN_CHAR);

      let status;
      if (_.isUndefined(payload.value)) {
        status = utils.getData(oldState.open, [keys]) ? false : true;
      } else {
        status = payload.value;
      }
      utils.setData(state.open, [keys], status);
    },
  },
});
