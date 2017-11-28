import React from 'react';
import { Link, browserHistory } from 'react-router';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

class Modify extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			username: "",
			password: "",
			password_confirm: "",
			nickname: ""
		};
		this.handleChange = this.handleChange.bind(this);
		this.handleCancle = this.handleCancle.bind(this);
		this.handleModify = this.handleModify.bind(this);
	}

	componentDidMount() {
		function getCookie(name) {
			var value = "; " + document.cookie;
			var parts = value.split("; " + name + "=");
			if (parts.length == 2) return parts.pop().split(";").shift();
		}

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

	handleCancle() {
		browserHistory.push('/');		
	}

	handleModify() {
		let id = this.state.username;
		let pw = this.state.password;
		let confirm = this.state.password_confirm;
		let nick = this.state.nickname;

		if (!confirm && !pw && !nick) {
			 Materialize.toast("적어도 하나의 항목을 입력해주세요", 4000);
			 return ;
		}

		if(confirm !== pw) {
			Materialize.toast("비밀번호가 일치하지 않습니다.", 4000);
			this.setState({
				password: '',
				password_confirm: ''
			});
			return ;
		}

		this.props.onModify(id, pw, nick).then(
			(success) => {
				if(!success) {
					this.setState({
						password: '',
						password_confirm: '',
						nickname: ''
					})
				}
			}
		)
	}

	render() {
		const registerBoxes = (
					<div className='left'>
							<div className="input-field col s12">
							<label>ID는 수정이 불가능합니다</label>
							<input
							disabled
							name="username"
							type="text"
							className="validate"
							onChange={this.handleChange}
							/>
					</div>
					<div className="input-field col s12">
							<input
							name="password"
							type="password"
							className="validate"
							value={this.state.password}
							onChange={this.handleChange}
							/>
							<label>변경할 Password</label>							
					</div>
					<div className="input-field col s12">
							<input
							name="password_confirm"
							type="password"
							className="validate"
							value={this.state.password_confirm}
							onChange={this.handleChange}
							/>
							<label>변경할 Password Confirm</label>							
					</div>
					<div className="input-field col s12">
							<input
							name="nickname"
							type="text"
							className="validate"
							value={this.state.nickname}
							onChange={this.handleChange}
							/>
							<label>변경할 Nickname</label>							
					</div>
			</div>
			);
		const registerView = (
			<div className="card-content">
					<div className="row">
							{ registerBoxes }
							<a onClick={this.handleModify} className="waves-effect waves-light btn modify">수정</a>
							<a onClick={this.handleCancle} className="waves-effect waves-light btn cancle">취소</a>
					</div>
			</div>
		);

		return (
			<ReactCSSTransitionGroup
				transitionName="example"
				transitionAppear={true}
			>
				<div className="container auth">
					<Link className="logo" to="/">Sasanghwal</Link>
					<div className="card">
						<div className="grey darken-2 white-text center flow-text">
							<div className="card-content">
							<p>회원정보수정</p> 
							<p></p>
							</div>
						</div>
						{registerView}
					</div>
				</div>
			</ReactCSSTransitionGroup>
		);
	}
}

Modify.propTypes = {
	mode: React.PropTypes.bool,
	onLogin: React.PropTypes.func,
	onRegister: React.PropTypes.func
};

Modify.defaultProps = {
	mode: true,
	onLogin: (id, pw) => { console.error("onLogin not defined"); },
	onRegister: (id, pw, nick) => { console.error("onRegister not defined"); }
};


export default Modify;
