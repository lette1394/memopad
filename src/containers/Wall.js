import React from 'react';
import { Home } from 'containers';

class Wall extends React.Component {
    render() {        
        return(
						<Home 
							username={this.props.params.username}
							nickname={this.props.params.nickname}
						/>
        );
    }
}

export default Wall;
