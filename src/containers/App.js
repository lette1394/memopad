import React from 'react';
import { Header } from 'components';
import { connect } from 'react-redux';
import { getStatusRequest, logoutRequest } from 'actions/authentication';
import { searchRequest } from 'actions/search';

class App extends React.Component {

	constructor(props) {
		super(props);
		this.handleLogout = this.handleLogout.bind(this);
		this.handleSearch = this.handleSearch.bind(this);
	}

	handleLogout() {
		this.props.logoutRequest().then(
			() => {
				Materialize.toast('로그아웃 되었습니다', 2000);

				// EMPTIES THE SESSION
				let loginData = {
					isLoggedIn: false,
					username: '',
					nickname: ''
				};

				document.cookie = 'key=' + btoa(JSON.stringify(loginData));
			}
		);
	}

	handleSearch(keyword) {
		this.props.searchRequest(keyword);
	}

	componentDidMount() {
		// get cookie by name
		function getCookie(name) {
			var value = "; " + document.cookie;
			var parts = value.split("; " + name + "=");
			if (parts.length == 2) return parts.pop().split(";").shift();
		}

		let loginData = getCookie('key');

		if (typeof loginData === "undefined") return;

		loginData = JSON.parse(atob(loginData));

		if (!loginData.isLoggedIn) return;

		// page refreshed & has a session in cookie,
		// check whether this cookie is valid or not
		this.props.getStatusRequest().then(
			() => {
				if (!this.props.status.valid) {
					// if session is not valid
					// logout the session
					loginData = {
						isLoggedIn: false,
						username: '',
						nickname: ''
					};

					document.cookie = 'key=' + btoa(JSON.stringify(loginData));

					// and notify
					let $toastContent = $('<span style="color: #FFB4BA">세션이 만료되었습니다. 다시 로그인 해주세요.</span>');
					Materialize.toast($toastContent, 4000);
				}
			}
		);
	}

	render() {
		let re = /(login|register|modify)/;
		let isAuth = re.test(this.props.location.pathname);

		return (
			<div>
				{isAuth ? undefined : <Header isLoggedIn={this.props.status.isLoggedIn}
					onLogout={this.handleLogout}
					onSearch={this.handleSearch}
					accounts={this.props.searchAccounts}
					username={this.props.status.currentUser}
					nickname={this.props.status.currentNickname}
					/>}
				{this.props.children}
			</div>
		);

	}
}

const mapStateToProps = (state) => {
	return {
		status: state.authentication.status,
		searchAccounts: state.search.accounts
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		getStatusRequest: () => {
			return dispatch(getStatusRequest());
		},
		logoutRequest: () => {
			return dispatch(logoutRequest());
		},
		searchRequest: (keyword) => {
			return dispatch(searchRequest(keyword));
		}
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
