import React, { useState, useContext, useRef } from 'react';
import './Admin_form.css';
import UserContext from '../../contexts/UserContext';

const AdminForm = (props) => {
    const [error, setError] = useState({ isError: false, msg: '' })
    const [dateError, setDateError] = useState({ isError: false, msg: '' })
    const [imageError, setImageError] = useState({ isError: false, msg: '' })

    const { adminFormData, setAdminFormData, setIsPopupOpen, itemOriginalTextFields } = useContext(UserContext);
    const imageRef = useRef();

    const { myIo } = props
    const { description, destination, image, from_date, to_date, price, isImage, isNew } = adminFormData

    const handleInput = (e) => {
        setAdminFormData({ ...adminFormData, [e.target.name]: e.target.value })
        if (error.isError || dateError.isError) {
            setError({ isError: false, msg: '' })
            setDateError({ isError: false, msg: '' })
        } // Remove error div after change
    }

    const handleImageSubmit = async (e) => {
        e.preventDefault();

        if (isImage) {
            await deleteImage()
        }// If admin change the image, When other image were set, the changed image gets deleted

        const files = imageRef.current.files;

        if (files.length === 0) {
            setImageError({ isError: true, msg: 'Please upload image, Then click on "ADD IMAGE" button below' })
            return false
        } // If no image picked sets error div

        if (files.length) {
            setImageError({ isError: false, msg: '' })

            const fd = new FormData();
            fd.append('image', files[0]);

            const res = await fetch('/api/images', {
                method: 'POST',
                credentials: 'include',
                body: fd
            });

            const { success, fileName } = await res.json()

            if (success) {
                setAdminFormData({ ...adminFormData, image: fileName, isImage: true });
            }
        }
    }

    const deleteImage = async () => {
        const res = await fetch('/api/images', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                file: image,
            })
        });

        const { success } = await res.json()

        if (success) {
            setAdminFormData({ ...adminFormData, image: '', isImage: false });
        }
    }

    const handleEditedVacation = (e) => {
        e.preventDefault();

        // FORM CHECK
        let adminFormDataArr = [description, destination, from_date, to_date, price]
        let formCheckArr = []

        adminFormDataArr.forEach(item => {
            if (item === "" || item === null || item === 0) {
                formCheckArr.push(item)
            }
        })

        if (image === "") {
            setImageError({ isError: true, msg: 'Please upload image, Then click on "ADD IMAGE" button below' })
            return false
        }

        if (new Date(from_date) > new Date(to_date)) {
            setDateError({ isError: true, msg: 'Invalid dates: From-date chosen is after To-date choise' })
            return false
        }

        if (formCheckArr.length) {
            setError({ isError: true, msg: 'missing fields' })
            return false
        }
        // END of FORM CHECK

        if (isNew) {
            myIo.current.emit('new_vacation', { ...adminFormData })
            clearFields()
            setIsPopupOpen(false)
        } else if (!isNew) {
            myIo.current.emit('update_vacation', { ...adminFormData })
            clearFields()
            setIsPopupOpen(false)
        }
    }

    const exitPopup = () => {
        clearForm()
        setIsPopupOpen(false)
    } // If cancel new vacation, clearFields and close popup

    const clearForm = async () => {
        if (isNew && isImage) {
            await deleteImage()
        }
        clearFields()
    } // Clear setAdminFormData fields and delete the image if exists

    const clearFields = () => {
        setAdminFormData({
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
    }

    const restoreFields = () => {
        setAdminFormData({ ...adminFormData, ...itemOriginalTextFields })
    }// Updated vacations canot be canceled. So if want to retrive information and exit, need to restoreFields and save

    return (
        <div>
            <h1>Vacation setup</h1>
            <div className="form-group">
                <div>
                    image:
                    <img
                        className="img-fluid imageContent ml-3"
                        src={`/api/images/${image}`}
                        alt='undefined-file'
                    />
                    {imageError.isError && <div className="alert alert-danger">{imageError.msg}</div>}
                </div>
                <form onSubmit={handleImageSubmit}>
                    <input
                        type="file"
                        ref={imageRef}
                        name="image"
                        className='form-control-file'
                    />
                    <input
                        className="btn btn-success mt-1"
                        type="submit"
                        value="Add image"
                    />
                </form>
            </div>
            <form onSubmit={handleEditedVacation}>
                <div className="form-group">
                    description: <textarea
                        className='form-control'
                        name='description'
                        type='textarea'
                        rows='4' cols='50'
                        onChange={handleInput}
                        value={description}
                    ></textarea>
                </div>
                <div className="form-group">
                    destination: <input
                        className='form-control'
                        name='destination'
                        type='text'
                        onChange={handleInput}
                        value={destination}
                    />
                </div>
                <div className="form-group">
                    From date: <input
                        className='form-control'
                        name='from_date'
                        type='date'
                        onChange={handleInput}
                        value={from_date}
                    />
                </div>
                <div className="form-group">
                    To date: <input
                        className='form-control'
                        name='to_date'
                        type='date'
                        onChange={handleInput}
                        value={to_date}
                    />
                </div>
                {dateError.isError && <div className="alert alert-danger">{dateError.msg}</div>}
                <div className="form-group">
                    price: <input
                        className='form-control'
                        name='price'
                        type='number'
                        onChange={handleInput}
                        value={price}
                    />
                </div>
                <div className="form-group">
                    {error.isError && <div className="alert alert-danger">{error.msg}</div>}
                    <div className="d-flex justify-content-around m-2">
                        <input
                            className="btn btn-success"
                            type="submit"
                            value="Save"
                        />
                        {isNew &&
                            <>
                                <button
                                    className="btn btn-info"
                                    type="button"
                                    onClick={clearForm}
                                >Clear Form</button>
                                <button
                                    className="btn btn-danger"
                                    type="button"
                                    onClick={exitPopup}
                                >Cancel</button>
                            </>
                        }
                        {isNew ||
                            <button
                                className="btn btn-info"
                                type="button"
                                onClick={restoreFields}
                            >Restore Original Fields</button>
                        }
                    </div>
                </div>
            </form>
        </div>
    )
}

export default AdminForm