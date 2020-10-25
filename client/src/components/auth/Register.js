import React, {Fragment, useState} from "react";
import {Link} from "react-router-dom";
// To connect redux action
import {connect} from 'react-redux';
import {setAlert} from '../../actions/alert';
import PropTypes from 'prop-types';

const Register = ({ setAlert }) => {
    // States
    const [formData, setFormData] = useState({
        //Initial state:
        name: '',
        email: '',
        password: '',
        password2: ''
    });

    const {name, email, password, password2} = formData;

    const onChange = e => {
        setFormData({...formData, [e.target.name]: e.target.value}); // REMEMBERME Use formData and only change name, etc !!!
    }

    const onSubmit = async e => {
        e.preventDefault(); // REMEMBERME for onSubmit
        if (password !== password2) {
            setAlert('Passwords do not match', 'danger');
        } else {
            console.log('Successful');
        }
    }

    return <Fragment>
        <h1 className="large text-primary">Sign Up</h1>
        <p className="lead"><i className="fas fa-user"></i> Create Your Account</p>
        <form className="form" onSubmit={e => onSubmit(e)}>
            <div className="form-group">
                <input type="text" placeholder="Name" name="name" required onChange={e => onChange(e)}/>
            </div>
            <div className="form-group">
                <input type="email" placeholder="Email Address" name="email" required onChange={e => onChange(e)}/>
                <small className="form-text"
                >This site uses Gravatar so if you want a profile image, use a
                    Gravatar email</small
                >
            </div>
            <div className="form-group">
                <input
                    type="password"
                    placeholder="Password"
                    name="password"
                    minLength="6"
                    required
                    onChange={e => onChange(e)}
                />
            </div>
            <div className="form-group">
                <input
                    type="password"
                    placeholder="Confirm Password"
                    name="password2"
                    minLength="6"
                    required
                    onChange={e => onChange(e)}
                />
            </div>
            <input type="submit" className="btn btn-primary" value="Register"/>
        </form>
        <p className="my-1">
            Already have an account? <Link to="/login">Sign In</Link>
        </p>
    </Fragment>
};

Register.propTypes = {
    setAlert: PropTypes.func.isRequired,
}

export default connect(null, {setAlert})(Register);
