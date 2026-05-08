import { createSlice, original, PayloadAction } from '@reduxjs/toolkit';

import { handleSchema } from '../schema';
import * as utils from '../utils';
import type { JSONSchema } from '../types';

export interface SchemaState {
  fieldNum: number;
  message: string | null;
  data: JSONSchema;
  open: Record<string, boolean>;
}

interface ChangeEditorSchemaPayload {
  value: Record<string, unknown>;
}
interface ChangeNamePayload {
  prefix: string[];
  name: string;
  value: string;
}
interface ChangeValuePayload {
  key: string[];
  value: unknown;
}
interface ChangeTypePayload {
  key: string[];
  value: string;
}
interface EnableRequirePayload {
  prefix: string[];
  name: string;
  required: boolean;
}
interface RequireAllPayload {
  required: boolean;
  value: JSONSchema;
}
interface DeleteItemPayload {
  key: string[];
}
interface AddFieldPayload {
  prefix: string[];
  name: string;
}
interface AddChildFieldPayload {
  key: string[];
}
interface SetOpenValuePayload {
  key: string[];
  value?: boolean;
}

const initialState: SchemaState = {
  fieldNum: 1,
  message: null,
  data: {
    title: '',
    type: 'object',
    description: '',
    properties: {},
    required: [],
  },
  open: {
    properties: true,
  },
};

