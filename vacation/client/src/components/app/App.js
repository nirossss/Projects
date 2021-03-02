import React, { useEffect, useState } from 'react';
import {
    HashRouter as Router,
    Switch,
    Route,
    Redirect,
} from 'react-router-dom';
import './App.css';
import './lumenbootstrap.min.css';
import UserContext from '../contexts/UserContext';
import Register from '../register/Register';
import Login from '../login/login';
import Vacations from '../vacations/Vacations';
import { library } from '@fortawesome/fontawesome-svg-core'
import { faStar, faPencilAlt, faTrashAlt } from '@fortawesome/free-solid-svg-icons'
import { faStar as faRegStar } from '@fortawesome/free-regular-svg-icons'

library.add(faStar, faRegStar, faPencilAlt, faTrashAlt) // No need to import the icon for each component use

function App() {
    const [login, setLogin] = useState(false)
    const [authorized, setAuthorized] = useState(false)
    const [isPopupOpen, setIsPopupOpen] = useState(false)
    const [adminFormData, setAdminFormData] = useState({
        vacationId: 0,
        description: '',
        destination: '',
        image: '',
        from_date: '',
        to_date: '',
        price: 0,
        followers: 0,
        isImage: false,
        isNew: true
    })
    const [itemOriginalTextFields, setItemOriginalTextFields] = useState({
        description: '',
        destination: '',
        from_date: '',
        to_date: '',
        price: 0
    })

    useEffect(() => {
        (async () => {
            const res = await fetch('/api/auth/verify')

            if (res.status === 200) {
                setAuthorized(true)
                return
            }

            setLogin(true);
        })();
    }, []);

    return (
        <UserContext.Provider value={{ setAuthorized, adminFormData, setAdminFormData, isPopupOpen, setIsPopupOpen, itemOriginalTextFields, setItemOriginalTextFields }}>
            <Router>
                <header className='App-header'>
                    <h1>ObserVacation</h1>
                </header>
                <div>
                    {login && <Redirect to="/login" />}
                    {authorized && <Redirect to="/vacations" />}
                    <Switch>
                        <Route path="/register">
                            <Register />
                        </Route>
                        <Route path="/login">
                            <Login />
                        </Route>
                        <Route path="/vacations">
                            {authorized ? <Vacations /> : <div>forbidden</div>}
                        </Route>
                    </Switch>
                </div>
            </Router>
        </UserContext.Provider>
    );
}

export default App;
