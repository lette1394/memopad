import * as types from 'actions/ActionTypes';
import update from 'react-addons-update';

const initialState = {
    status: 'INIT',
		accounts: []
};

export default function search(state, action) {
    if(typeof state === "undefined")
        state = initialState;

    switch(action.type) {
        case types.SEARCH:
            return update(state, {
                status: { $set: 'WAITING' }
            });
        case types.SEARCH_SUCCESS:
            return update(state, {
                status: { $set: 'SUCCESS' },
								accounts: { $set: action.accounts }
            });
        case types.SEARCH_FAILURE:
            return update(state, {
                status: { $set: 'FAILURE' }
            });
        default:
            return state;
    }
}
