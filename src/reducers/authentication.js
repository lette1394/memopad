import * as types from 'actions/ActionTypes';
import update from 'react-addons-update';

const initialState = {
	login: {
		status: 'INIT'
	},
	register: {
		status: 'INIT',
		error: -1
	},
	status: {
		valid: false,
		isLoggedIn: false,
		currentUser: '',
		currentNickname: ''
	},
	modify: {
		status: 'INIT',
		error: -1
	}
};


export default function authentication(state, action) {
	if (typeof state === "undefined") {
		state = initialState;
	}

	switch (action.type) {
		/* LOGIN */
		case types.AUTH_LOGIN:
			return update(state, {
				login: {
					status: { $set: 'WAITING ' }
				}
			});
		case types.AUTH_LOGIN_SUCCESS:
			return update(state, {
				login: {
					status: { $set: 'SUCCESS' }
				},
				status: {
					isLoggedIn: { $set: true },
					currentUser: { $set: action.info.username },
					currentNickname: { $set: action.info.nickname }
				}
			});
		case types.AUTH_LOGIN_FAILURE:
			return update(state, {
				login: {
					status: { $set: 'FAILURE' }
				}
			});

		/* REGISTER */
		case types.AUTH_REGISTER:
			return update(state, {
				register: {
					status: { $set: 'WAITING' },
					error: { $set: -1 }
				}
			});
		case types.AUTH_REGISTER_SUCCESS:
			return update(state, {
				register: {
					status: { $set: 'SUCCESS' },
				}
			});
		case types.AUTH_REGISTER_FAILURE:
			return update(state, {
				register: {
					status: { $set: 'FAILURE' },
					error: { $set: action.error }
				}
			});

		/* Modify */
		case types.AUTH_MODIFY:
			return update(state, {
				modify: {
					status: { $set: 'WAITING' },
					error: { $set: -1 }
				}
			});

		case types.AUTH_MODIFY_SUCCESS:
			return update(state, {
				modify: {
					status: { $set: 'SUCCESS' }
				}
			})


		case types.AUTH_MODIFY_FAILURE:
			return update(state, {
				modify: {
					status: { $set: 'FAILURE' },
					error: { $set: action.error }
				}
			});


		/* getinfo */
		case types.AUTH_GET_STATUS:
			return update(state, {
				status: {
					isLoggedIn: { $set: true }
				}
			});
		case types.AUTH_GET_STATUS_SUCCESS:
			return update(state, {
				status: {
					valid: { $set: true },
					currentUser: { $set: action.info.username },
					currentNickname: { $set: action.info.nickname }
				}
			});
		case types.AUTH_GET_STATUS_FAILURE:
			return update(state, {
				status: {
					valid: { $set: false },
					isLoggedIn: { $set: false }
				}
			});

		/* logout */
		case types.AUTH_LOGOUT:
			return update(state, {
				status: {
					isLoggedIn: { $set: false },
					currentUser: { $set: '' },
					currentNickname: { $set: '' }
				}
			});
		default:
			return state;
	}
}
