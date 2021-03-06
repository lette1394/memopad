import React from 'react';
import { Memo } from 'components';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

class MemoList extends React.Component {

	shouldComponentUpdate(nextProps, nextState) {
		let update = JSON.stringify(this.props) !== JSON.stringify(nextProps);
		return update;
	}

	render() {
		const mapToComponents = data => {
			return data.map((memo, i) => {
				return (
					<Memo
						data={memo}
						ownership={memo.writer === this.props.currentUser}
						isLoggedIn={this.props.isLoggedIn}
						key={memo._id}
						onEdit={this.props.onEdit}
						onComment={this.props.onComment}
						onCommentRemove={this.props.onCommentRemove}
						onRemove={this.props.onRemove}
						onStar={this.props.onStar}
						index={i}
						currentUser={this.props.currentUser}
						currentNickname={this.props.currentNickname}
					/>

				);
			});
		};

		return (
			<div className="flex-wrapper">
				<ReactCSSTransitionGroup
					transitionName="memo"
					transitionEnterTimeout={2000}
					transitionLeaveTimeout={1000}>
					{mapToComponents(this.props.data)}
				</ReactCSSTransitionGroup>
			</div>
		);
	}
}

MemoList.propTypes = {
	data: React.PropTypes.array,
	currentUser: React.PropTypes.string,
	currentNickname: React.PropTypes.string,
	onEdit: React.PropTypes.func,
	onRemove: React.PropTypes.func,
	onStar: React.PropTypes.func,
	onComment: React.PropTypes.func
};

MemoList.defaultProps = {
	data: [],
	currentUser: '',
	currentNickname: '',
	onEdit: (id, index, contents) => {
		console.error('onEdit not defined');
	},
	onRemove: (id, index) => {
		console.error('onRemove not defined');
	},
	onStar: (id, index) => {
		console.error('onStar not defined');
	},
	onComment: (id, index, comment) => {
		console.error('onComment not defined');		
	}, 
	onCommentRemove: (id, index, i, idx) => {
		console.error('onCommentRemove not defined');		
	}
};

export default MemoList;
