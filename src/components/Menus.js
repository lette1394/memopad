import React, { Component } from 'react'
import './Menus.css'

const Buttons = () => {
	return (
		<div className='Buttons'>
			<div className='btn write'>
				글쓰기
			</div>
			<div className='btn modify'>
				회원정보수정
			</div>
		</div>
	);
};

export default Buttons;
