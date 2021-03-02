import React, { useEffect, useState, useContext } from 'react';
import './Vacation_items.css';
import UserContext from '../contexts/UserContext';
import IconContainer from './iconContainer/IconContainer';
import CardBodyDetails from './cardComponents/CardBodyDetails';

const VacationAdminItem = (props) => {
    const { myIo, vacationData } = props
    const { id, description, destination, image, from_date, to_date, price, followers } = vacationData

    const [realFollowers, setRealFollowers] = useState(followers)

    const { setAdminFormData, setIsPopupOpen, setItemOriginalTextFields } = useContext(UserContext)

    useEffect(() => {
        myIo.current.on('push_follow', (data) => {
            if (data.vacationId === id) {
                setRealFollowers(data.followers);
            }
        }); // Admin see REAL TIME followers change
    }, [realFollowers, id, myIo]);

    const handleEdit = () => {
        setItemOriginalTextFields({
            description: description,
            destination: destination,
            from_date: new Date(from_date).toISOString().substring(0, 10),
            to_date: new Date(to_date).toISOString().substring(0, 10),
            price: price
        })
        setAdminFormData({
            vacationId: id,
            description: description,
            destination: destination,
            image: image,
            from_date: new Date(from_date).toISOString().substring(0, 10),
            to_date: new Date(to_date).toISOString().substring(0, 10),
            price: price,
            followers: realFollowers,
            isImage: true,
            isNew: false
        })
        setIsPopupOpen(true)
    } // Sets the edited vacation fields, so i can see them in the Form popup

    const handleDelete = async () => {
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
            myIo.current.emit('delete_vacation', { vacationId: id })
        }
    } // Delete vacation after image seccesful remuval from uploads

    return (
        <div className="col-4">
            <div className="card mb-3">
                <h3 className="card-header">{destination}</h3>
                <div className="card-body">
                    <div className="d-flex justify-content-around m-2">
                        <IconContainer
                            toolTip="Edit"
                            handleClick={handleEdit}
                            iconArrName={["fas", "pencil-alt"]}
                            iconClassName=""
                        />
                        <IconContainer
                            toolTip="Delete"
                            handleClick={handleDelete}
                            iconArrName={["fas", "trash-alt"]}
                            iconClassName=""
                        />
                    </div>
                    <h6 className="card-subtitle text-muted mt-4 text-center">
                        {`
                            ${new Date(from_date).toString().substring(0, 15)} - 
                            ${new Date(to_date).toString().substring(0, 15)}
                        `}
                    </h6>
                </div>
                <CardBodyDetails
                    image={image}
                    description={description}
                    price={price}
                    realFollowers={realFollowers}
                />
            </div>
        </div>
    )
}

export default VacationAdminItem