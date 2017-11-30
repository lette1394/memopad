import React from 'react';
import { connect } from 'react-redux';
import { Write, MemoList } from 'components';
import { browserHistory } from 'react-router';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import {
	memoPostRequest,
	memoListRequest,
	memoEditRequest,
	memoRemoveRequest,
	memoStarRequest,
	memoCommentRequest,
	memoCommentRemoveRequest
} from 'actions/memo';



class Home extends React.Component {

	constructor(props) {
		super(props);
		this.handlePost = this.handlePost.bind(this);
		this.handleEdit = this.handleEdit.bind(this);
		this.handleRemove = this.handleRemove.bind(this);
		this.handleStar = this.handleStar.bind(this);
		this.loadNewMemo = this.loadNewMemo.bind(this);
		this.loadOldMemo = this.loadOldMemo.bind(this);
		this.handleComment = this.handleComment.bind(this);
		this.handleCommentRemove = this.handleCommentRemove.bind(this);
		
		this.state = {
			loadingState: false,
			initiallyLoaded: false
		};
	}

	componentDidMount() {
		const loadMemoLoop = () => {
			this.loadNewMemo().then(
				() => {
					this.memoLoaderTimeoutId = setTimeout(loadMemoLoop, 5000);
				}
			);
		};

		const loadUntilScrollable = () => {
			// IF THE SCROLLBAR DOES NOT EXIST,
			if ($("body").height() < $(window).height()) {
				this.loadOldMemo().then(
					() => {
						// DO THIS RECURSIVELY UNLESS IT'S LAST PAGE
						if (!this.props.isLast) {
							loadUntilScrollable();
						}
					}
				);
			}
		};


		this.props.memoListRequest(true, undefined, undefined, this.props.username).then(
			() => {
				setTimeout(loadUntilScrollable, 1000);
				loadMemoLoop();
				this.setState({
					initiallyLoaded: true
				});
			}
		);

		$(window).scroll(() => {
			// WHEN HEIGHT UNDER SCROLLBOTTOM IS LESS THEN 250
			if ($(document).height() - $(window).height() - $(window).scrollTop() < 250) {
				if (!this.state.loadingState) {
					this.loadOldMemo();
					this.setState({
						loadingState: true
					});
				}
			} else {
				if (this.state.loadingState) {
					this.setState({
						loadingState: false
					});
				}
			}
		});
	}

	componentWillUnmount() {
		// STOPS THE loadMemoLoop
		clearTimeout(this.memoLoaderTimeoutId);

		// REMOVE WINDOWS SCROLL LISTENER
		$(window).unbind();

		this.setState({
			initiallyLoaded: false
		});
	}

	componentDidUpdate(prevProps, prevState) {
		if (this.props.username !== prevProps.username) {
			this.componentWillUnmount();
			this.componentDidMount();
		}
	}

	loadNewMemo() {
		// CANCEL IF THERE IS A PENDING REQUEST
		if (this.props.listStatus === 'WAITING') {
			return new Promise((resolve, reject) => {
				resolve();
			});
		}

		// IF PAGE IS EMPTY, DO THE INITIAL LOADING
		if (this.props.memoData.length === 0) {
			return this.props.memoListRequest(true);			
		}

		return this.props.memoListRequest(false, 'new', this.props.memoData[0]._id, this.props.username);
	}

	loadOldMemo() {
		// CANCEL IF USER IS READING THE LAST PAGE
		if (this.props.isLast) {
			return new Promise(
				(resolve, reject) => {
					resolve();
				}
			);
		}

		// GET ID OF THE MEMO AT THE BOTTOM
		let lastId = this.props.memoData[this.props.memoData.length - 1]._id;

		// START REQUEST
		return this.props.memoListRequest(false, 'old', lastId, this.props.username).then(() => {
			// IF IT IS LAST PAGE, NOTIFY
			if (this.props.isLast) {
				Materialize.toast('마지막 페이지 입니다', 4000);
			}
		});
	}

