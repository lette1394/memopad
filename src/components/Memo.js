import React from 'react';
import TimeAgo from 'react-timeago';
import frenchStrings from 'react-timeago/lib/language-strings/ko'
import buildFormatter from 'react-timeago/lib/formatters/buildFormatter'
import { Link } from 'react-router';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

class Memo extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			editMode: false,
			commentMode: false,
			value: props.data.contents,
			commentValue: "",
			commentDeleteMode: false
		};
		
		this.toggleEdit = this.toggleEdit.bind(this);
		this.toggleComment = this.toggleComment.bind(this);
		this.handleChange = this.handleChange.bind(this);
		this.handleChangeComment = this.handleChangeComment.bind(this);
		this.handleRemove = this.handleRemove.bind(this);
		this.handleStar = this.handleStar.bind(this);
		this.handleKeyPress = this.handleKeyPress.bind(this);
		this.handleComment = this.handleComment.bind(this);
		this.handleCommentRemove = this.handleCommentRemove.bind(this);
		this.handleCommentRemoveModal = this.handleCommentRemoveModal.bind(this);
		this.handleCommentRemoveModalAgree = this.handleCommentRemoveModalAgree.bind(this);
	}

	componentDidMount() {
		// WHEN COMPONENT MOUNTS, INITIALIZE DROPDOWN
		// (TRIGGERED WHEN REFRESHED)
		$('#dropdown-button-' + this.props.data._id).dropdown({
			belowOrigin: true // Displays dropdown below the button
		});

		$('.modal').modal({startingTop: '5%', endingTop: '25%'});
	}

	shouldComponentUpdate(nextProps, nextState) {
		let current = {
			props: this.props,
			state: this.state
		};

		let next = {
			props: nextProps,
			state: nextState
		};

		let update = JSON.stringify(current) !== JSON.stringify(next);
		return update;
	}

	componentDidUpdate(prevProps, prveState) {
		// WHEN COMPONENT UPDATES, INITIALIZE DROPDOWN
		// (TRIGGERED WHEN LOGGED IN)
		$('#dropdown-button-' + this.props.data._id).dropdown({
			belowOrigin: true // Displays dropdown below the button
		});

		if (this.state.editMode) {
			// Trigger key up event to the edit input so that it auto-resizes (Materializecss Feature)
			$(this.input).keyup();
		}
	}

	toggleEdit() {
		if (this.state.editMode) {
			let id = this.props.data._id;
			let index = this.props.index;
			let contents = this.state.value;

			this.props.onEdit(id, index, contents).then(() => {
				this.setState({
					editMode: !this.state.editMode
				});
			});
		} else {
			this.setState({
				editMode: !this.state.editMode
			});
		}
	}

	toggleComment() {
		if (this.state.commentMode && this.state.commentValue) {
			this.handleComment().then((success) => {
				if (success) {
					Materialize.toast("댓글을 달았습니다", 4000);						
					this.setState({
						commentMode: !this.state.commentMode
					});
				} 
				else {
					Materialize.toast("댓글은 200자를 넘을 수 없습니다.", 4000);				
				}
			})
		} else {
			this.setState({
				commentMode: !this.state.commentMode
			});
		}
	}

	handleComment() {
		let id = this.props.data._id;
		let index = this.props.index;
		let comment = this.state.commentValue;
		
		if (comment.length < 200) {
			this.props.onComment(id, index, comment);

			this.setState({
				commentValue: ''
			})

			return new Promise((resolve, reject) => { resolve(true)} );
		} 
		else {
			return new Promise((resolve, reject) => { resolve(false)} );
		}
	}

	handleChange(e) {
		this.setState({
			value: e.target.value
		});
	}

	handleChangeComment(e) {
		this.setState({
			commentValue: e.target.value
		});
	}

	handleCommentRemoveModal(id, i) {		
		//$('#modal1').modal('open');
		this.handleCommentRemove(id, i);
	}

	handleCommentRemoveModalAgree() {
		this.setState({
			commentDeleteMode : true
		});
	}

	handleCommentRemove(id, i) {
		let memoId = this.props.data._id;
		let memoIndex = this.props.index;

		this.props.onCommentRemove(id, i, memoId, memoIndex);		
	}

	handleRemove() {
		const id = this.props.data._id;
		const index = this.props.index;

		this.props.onRemove(id, index);
	}

	handleStar() {
		const id = this.props.data._id;
		const index = this.props.index;

		this.props.onStar(id, index);
	}

	handleKeyPress(e) {
		if (e.charCode === 13) {
			this.toggleComment();
		} 
	}

	render() {
		var { data, ownership } = this.props;
		const mapToComponents = data => {
			
			return data.map((comment, i) => {
				return (
					<div className='comments'>
							<span className='nickname'>{comment.postedBy.nickname}</span>
							<span className='text'>{comment.text}</span>
							{ comment.postedBy.username == this.props.currentUser ? <span className='right'>
							<i onClick={() => this.handleCommentRemoveModal(comment._id, i)}
								data-commentId={comment._id}
								data-commentIndex={i}
								className='right-align material-icons'>clear</i></span> : undefined }
							{ comment.postedBy.username == this.props.currentUser ? commentRemoveModal : undefined }
					</div>
				);
			});
		};

		const dropDownMenu = (
			<div className="option-button">
				<a className='dropdown-button'
					id={`dropdown-button-${data._id}`}
					data-activates={`dropdown-${data._id}`}>
					<i className="material-icons icon-button">more_vert</i>
				</a>
				<ul id={`dropdown-${data._id}`} className='dropdown-content'>
					<li><a onClick={this.toggleEdit}>Edit</a></li>
					<li><a onClick={this.handleRemove}>Remove</a></li>
				</ul>
			</div>
		);

		const commentRemoveModal = (
			<div id="modal1" className="modal">
				<div className="modal-content">
					<h5>삭제 확인</h5>
					<p>정말 삭제하시겠습니까?</p>
				</div>
				<div className="modal-footer">
					<a className="modal-action modal-close waves-effect waves-red btn-flat">Cancle</a>
					<a onClick={this.handleCommentRemoveModalAgree} className="modal-action modal-close waves-effect waves-green btn-flat">Agree</a>
				</div>
			</div>		
		)

		// EDITED info
		const formatter = buildFormatter(frenchStrings);
		const editedInfo = (
			<cc className="edited" style={{ color: '#AAB5BC' }}><TimeAgo date={this.props.data.date.edited} live={true} formatter={formatter}/>_수정</cc>
		);

		const input_comment = (
			<div className="input-comment">
				<div className="row s12">
					<div className="input-field comment">
						<input 
							onChange={this.handleChangeComment} 
							value={this.state.commentValue}
							onKeyPress={this.handleKeyPress}
							name="comment" 
							type="text" 
							className='validate' 
							/>
						<label>Comment</label>
					</div>
					<div className="input-field enter">
						<a className="waves-effect waves" type="submit" name="action">
							<i onClick={this.toggleComment} className="material-icons">keyboard_return</i>
						</a>
					</div>
				</div>
			</div>
	);

		const starStyle = (this.props.data.starred.indexOf(this.props.currentUser) > -1) ? { color: '#ff9980' } : {};

		const commentButton = (
			<div className="card-action">
				<a onClick={this.toggleComment}>{ !this.state.commentMode ? `reply` : `cancle` }</a>
			</div>
		)

		const dumb = (
			<div className="card-action">
			</div>
		)

		const imgView = (
			<div className="card-image waves-effect waves-block waves-light">
				<img className="activator" src={`/img/${this.props.data.image}`} />
			</div>
		)

		const memoView = (
			<div className="card sticky-action hoverable">
				<div className="info">
					<Link to={`/wall/${this.props.data.postedBy.username}/${this.props.data.postedBy.nickname}`} className="username">{this.props.data.postedBy.nickname}</Link> <TimeAgo date={data.date.created} formatter={formatter} />
					{ this.props.data.is_edited ? editedInfo : undefined }
					{ ownership ? dropDownMenu : undefined }
				</div>

				{/* 디비에 image가 있으면 넣고 아니면 안넣고 */}
				{ this.props.data.image ? imgView : undefined} 

				<div className="card-reveal">
      		<span className="card-title grey-text text-darken-4 truncate">{data.contents}<i className="material-icons right over">close</i></span>
						<div className="card-content">
						<p className="flow-text">
							{data.contents}
						</p>
						</div>
    		</div>

				<div className="card-content">
				 { this.props.data.image ? 
				 	<p className='flow-text truncate'>
						{data.contents} 
					</p> 
					: 
					<p className="flow-text">
						{data.contents} 
					</p> }
					
				</div>
				<div className="footer">
					<i className="material-icons log-footer-icon star icon-button" style={starStyle} onClick={this.handleStar}>star</i>
					<i className="star-count">{data.starred.length}</i>
				</div>
				
				<div className="comments-wrapper">
					{mapToComponents(this.props.data.comments)}				
					{this.state.commentMode ? input_comment : undefined}
					{this.props.isLoggedIn ? commentButton : dumb}
				</div>
				
			</div>
		);

		const editView = (
			<div className="write">
				<div className="card">
					<div className="card-content">
						<textarea
							ref={ref => { this.input = ref; }}
							className="materialize-textarea"
							value={this.state.value}
							onChange={this.handleChange}></textarea>
					</div>
					<div className="card-action">
						<a onClick={this.toggleEdit}>OK</a>
					</div>
				</div>
			</div>
		);

		return ( 
			<div className="memo">
				{this.state.editMode ? editView : memoView}
			</div>
		);
	}
}

Memo.propTypes = {
	data: React.PropTypes.object,
	ownership: React.PropTypes.bool,
	onEdit: React.PropTypes.func,
	onRemove: React.PropTypes.func,
	onComment: React.PropTypes.func,
	onStar: React.PropTypes.func,
	currentUser: React.PropTypes.string,
	currentNickname: React.PropTypes.string
};

Memo.defaultProps = {
	data: {
		_id: 'id12367890',
		writer: 'Writer',
		nickname: 'nickkkk',
		contents: 'Contents',
		is_edited: false,
		image: 'img_0001.jpg',
		date: { edited: new Date(), created: new Date() },
		starred: [],
		comments: []
	},
	ownership: true,
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
	onCommentRemove : (id, index, i, idx) => {
		console.error('onCommentRemove not defined');		
	},
	currentUser: '',
	currentNickname: ''
};

export default Memo;
