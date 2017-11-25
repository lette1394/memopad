import React from 'react';
import { Link } from 'react-router';
import { Search, Menus } from 'components';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import { SideNav, SideNavItem, Button } from 'react-materialize';

class Header extends React.Component {

	constructor(props) {
		super(props);

		// IMPLEMENT: CREATE A SEARCH STATUS
		this.state = {
			search: false
		};

		this.toggleSearch = this.toggleSearch.bind(this);
	}

	toggleSearch() {
		this.setState({
			search: !this.state.search
		});
	}

	render() {

		const loginButton = (
			<li>
				<Link to="/login"><i className="material-icons">vpn_key</i>로그인 해주세요</Link>
			</li>
		);

		const logoutButton = (
			<li>
				<a onClick={this.props.onLogout}><i className="material-icons">lock_open</i>로그아웃</a>
			</li>
		);
	
		const sideNavigation = (
			<div className='sideNav'>
				<SideNav
					trigger={<i className="material-icons">menu</i>}
					options={{ closeOnClick: true }}
				>
					<SideNavItem userView
						user={{
							background: 'https://png.pngtree.com/thumb_back/fh260/back_pic/00/01/80/73560a545c6ae6b.jpg',
							image: 'https://react-materialize.github.io/img/yuna.jpg',
							name: 'User name',
							email: 'abc@gmail.com'
						}}
					/>
					<SideNavItem>{this.props.isLoggedIn ? logoutButton : loginButton}</SideNavItem>
					<SideNavItem divider />
					<SideNavItem subheader>회원메뉴</SideNavItem>
					{ this.props.isLoggedIn ? <Link to="/write"><SideNavItem waves icon='create'>글쓰기</SideNavItem></Link> : undefined }
					{ this.props.isLoggedIn ? <Link to="/write"><SideNavItem waves icon='assignment_ind'>회원정보수정</SideNavItem></Link> : undefined }
					<SideNavItem waves>Third Link With Waves</SideNavItem>
				</SideNav>
			</div>
		);

		return (
			<div >
				<nav className='fixed'>
					<div className="nav-wrapper red lighten-2">
						<Link to="/" className="brand-logo center">TIMELINE</Link>
					
						<ul>
							<li><a href="#" data-activates="slide-out" class="button -collapse">{sideNavigation}</a></li>
							<li><a onClick={this.toggleSearch}><i className="material-icons">search</i></a></li>
						</ul>
					</div>
				</nav>
				<ReactCSSTransitionGroup transitionName="search" transitionEnterTimeout={300} transitionLeaveTimeout={300}>
					{this.state.search ? <Search onClose={this.toggleSearch}
						onSearch={this.props.onSearch}
						usernames={this.props.usernames} /> : undefined}
				</ReactCSSTransitionGroup>
			</div>
		);
	}
}

Header.propTypes = {
	isLoggedIn: React.PropTypes.bool,
	onLogout: React.PropTypes.func,
	usernames: React.PropTypes.array
};

Header.defaultProps = {
	isLoggedIn: false,
	onLogout: () => { console.error("logout function not defined"); },
	usernames: []
};

export default Header;