	handlePost(contents) {
		return this.props.memoPostRequest(contents).then(
			() => {
				if (this.props.postStatus.status === "SUCCESS") {
					// TRIGGER LOAD NEW MEMO
					// TO BE IMPLEMENTED
					this.loadNewMemo().then(
						() => {
							Materialize.toast("저장되었습니다", 2000);
						}
					);
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
							$toastContent = $('<span style="color: #FFB4BA">로그인이 필요합니다</span>');
							Materialize.toast($toastContent, 4000);
							setTimeout(() => { location.reload(false); }, 4000);
							break;
						case 2:
							$toastContent = $('<span style="color: #FFB4BA">내용을 입력해 주세요</span>');
							Materialize.toast($toastContent, 4000);
							break;
						default:
							$toastContent = $('<span style="color: #FFB4BA">에러</span>');
							Materialize.toast($toastContent, 4000);
							break;
					}
				}
			}
		);
	}

	handleEdit(id, index, contents) {
		return this.props.memoEditRequest(id, index, contents).then(() => {
			if (this.props.editStatus.status === 'SUCCESS') {
				Materialize.toast('수정 완료!', 2000);
			} else {
				/*
							 ERROR CODES
									 1: INVALID ID,
									 2: EMPTY CONTENTS
									 3: NOT LOGGED IN
									 4: NO RESOURCE
									 5: PERMISSION FAILURE
				*/
				let errorMessage = [
					'Something broke',
					'내용을 입력해 주세요',
					'로그인이 필요합니다',
					'메모가 삭제되었습니다',
					'권한이 없습니다'
				];

				let error = this.props.editStatus.error;

				// NOTIFY ERROR
				let $toastContent = $('<span style="color: #FFB4BA">' + errorMessage[error - 1] + '</span>');
				Materialize.toast($toastContent, 2000);

				// IF NOT LOGGED IN, REFRESH THE PAGE AFTER 2 SECONDS
				if (error === 3) {
					setTimeout(() => { location.reload(false); }, 2000);
				}
			}
		});
	}

	handleComment(id, index, comment) {
		this.props.memoCommentRequest(id, index, comment).then(() => {
			if (this.props.commentStatus.status === "SUCCESS") {
				//toast!

			} else {
				/*
				DELETE MEMO: DELETE /api/memo/:id
				ERROR CODES
						1: INVALID ID
						2: NOT LOGGED IN
						3: NO RESOURCE
						4: PERMISSION FAILURE
				*/
				let errorMessage = [
					'Something broke',
					'로그인 해주세요',
					'메모가 존재하지 않습니다',
					'권한이 없습니다'
				];

				// NOTIFY ERROR
				let $toastContent = $('<span style="color: #FFB4BA">' + errorMessage[this.props.commentStatus.error - 1] + '</span>');
				Materialize.toast($toastContent, 4000);
			}
		})
	}

	handleCommentRemove(id, index, memoId, memoIndex) {
		this.props.memoCommentRemoveRequest(id, index, memoId, memoIndex).then(() => {
			if (this.props.commentRemoveStatus.status === "SUCCESS") {
				//toast!
				Materialize.toast("댓글을 지웠습니다", 4000);				

			} else {
				/*
				DELETE MEMO: DELETE /api/memo/:id
				ERROR CODES
						1: INVALID ID
						2: NOT LOGGED IN
						3: NO RESOURCE
						4: PERMISSION FAILURE
				*/
				let errorMessage = [
					'Something broke',
					'로그인 해주세요',
					'댓글이 존재하지 않습니다',
					'권한이 없습니다'
				];

				// NOTIFY ERROR
				let $toastContent = $('<span style="color: #FFB4BA">' + errorMessage[this.props.commentStatus.error - 1] + '</span>');
				Materialize.toast($toastContent, 4000);
			}
		})
	}

	handleRemove(id, index) {
		this.props.memoRemoveRequest(id, index).then(
			() => {
				if (this.props.removeStatus.status === "SUCCESS") {
					Materialize.toast('삭제되었습니다', 2000);				
					setTimeout(() => {
						if ($("body").height() < $(window).height()) {
							this.loadOldMemo();
						}
					}, 1000);
				} else {
					/*
					DELETE MEMO: DELETE /api/memo/:id
					ERROR CODES
							1: INVALID ID
							2: NOT LOGGED IN
							3: NO RESOURCE
							4: PERMISSION FAILURE
					*/
					let errorMessage = [
						'Something broke',
						'로그인 해주세요',
						'메모가 존재하지 않습니다',
						'권한이 없습니다'
					];

					// NOTIFY ERROR
					let $toastContent = $('<span style="color: #FFB4BA">' + errorMessage[this.props.removeStatus.error - 1] + '</span>');
					Materialize.toast($toastContent, 2000);


					// IF NOT LOGGED IN, REFRESH THE PAGE
					if (this.props.removeStatus.error === 2) {
						setTimeout(() => { location.reload(false); }, 2000);
					}
				}
			}
		);
	}

	handleStar(id, index) {
		this.props.memoStarRequest(id, index).then(
			() => {
				if (this.props.starStatus.status !== "SUCCESS") {
					/*
							TOGGLES STAR OF MEMO: POST /api/memo/star/:id
							ERROR CODES
									1: INVALID ID
									2: NOT LOGGED IN
									3: NO RESOURCE
					*/
					let errorMessage = [
						'무언가 잘못되었습니다',
						'로그인 해주세요',
						'메모가 존재하지 않습니다'
					];


					// NOTIFY ERROR
					let $toastContent = $('<span style="color: #FFB4BA">' + errorMessage[this.props.starStatus.error - 1] + '</span>');
					Materialize.toast($toastContent, 4000);

					// IF NOT LOGGED IN, REFRESH THE PAGE
					if (this.props.starStatus.error === 2) {
						let $toastContent = $('<span style="color: #FFB4BA">' + '잠시 후 로그인 화면으로 이동합니다' + '</span>');
						setTimeout(() => { Materialize.toast($toastContent, 5000) }, 1000);
						setTimeout(() => { browserHistory.push('/login') }, 3000);
					}
				}
			}
		);
	}

	render() {
		const write = (<Write onPost={this.handlePost} />);

		const emptyView = (
			<div className="container">
				<div className="empty-page">
					<b>{this.props.nickname}</b> 메모를 작성하지 않았습니다
                </div>
			</div>
		);

		const wallHeader = (
			<div className='wall-header'>
				<ReactCSSTransitionGroup
					transitionName="example"
					transitionAppear={true}>
					<div className="container wall-info">
						<div className="card wall-info blue lighten-2 white-text">
							<div className="card-content">
							{this.props.nickname} ({this.props.username})
							</div>
						</div>
					</div>
					{this.state.initallyLoaded && this.props.memoData.length === 0 ? emptyView : undefined}
				</ReactCSSTransitionGroup>

			</div>
		);

		return (
			<div className="wrapper">
				{typeof this.props.username !== 'undefined' ? wallHeader : undefined}
				{/* {this.props.isLoggedIn ? <Write onPost={this.handlePost} /> : undefined} */}
				<MemoList
					data={this.props.memoData}
					isLoggedIn={this.props.isLoggedIn}
					currentUser={this.props.currentUser}
					currentNickname={this.props.currentNickname}
					onEdit={this.handleEdit}
					onComment={this.handleComment}
					onRemove={this.handleRemove}
					onCommentRemove={this.handleCommentRemove}
					onStar={this.handleStar} />
			</div>
		);
	}
} 

