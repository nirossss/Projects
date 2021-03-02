import React, { useEffect, useState, useContext, useRef } from 'react';
import SocketIo from 'socket.io-client';
import UserContext from '../contexts/UserContext';
import Logout from '../logout/Logout';
import VacationItem from './Vacation_item';
import VacationAdminItem from './Vacation_admin_item';
import AdminPopup from './admin/Admin_popup';
import AdminChart from './admin/Admin_chart';

const Vacations = (props) => {
    const [vacations, setVacations] = useState([])
    const [userData, setUserData] = useState({})
    const [onFollow, setOnFollow] = useState([])
    const [dataRecived, setDataRecived] = useState(false)
    const [isChartOpen, setIsChartOpen] = useState(false)
    const myIo = useRef();

    const { isPopupOpen, setIsPopupOpen } = useContext(UserContext);

    const { id: userId, first_name, last_name } = userData

    useEffect(() => {
        myIo.current = SocketIo();

        return () => {
            myIo.current.disconnect();
        }
    }, []);

    useEffect(() => {
        myIo.current.on('get_vacations', (data) => {
            setVacations(data.vacations);
            setUserData(data.userData) // Only admin gets userData.admin key and value. (set in server)
            setOnFollow(data.onFollow)
            if (data.userData.id) {
                setDataRecived(true)
            } // Await userData set, To make sure user properties will apear in page 
        }); // Only users with cookey can see vacations (socket.io session verify)
        myIo.current.on('push_new_vacation', (data) => {
            setVacations([...vacations, data])
        }) // Rerender vacaions with the new vacation. Real time
        myIo.current.on('push_update_vacation', (data) => {
            const onUpdateVacations = [...vacations]

            vacations.forEach((item, index) => { //Change the old vacation obj to the updated vacation obj
                if (item.id === data.id) {
                    onUpdateVacations.splice(index, 1, { ...data })
                }
            })

            setVacations(onUpdateVacations)
        })
        myIo.current.on('push_delete_vacation', (data) => {
            const onDeleteVacations = [...vacations]

            vacations.forEach((item, index) => { //Change the old vacation obj to the updated vacation obj
                if (item.id === data.vacationId) {
                    onDeleteVacations.splice(index, 1)
                }
            })

            setVacations(onDeleteVacations)
        })
    }, [vacations, userData, onFollow]);

    const renderFollowVacations = () => {
        return vacations.map((item) => {
            for (let i = 0; i < onFollow.length; i++) {
                if (item.id === onFollow[i].vacation_id) {
                    return (
                        <VacationItem
                            key={item.id}
                            userData={{ ...userData }}
                            myIo={myIo}
                            isFollowProp={true}
                            vacationData={{ ...item }}
                        />)
                }
            }
            return false
        })
    }

    const renderVacations = () => {
        const unFollowVacation = [...vacations]

        // Only admin with a cookies set can see admin vacation view and use server admin functions
        if (userId === 4 && userData.admin) {
            return vacations.map(item => <VacationAdminItem
                key={item.id}
                myIo={myIo}
                vacationData={{ ...item }}
            />)
        }

        for (let i = 0; i < vacations.length; i++) {
            for (let k = 0; k < onFollow.length; k++) {
                if (vacations[i].id === onFollow[k].vacation_id) {
                    unFollowVacation.splice(i, 1, {})// Change the obj removed with an empty obj to keep the same index keys in array
                }
            }// Remove followed vacations from unFollowVacation array
        }// Render unfollow vacaions only.
        return unFollowVacation.map(item => {
            if (item.id) {
                return (
                    <VacationItem
                        key={item.id}
                        userData={{ ...userData }}
                        myIo={myIo}
                        isFollowProp={false}
                        vacationData={{ ...item }}
                    />)
            } else return false
        })
    }

    const openPopup = (e) => {
        setIsPopupOpen(true)
    }

    return (
        <div>
            <header className="d-flex flex-row-reverse">
                <div className="p-2">
                    <Logout />
                </div>
                <div className="p-2">
                    <strong>Hello {first_name} {last_name}</strong>
                </div>
            </header>
            <hr />
            {userId === 4 && userData.admin &&
                <div >
                    <div className="d-flex justify-content-around m-5">
                        <button className="btn btn-outline-info" onClick={openPopup}>add new vacation</button>
                        <button className="btn btn-outline-info" onClick={() => setIsChartOpen(true)}>Live followers report</button>
                    </div>
                    <hr />
                    {isPopupOpen && <AdminPopup myIo={myIo} />}
                    {isChartOpen &&
                        <AdminChart
                            vacations={vacations}
                            myIo={myIo}
                            closeChart={() => setIsChartOpen(false)}
                        />}
                </div>
            }
            {dataRecived && <div>
                <div className="row">{renderFollowVacations()}</div>
                <div className="row">{renderVacations()}</div>
            </div>}
        </div>

    )
}

export default Vacations