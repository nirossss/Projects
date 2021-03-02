import React, { useState } from 'react';
import { useHistory, Link } from 'react-router-dom';

const Register = (props) => {
    const [form, setForm] = useState({ first_name: '', last_name: '', email: '', password: '' })
    const [verifyPass, setVerifyPass] = useState('')
    const [error, setError] = useState({ isError: false, msg: '' })

    const history = useHistory();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (verifyPass !== form.password) {
            setError({ ...error, isError: true, msg: `Password is not verified correctly` });
            return
        }// Same password for both fields

        const res = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(form)
        });

        const data = await res.json();

        if (data.success) {
            history.push('/login');
        } else {
            setError({ ...error, isError: true, msg: `${data.msg}` });
        }
    }

    return (
        <div className='m-5 d-flex justify-content-center'>
            <div className="card border-primary mb-3">
                <div className="card-header">Register</div>
                <div className="card-body">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="registerFirstName">First name</label>
                            <input
                                id="registerFirstName"
                                className='form-control'
                                type="text"
                                name="first_name"
                                value={form.first_name}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="registerLastName">Last name</label>
                            <input
                                id="registerLastName"
                                className='form-control'
                                type="text"
                                name="last_name"
                                value={form.last_name}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="registerEmail">Email address</label>
                            <input
                                id="registerEmail"
                                className='form-control'
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="registerPassword">Password</label>
                            <input
                                id="registerPassword"
                                className='form-control'
                                type="password"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="vaerifyPassword">Verify password</label>
                            <input
                                id="vaerifyPassword"
                                className='form-control'
                                type="password"
                                value={verifyPass}
                                onChange={(e) => setVerifyPass(e.target.value)}
                            />
                        </div>
                        <input
                            className="btn btn-outline-primary"
                            type="submit"
                            value="Register"
                        />
                    </form>

                    {error.isError && <div className="m-3 alert alert-primary">{error.msg}</div>}
                </div>

                <h2 className="m-5">
                    Already a member? please
                    <Link to="/login"> Login </Link>
                </h2>
            </div>
        </div>
    )
}

export default Register