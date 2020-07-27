import {ActionCreatorHelper} from '../saga-reducers-factory-patch';

const actionsList = [
    'UPDATE',
    'CREATE',
    'DELETE'
];

export const types = ActionCreatorHelper.createTypes(actionsList, 'CLINICS_');
export const actions = ActionCreatorHelper.createActions(actionsList, 'CLINICS_');
