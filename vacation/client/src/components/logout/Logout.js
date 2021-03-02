import React, { useContext } from 'react';
import { useHistory } from 'react-router-dom';
import UserContext from '../contexts/UserContext';

const Logout = (props) => {
    const { setAuthorized } = useContext(UserContext);

    const history = useHistory();

    const handleLogout = async () => {
        const res = await fetch('/api/logout');

        const data = await res.json();

        if (data.success) {
            setAuthorized(false)
            history.push('/login');
        }
    }

    return (
        <div>
            <button className="btn btn-outline-secondary" onClick={handleLogout}>Logout</button>
        </div>

    )
}

export default Logout