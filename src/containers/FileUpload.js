import React from 'react';
import axios from 'axios';

class UploadFiles extends React.Component {

    constructor(props) {
        super(props);
        console.log('constructor');

        this.state = {
            file: undefined
        };
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    componentWillMount(){
        this.setState({
            file: undefined
        });
    }
    handleSubmit(event){
        event.preventDefault();
        let formData = new FormData();
        formData.append('file', this.state.file);

        // axios.post('/api/memo/upload', formData)
        //     .then((response) => {
        //         console.log(response);
        //     })
        //     .catch((error) => {
        //         console.error(error);
        //     });
    }
    handleChange(event){
        let file = event.target.files[0];
        this.props.onFileChanged(file);
    }
    render(){
        return(
            <form onSubmit={this.handleSubmit}>
							<div className="file-field input-field">
								<div className="btn">
									<span className="file-btn"><i className="material-icons center-align">image</i></span>
									<input className="file-input" type="file" onChange={this.handleChange}/>
								</div>
								<div className="file-path-wrapper">
									<input className="file-path validate" type="text" placeholder="이미지 업로드" />
								</div>
							</div>
            </form>
        );
    }
}

UploadFiles.propTypes = {
    onFileChanged: React.PropTypes.func,
};

UploadFiles.defaultProps = {
    onFileChanged: () => {
        console.error('onFileChanged not defined');
    },
};

export default UploadFiles;