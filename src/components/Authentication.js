import React from 'react';
import { Link } from 'react-router';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

class Authentication extends React.Component {

    constructor(props) {
        super(props);
        this.state = { 
            username: "",
						password: "",
						nickname: ""
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleLogin = this.handleLogin.bind(this);
        this.handleRegister = this.handleRegister.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
    }

    handleChange(e) {
        let nextState = {};
        nextState[e.target.name] = e.target.value;
        this.setState(nextState);
    }

    handleLogin() {
        let id = this.state.username;
        let pw = this.state.password;

        this.props.onLogin(id, pw).then(
            (success) => {
                if(!success) {
                    this.setState({
                        password: ''
                    });
                }
            }
        );
    }

    handleRegister() {
        let id = this.state.username;
				let pw = this.state.password;
				let nick = this.state.nickname;

        this.props.onRegister(id, pw, nick).then(
            (success) => {
                if(!success) {
                    this.setState({
												username: '',
												password: '',
												nickname: ''
                    });
                }
            }
        );
    }

    handleKeyPress(e) {
        if(e.charCode ===13 ){
            if(this.props.mode) {
                this.handleLogin();
            } else {
                this.handleRegister();
            }
        }
    }

    render() {
        const loginBoxes = (
            <div>
                <div className="input-field col s12 username">
                    <label>ID</label>
                    <input
                    name="username"
                    type="text"
                    className="validate"
                    value={this.state.username}
                    onChange={this.handleChange}
                    />
                </div>
                <div className="input-field col s12">
                    <label>Password</label>
                    <input
                    name="password"
                    type="password"
                    className="validate"
                    value={this.state.password}
                    onChange={this.handleChange}
                    onKeyPress={this.handleKeyPress}/>
                </div>
            </div>
				);
				
				const registerBoxes = (
					<div>
							<div className="input-field col s12 username">
									<label>ID</label>
									<input
									name="username"
									type="text"
									className="validate"
									value={this.state.username}
									onChange={this.handleChange}
									/>
							</div>
							<div className="input-field col s12">
									<label>Password</label>
									<input
									name="password"
									type="password"
									className="validate"
									value={this.state.password}
									onChange={this.handleChange}
									/>
							</div>
							<div className="input-field col s12 username">
									<label>Nickname (보여지는 이름입니다)</label>
									<input
									name="nickname"
									type="text"
									className="validate"
									value={this.state.nickname}
									onChange={this.handleChange}
									onKeyPress={this.handleKeyPress}
									/>
							</div>
					</div>
			);


        const loginView = (
            <div>
                <div className="card-content">
                    <div className="row">
                        { loginBoxes }
                        <a onClick={this.handleLogin} className="waves-effect waves-light btn">SUBMIT</a>
                    </div>
                </div>
                <div className="footer">
                    <div className="card-content">
                        <div className="right" >
                        처음이신가요? <Link to="/register">회원가입</Link>
                        </div>
                    </div>
                </div>
            </div>
        );

        const registerView = (
           <div className="card-content">
               <div className="row">
                   { registerBoxes }
                   <a onClick={this.handleRegister} className="waves-effect waves-light btn">CREATE</a>
               </div>
           </div>
       );

        return(
					<ReactCSSTransitionGroup 
					transitionName="example" 
					transitionAppear={true}
				> 
            <div className="container auth">
                <Link className="logo" to="/">Sasanghwal</Link>
                <div className="card">
                    <div className="header red darken-2 white-text center">
                        <div className="card-content">{this.props.mode ? "LOGIN" : "REGISTER"}</div>
                    </div>
										
																				
										{this.props.mode ? loginView : registerView }
										
                </div>
            </div>
						</ReactCSSTransitionGroup>
        );
    }

}

Authentication.propTypes = {
    mode: React.PropTypes.bool,
    onLogin: React.PropTypes.func,
    onRegister: React.PropTypes.func
};

Authentication.defaultProps = {
    mode: true,
    onLogin: (id, pw) => { console.error("onLogin not defined"); },
    onRegister: (id, pw, nick) => { console.error("onRegister not defined"); }
};

export default Authentication;
