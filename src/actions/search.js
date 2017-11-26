import {
    SEARCH,
    SEARCH_SUCCESS,
    SEARCH_FAILURE
} from './ActionTypes';
import axios from 'axios';

export function searchRequest(keyword) {
    return (dispatch) => {

        dispatch(search());

        return axios.get('/api/account/search/' + keyword)
        .then((response) => {
            dispatch(searchSuccess(response.data));
        }).catch((error) => {
            dispatch(searchFailure());
        });
    };
}

export function search() {
    return {
        type: SEARCH
    };
}

export function searchSuccess(accounts) {
    return {
        type: SEARCH_SUCCESS,
        accounts
    };
}

export function searchFailure() {
		let blank = [];
    return {
				type: SEARCH_FAILURE,
				blank
    };
}
