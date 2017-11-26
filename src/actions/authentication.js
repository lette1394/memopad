import {
    AUTH_LOGIN,
    AUTH_LOGIN_SUCCESS,
    AUTH_LOGIN_FAILURE,
    AUTH_REGISTER,
    AUTH_REGISTER_SUCCESS,
    AUTH_REGISTER_FAILURE,
    AUTH_GET_STATUS,
    AUTH_GET_STATUS_SUCCESS,
    AUTH_GET_STATUS_FAILURE,
		AUTH_LOGOUT,
		AUTH_MODIFY,
		AUTH_MODIFY_SUCCESS,
		AUTH_MODIFY_FAILURE
} from './ActionTypes';
import axios from 'axios';

/* ====== AUTH ====== */

/* LOGIN */
export function loginRequest(username, password) {
    return (dispatch) => {
            dispatch(login());

            return axios.post('/api/account/signin', { username, password })
            .then((response) => {
                dispatch(loginSuccess(response.data.info));
            }).catch((error) => {
                dispatch(loginFailure());
            });
    };
}

export function login() {
    return {
        type: AUTH_LOGIN
    };
}

export function loginSuccess(info) {
    return {
        type: AUTH_LOGIN_SUCCESS,
        info
    };
}

export function loginFailure() {
    return {
        type: AUTH_LOGIN_FAILURE
    };
}

/* REGISTER */
export function registerRequest(username, password, nickname) {
    return (dispatch) => {
        // inform register API is starting
        dispatch(register());

        return axios.post('/api/account/signup', { username, password, nickname })
        .then((response) => {
            dispatch(registerSuccess());
        }).catch((error) => {
            dispatch(registerFailure(error.response.data.code));
        });
    };
}

export function register() {
    return {
        type: AUTH_REGISTER
    };
}

export function registerSuccess() {
    return {
        type: AUTH_REGISTER_SUCCESS
    };
}

export function registerFailure(error) {
    return {
        type: AUTH_REGISTER_FAILURE,
        error
    };
}


/* Modify */

export function modifyRequest(username, password, nickname) {
	return (dispatch) => {
			// inform register API is starting
			dispatch(modify());
			
			return axios.put('/api/account/modify/' + username, { password, nickname })
			.then((response) => {
					dispatch(modifySuccess());
			}).catch((error) => {
					dispatch(modifyFailure(error.response.data.code));
			});
	};
}


export function modify() {
	return {
			type: AUTH_MODIFY
	};
}

export function modifySuccess() {
	return {
			type: AUTH_MODIFY_SUCCESS,
	};
}

export function modifyFailure(error) {
	return {
			type: AUTH_MODIFY_FAILURE,
			error
	};
}



/* GET STATUS */

export function getStatusRequest() {
    return (dispatch) => {
        dispatch(getStatus());
        return axios.get('/api/account/getinfo')
        .then((response) => {
            dispatch(getStatusSuccess(response.data.info));
        }).catch((error) => {
            dispatch(getStatusFailure());
        });
    };
}

export function getStatus() {
    return {
        type: AUTH_GET_STATUS
    };
}

export function getStatusSuccess(info) {
    return {
        type: AUTH_GET_STATUS_SUCCESS,
        info
    };
}

export function getStatusFailure() {
    return {
        type: AUTH_GET_STATUS_FAILURE
    };
}


/* LOGOUT */
export function logoutRequest() {
    return (dispatch) => {
        return axios.post('/api/account/logout')
        .then((response) => {
            dispatch(logout());
        });
    };
}

export function logout() {
    return {
        type: AUTH_LOGOUT
    };
}
