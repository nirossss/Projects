import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import UserContext from '../contexts/UserContext';

const Login = (props) => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState({ isError: false, msg: '' })

    const { setAuthorized } = useContext(UserContext);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const res = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        const data = await res.json();

        if (data.success) {
            setAuthorized(true)
        } else {
            setError({ ...error, isError: true, msg: `${data.msg}` });
        }
    }

    return (
        <div className='m-5 d-flex justify-content-center'>
            <div className="card border-primary mb-3">
                <div className="card-header">Login</div>
                <div className="card-body">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="loginEmail">Email address</label>
                            <input
                                id="loginEmail"
                                className='form-control'
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="loginPassword">Password</label>
                            <input
                                id="loginPassword"
                                className='form-control'
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <input
                            className="btn btn-outline-primary"
                            type="submit"
                            value="Login"
                        />
                    </form>

                    {error.isError && <div className="m-3 alert alert-primary">{error.msg}</div>}
                </div>

                <h2 className="m-5">
                    Not a member? please
                    <Link to="/register"> Register </Link>
                    now
                </h2>
            </div>
        </div>
    )
}

export default Login