const schemaSlice = createSlice({
  name: 'schema',
  initialState,
  reducers: {
    changeEditorSchemaAction: function (
      state,
      action: PayloadAction<ChangeEditorSchemaPayload>,
    ) {
      const { payload } = action;
      state.data = handleSchema(payload.value);
    },

    changeNameAction: function (
      state,
      action: PayloadAction<ChangeNamePayload>,
    ) {
      const { payload } = action;
      const oldState = original(state);
      if (!oldState) return;
      const keys = payload.prefix;
      const name = payload.name;
      const value = payload.value;
      const oldData = oldState.data;
      const parentKeys = utils.getParentKeys(keys);
      const parentData = utils.getData(oldData, parentKeys) as JSONSchema;
      let requiredData: string[] = [...(parentData.required ?? [])];
      const propertiesData = utils.getData(oldData, keys) as Record<
        string,
        unknown
      >;
      const newPropertiesData: Record<string, unknown> = {};

      const curData = propertiesData[name] as JSONSchema;
      const openKeys = [...keys, value, 'properties'].join(
        utils.JSONPATH_JOIN_CHAR,
      );
      const oldOpenKeys = [...keys, name, 'properties'].join(
        utils.JSONPATH_JOIN_CHAR,
      );
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

      for (const i in propertiesData) {
        if (i === name) {
          newPropertiesData[value] = propertiesData[i];
        } else newPropertiesData[i] = propertiesData[i];
      }

      utils.setData(state.data, keys, newPropertiesData);
    },

    changeValueAction: function (
      state,
      action: PayloadAction<ChangeValuePayload>,
    ) {
      const { payload } = action;
      const keys = payload.key;
      if (payload.value) {
        utils.setData(state.data, keys, payload.value);
      } else {
        utils.deleteData(state.data, keys);
      }
    },

    changeTypeAction: function (
      state,
      action: PayloadAction<ChangeTypePayload>,
    ) {
      const { payload } = action;
      const oldState = original(state);
      if (!oldState) return;
      const keys = payload.key;
      const value = payload.value;

      const parentKeys = utils.getParentKeys(keys);
      const oldData = oldState.data;
      const parentData = utils.getData(oldData, parentKeys) as JSONSchema;
      if (parentData.type === value) {
        return;
      }
      const newParentDataItem = utils.defaultSchema[value];

      const parentDataItem = parentData.description
        ? { description: parentData.description }
        : {};
      const newParentData = Object.assign(
        {},
        newParentDataItem,
        parentDataItem,
      );

      const newKeys: string[] = ['data', ...parentKeys];
      utils.setData(state, newKeys, newParentData);
    },

    enableRequireAction: function (
      state,
      action: PayloadAction<EnableRequirePayload>,
    ) {
      const { payload } = action;
      const oldState = original(state);
      if (!oldState) return;
      const keys = payload.prefix;
      const parentKeys = utils.getParentKeys(keys);
      const oldData = oldState.data;
      const parentData = utils.getData(oldData, parentKeys) as JSONSchema;
      const requiredData: string[] = [...(parentData.required ?? [])];
      const index = requiredData.indexOf(payload.name);

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

    requireAllAction: function (
      state,
      action: PayloadAction<RequireAllPayload>,
    ) {
      const { payload } = action;
      const oldState = original(state);
      if (!oldState) return;
      const data = utils.cloneObject(payload.value);
      utils.handleSchemaRequired(data, payload.required);

      state.data = data;
    },

    deleteItemAction: function (
      state,
      action: PayloadAction<DeleteItemPayload>,
    ) {
      const { payload } = action;
      const oldState = original(state);
      if (!oldState) return;
      const keys = payload.key;

      const name = keys[keys.length - 1];
      const oldData = oldState.data;
      const parentKeys = utils.getParentKeys(keys);
      const parentData = utils.getData(oldData, parentKeys) as Record<
        string,
        unknown
      >;
      const newParentData: Record<string, unknown> = {};
      for (const i in parentData) {
        if (i !== name) {
          newParentData[i] = parentData[i];
        }
      }

      utils.setData(state.data, parentKeys, newParentData);
    },

    addFieldAction: function (state, action: PayloadAction<AddFieldPayload>) {
      const { payload } = action;
      const oldState = original(state);
      if (!oldState) return;
      const keys = payload.prefix;
      const oldData = oldState.data;
      const name: string = payload.name;
      const propertiesData = utils.getData(oldData, keys) as Record<
        string,
        unknown
      >;
      let newPropertiesData: Record<string, unknown> = {};

      const parentKeys = utils.getParentKeys(keys);
      const parentData = utils.getData(oldData, parentKeys) as JSONSchema;
      const requiredData: string[] = [...(parentData.required ?? [])];

      if (!name) {
        newPropertiesData = Object.assign({}, propertiesData);
        const ranName = 'field_' + state.fieldNum++;
        newPropertiesData[ranName] = utils.defaultSchema.string;
        requiredData.push(ranName);
      } else {
        for (const i in propertiesData) {
          newPropertiesData[i] = propertiesData[i];
          if (i === name) {
            const ranName = 'field_' + state.fieldNum++;
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
    addChildFieldAction: function (
      state,
      action: PayloadAction<AddChildFieldPayload>,
    ) {
      const { payload } = action;
      const oldState = original(state);
      if (!oldState) return;
      const keys = payload.key;
      const oldData = oldState.data;
      const propertiesData = utils.getData(oldData, keys) as Record<
        string,
        unknown
      >;
      let newPropertiesData: Record<string, unknown> = {};

      newPropertiesData = Object.assign({}, propertiesData);
      const ranName = 'field_' + state.fieldNum++;
      newPropertiesData[ranName] = utils.defaultSchema.string;
      utils.setData(state.data, keys, newPropertiesData);

      // add required
      const parentKeys = utils.getParentKeys(keys);
      const parentData = utils.getData(oldData, parentKeys) as JSONSchema;
      const requiredData: string[] = [...(parentData.required ?? [])];
      requiredData.push(ranName);
      parentKeys.push('required');
      utils.setData(state.data, parentKeys, requiredData);
    },

    setOpenValueAction: function (
      state,
      action: PayloadAction<SetOpenValuePayload>,
    ) {
      const { payload } = action;
      const oldState = original(state);
      if (!oldState) return;
      const keys = payload.key.join(utils.JSONPATH_JOIN_CHAR);

      let status;
      if (utils.isNil(payload.value)) {
        status = utils.getData(oldState.open, [keys]) ? false : true;
      } else {
        status = payload.value;
      }
      utils.setData(state.open, [keys], status);
    },
  },
});

export const { reducer } = schemaSlice;
export const {
  changeEditorSchemaAction,
  changeNameAction,
  changeValueAction,
  changeTypeAction,
  enableRequireAction,
  requireAllAction,
  deleteItemAction,
  addFieldAction,
  addChildFieldAction,
  setOpenValueAction,
} = schemaSlice.actions;
