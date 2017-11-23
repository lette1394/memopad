import React, { Component } from 'react'
import { Link } from 'react-router';
import './Menus.css'

const Buttons = () => {
	return (
		<div className='Buttons'>
		<Link to="/write">
			<div className='btn write'>
				글쓰기
			</div>
		</Link>
		<Link to="/modify">		
			<div className='btn modify'>
				회원정보수정
			</div>
		</Link>
		</div>
	);
};

export default Buttons;
