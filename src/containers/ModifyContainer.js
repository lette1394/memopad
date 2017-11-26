import React from 'react';
import { Link, browserHistory } from 'react-router';
import { connect } from 'react-redux';
import { Modify } from 'components';
import { modifyRequest, loginRequest, logoutRequest } from 'actions/authentication';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

class ModifyContainer extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			username: "",
			password: "",
			mode: false
		};
		this.handleChange = this.handleChange.bind(this);
		this.handleLogin = this.handleLogin.bind(this);
		this.handleKeyPress = this.handleKeyPress.bind(this);
		this.handleModify = this.handleModify.bind(this);
		this.handleLogout = this.handleLogout.bind(this);
	}

	componentDidMount() {
		function getCookie(name) {
			var value = "; " + document.cookie;
			var parts = value.split("; " + name + "=");
			if (parts.length == 2) return parts.pop().split(";").shift();
		}

		// get login data from cookie
		let loginData = getCookie('key');
		loginData = JSON.parse(atob(loginData));
		this.setState({
			username: loginData.username
		})
	}

	handleChange(e) {
		let nextState = {};
		nextState[e.target.name] = e.target.value;
		this.setState(nextState);
	}

	handleLogin() {
		let id = this.state.username;
		let pw = this.state.password;

		return this.props.loginRequest(id, pw).then(
      () => {
        if (this.props.loginStatus === "SUCCESS") {
          Materialize.toast('성공!', 2000);
					this.setState({
						mode: true
					})

          return true;
        } else {
          let $toastContent = $('<span style="color: #FFB4BA">비밀번호가 잘못되었습니다</span>');
          Materialize.toast($toastContent, 2000);
          return false;
        }
      }
    );
	}

	handleLogout() {
		this.props.logoutRequest().then(
			() => {

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

	handleModify(id, pw, nick) {
		return this.props.modifyRequest(id, pw, nick).then(
				() => {
						if(this.props.modifyStatus === "SUCCESS") {
							this.handleLogout();
							Materialize.toast('정보 수정 완료!', 4000);
							Materialize.toast('다시 로그인 해주세요', 4000);
							browserHistory.push('/');
							return true;
						} else {
								/*
									 ERROR CODES:
											 1: BAD USERNAME
											 2: BAD PASSWORD
											 3: USERNAME EXISTS
											 4: NICKNAME EXISTS
											 5: BAD NICKNAME
							 */
							 let errorMessage = [
									 '불가능한 ID 입니다, ID는 영대소문자 및 숫자로 구성해주세요',
									 '비밀번호는 4자리 이상이어야 합니다',
									 '이미 사용중인 ID 입니다',
									 '이미 사용중인 닉네임 입니다',
									 '불가능한 닉네임 입니다'
							 ];

							 let $toastContent = $('<span style="color: #FFB4BA">' + errorMessage[this.props.modifyErrorCode - 1] + '</span>');
								Materialize.toast($toastContent, 4000);
								return false;
						}
				}
		);
}

	handleKeyPress(e) {
		if (e.charCode === 13) {
			this.handleLogin();
		}
	}

	render() {
		const loginBoxes = (
			<div>
				<div className="input-field col s12">
					<label>Password</label>
					<input
						name="password"
						type="password"
						className="validate"
						value={this.state.password}
						onChange={this.handleChange}
						onKeyPress={this.handleKeyPress} />
				</div>
			</div>
		);

		const loginView = (
			<div>
				<div className="card-content">
					<div className="row">
						{loginBoxes}
						<a onClick={this.handleLogin} className="waves-effect waves-light btn">SUBMIT</a>
					</div>
				</div>
			</div>
		);

		const confirm = (
			<ReactCSSTransitionGroup
				transitionName="example"
				transitionAppear={true}>

				<div className="container auth">
					<Link className="logo" to="/">Sasanghwal</Link>
					<div className="card">
						<div className="grey darken-2 white-text center flow-text">
							<div className="card-content">
							<p>회원정보 수정을 위해</p> 
							<p>비밀번호를 다시 한 번 입력해 주세요</p>
							</div>
						</div>
						{loginView}
					</div>
				</div>
			</ReactCSSTransitionGroup>
		)

		return (
			<div>
				{this.state.mode ? <Modify onModify={this.handleModify} /> : confirm}
			</div>
		);
	}
}

Modify.propTypes = {
	mode: React.PropTypes.bool,
	onLogin: React.PropTypes.func
};

Modify.defaultProps = {
	mode: true,
	onLogin: (id, pw) => { console.error("onLogin not defined"); }
};


const mapStateToProps = (state) => {
  return {
		loginStatus: state.authentication.login.status,
		loginErrorCode: state.authentication.login.error,	
		modifyStatus : state.authentication.modify.status,
		modifyInfo : state.authentication.modify.info,
		modifyErrorCode : state.authentication.modify.error
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
		modifyRequest: (id, pw, nick) => {
      return dispatch(modifyRequest(id, pw, nick));
    },
		logoutRequest: () => {
			return dispatch(logoutRequest());
		},
		loginRequest: (id, pw) => {
			return dispatch(loginRequest(id, pw));
		}
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ModifyContainer);