Home.PropTypes = {
	username: React.PropTypes.string,
	nickname: React.PropTypes.string
};

Home.defaultProps = {
	username: undefined,
	nickname: undefined
};

const mapStateToProps = (state) => {
	return {
		isLoggedIn: state.authentication.status.isLoggedIn,
		postStatus: state.memo.post,
		currentUser: state.authentication.status.currentUser,
		currentNickname: state.authentication.status.currentNickname,
		memoData: state.memo.list.data,
		listStatus: state.memo.list.status,
		isLast: state.memo.list.isLast,
		editStatus: state.memo.edit,
		removeStatus: state.memo.remove,
		starStatus: state.memo.star,
		commentStatus: state.memo.comment,
		commentRemoveStatus: state.memo.commentRemove
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		memoPostRequest: (contents) => {
			return dispatch(memoPostRequest(contents));
		},
		memoListRequest: (isInitial, listType, id, username) => {
			return dispatch(memoListRequest(isInitial, listType, id, username));
		},
		memoEditRequest: (id, index, contents) => {
			return dispatch(memoEditRequest(id, index, contents));
		},
		memoRemoveRequest: (id, index) => {
			return dispatch(memoRemoveRequest(id, index));
		},
		memoStarRequest: (id, index) => {
			return dispatch(memoStarRequest(id, index));
		},
		memoCommentRequest: (id, index, comment) => {
			return dispatch(memoCommentRequest(id, index, comment));
		},
		memoCommentRemoveRequest: (id, index, memoId, memoIndex) => {
			return dispatch(memoCommentRemoveRequest(id, index, memoId, memoIndex));
		},
	};
};


export default connect(mapStateToProps, mapDispatchToProps)(Home);
