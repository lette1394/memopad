import React from 'react';
import { Link } from 'react-router';
import { Search, Menus } from 'components';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import { SideNav, SideNavItem, Button } from 'react-materialize';

class Header extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			search: false
		};

		this.toggleSearch = this.toggleSearch.bind(this);
		this.handleLogoutConfirmModal = this.handleLogoutConfirmModal.bind(this);
	}

	componentDidMount() {
		$('.modal').modal({startingTop: '5%', endingTop: '25%'});
	}

	toggleSearch() {
		this.setState({
			search: !this.state.search
		});
	}

	handleLogoutConfirmModal() {
		$('#modal-logout').modal('open');
	}

	render() {
		const logoutModal = (
			<div id="modal-logout" className="modal">
				<div className="modal-content">
					<h5>가지말아요</h5>
					<p>정말 로그아웃 하시겠습니까?</p>
				</div>
				<div className="modal-footer">
					<a className="modal-action modal-close waves-effect waves-red btn-flat">Cancle</a>
					<a onClick={this.props.onLogout} className="modal-action modal-close waves-effect waves-green btn-flat">Agree</a>
				</div>
			</div>		
		)

		const loginButton = (
			<li>
				<Link to="/login"><i className="material-icons">vpn_key</i>로그인</Link>
			</li>
		);

		const logoutButton = (
			<li>
				<a onClick={this.handleLogoutConfirmModal}><i className="material-icons">lock_open</i>로그아웃</a>
			</li>
		);

		const sideNavigation = (
			<div className='sideNav'>
				<SideNav
					trigger={<a data-activates="slide-out" class="button -collapse"><i className="material-icons">menu</i></a>}
					options={{ closeOnClick: true, menuWidth: '280' }}
				>
					<SideNavItem userView
						user={{
							background: 'https://png.pngtree.com/thumb_back/fh260/back_pic/00/01/80/73560a545c6ae6b.jpg',
							image: 'https://react-materialize.github.io/img/yuna.jpg',
							name: this.props.isLoggedIn ? "아이디 : " + this.props.username : "USER ID", 
							email: this.props.isLoggedIn ? "별명 : " + this.props.nickname : "NICKNAME",
						}}
					/>
					<SideNavItem>{this.props.isLoggedIn ? logoutButton : loginButton}</SideNavItem>
					<SideNavItem divider />
					<SideNavItem subheader>회원메뉴</SideNavItem>
					{ this.props.isLoggedIn ? <Link to="/write"><SideNavItem icon='create'>글쓰기</SideNavItem></Link> : undefined }
					{ this.props.isLoggedIn ? <Link to="/modify"><SideNavItem icon='assignment_ind'>회원정보수정</SideNavItem></Link> : undefined }
					{ this.props.isLoggedIn ? undefined : <SideNavItem waves>로그인이 필요합니다</SideNavItem> }
				</SideNav>
			</div>
		);

		return (
			<div>
				<nav className='fixed'>
					<div className="nav-wrapper red lighten-2">
						<Link to="/" className="brand-logo center">TIMELINE</Link>
					
						<ul>
							<li>{sideNavigation}</li>
							{ this.props.isLoggedIn ? logoutModal : undefined }								
							
							<li className='right'><a onClick={this.toggleSearch}><i className="material-icons">search</i></a></li>
						</ul>
					</div>
				</nav>
				<ReactCSSTransitionGroup transitionName="search" transitionEnterTimeout={300} transitionLeaveTimeout={300}>
					{this.state.search ? <Search onClose={this.toggleSearch}
						onSearch={this.props.onSearch}
						searchAccounts={this.props.accounts} /> : undefined}
				</ReactCSSTransitionGroup>
			</div>
		);
	}
}

Header.propTypes = {
	isLoggedIn: React.PropTypes.bool,
	onLogout: React.PropTypes.func,
  accounts: React.PropTypes.array
};

Header.defaultProps = {
	isLoggedIn: false,
	onLogout: () => { console.error("logout function not defined"); },
	accounts: []
};

export default Header;
