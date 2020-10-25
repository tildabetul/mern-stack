// Shortcut to write base of react component : rsfp

import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux'; // to get state from redux

const Alert = ({alerts}) =>
    alerts !== null && alerts.length > 0 && alerts.map(alert => [
        // Ex: 'alert alert-danger'
        <div key={alert.id} className={`alert alert-${alert.alertType}`}>
            {alert.msg}
        </div>
    ])

// to get state from redux
Alert.propTypes = {
    alerts: PropTypes.func.isRequired
};

// to get state from redux
const mapStateToProps = state => ({
    alerts: state.alert
});

export default connect(mapStateToProps)(Alert);