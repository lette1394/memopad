import React from 'react';
import { Authentication } from 'components';
import { connect } from 'react-redux';
import { registerRequest } from 'actions/authentication';
import { browserHistory } from 'react-router';

class Register extends React.Component {

    constructor(props) {
        super(props);
        this.handleRegister = this.handleRegister.bind(this);
    }

    handleRegister(id, pw, nick) {
        return this.props.registerRequest(id, pw, nick).then(
            () => {
                if(this.props.status === "SUCCESS") {
                    Materialize.toast('회원가입 성공! 로그인 해주세요~', 2000);
                    browserHistory.push('/login');
                    return true;
                } else {
                    /*
                       ERROR CODES:
                           1: BAD USERNAME
                           2: BAD PASSWORD
													 3: USERNAME EXISTS
													 4: NICKNAME EXISTS
                   */
                   let errorMessage = [
                       'Invalid Username',
                       'Password is too short',
											 'Username already exists',
											 'Nickname already exists'
                   ];

                   let $toastContent = $('<span style="color: #FFB4BA">' + errorMessage[this.props.errorCode - 1] + '</span>');
                    Materialize.toast($toastContent, 2000);
                    return false;
                }
            }
        );
    }
    render() {
        return (
            <div>
                <Authentication mode={false} onRegister={this.handleRegister}/>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        status: state.authentication.register.status,
        errorCode: state.authentication.register.error
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        registerRequest: (id, pw, nick) => {
            return dispatch(registerRequest(id, pw, nick));
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Register);
