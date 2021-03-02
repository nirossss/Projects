import React from 'react';
import './Admin_popup.css';
import AdminForm from './Admin_form';

const AdminPopup = (props) => {
    const { myIo } = props

    return (
        <div className="popupWrapper" >
            <div className="popup" >
                <div className='container'>
                    <AdminForm myIo={myIo} />
                </div>
            </div>
        </div>
    )
}

export default AdminPopup