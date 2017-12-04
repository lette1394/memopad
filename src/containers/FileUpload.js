import React, {Component} from 'react';
import axios from 'axios';

class UploadFiles extends Component {
    componentWillMount(){
        this.setState({
            file: undefined
        });
    }
    handleSubmit(event){
        event.preventDefault();
        let formData = new FormData();
        formData.append('file', this.state.file);

        axios.post('/api/memo/uploadImages', formData)
            .then((response) => {
                console.log(response);
            })
            .catch((error) => {
                console.error(error);
            });
    }
    handleChange(event){
        console.log('file changed');
        let file = event.target.files[0];
        this.setState({file: file});
    }
    render(){
        return(
            <form onSubmit={this.handleSubmit.bind(this)}>
                <input type="file" onChange={this.handleChange.bind(this)}  multiple/>
                <button type="submit">Submit</button>
            </form>
        );
    }
}

export default UploadFiles;