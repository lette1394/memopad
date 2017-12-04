import React from 'react';
import {connect} from 'react-redux';
import {memoPostRequest} from 'actions/memo';
import {browserHistory} from 'react-router';
import UploadFiles from "./FileUpload";

class Write extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            contents: ''
        };
        this.handleChange = this.handleChange.bind(this);
        this.handlePost = this.handlePost.bind(this);
    }

    handleChange(e) {
        this.setState({
            contents: e.target.value
        });
    }

    handlePost() {
        let contents = this.state.contents;
        return this.props.memoPostRequest(contents).then(
            () => {
                if (this.props.postStatus.status === "SUCCESS") {
                    Materialize.toast("저장되었습니다.", 4000);
                    browserHistory.push('/');
                } else {
                    /*
                            ERROR CODES
                                    1: NOT LOGGED IN
                                    2: EMPTY CONTENTS
                    */

                    let $toastContent;
                    switch (this.props.postStatus.error) {
                        case 1:
                            // IF NOT LOGGED IN, NOTIFY AND REFRESH AFTER
                            $toastContent = $('<span style="color: #FFB4BA">You are not logged in</span>');
                            Materialize.toast($toastContent, 2000);
                            setTimeout(() => {
                                location.reload(false);
                            }, 2000);
                            break;
                        case 2:
                            $toastContent = $('<span style="color: #FFB4BA">Please write something</span>');
                            Materialize.toast($toastContent, 2000);
                            break;
                        default:
                            $toastContent = $('<span style="color: #FFB4BA">Something Broke</span>');
                            Materialize.toast($toastContent, 2000);
                            break;
                    }
                }
            }
        );
    }


    render() {
        return (
            <div className="container write">
                <div className="card">
                    <div className="card-content">
						<textarea className="materialize-textarea" placeholder="내용을 입력해주세요"
                                  value={this.state.contents}
                                  onChange={this.handleChange}></textarea>
                    </div>
                    <div>
                        <UploadFiles></UploadFiles>
                    </div>
                    <div className="card-action">
                        <a onClick={this.handlePost}>POST</a>
                    </div>
                </div>
            </div>
        );
    }
}

Write.PropTypes = {
    onPost: React.PropTypes.func
};

Write.defaultProps = {
    onPost: (contents) => {
        console.error('onPost not defined');
    },
};

const mapStateToProps = (state) => {
    return {
        postStatus: state.memo.post
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        memoPostRequest: (contents) => {
            return dispatch(memoPostRequest(contents));
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Write);
