import React, { useEffect, useState } from 'react';
import './Vacation_items.css';
import IconContainer from './iconContainer/IconContainer';
import CardBodyDetails from './cardComponents/CardBodyDetails';

const VacationItem = (props) => {
    const { myIo, isFollowProp, userData, vacationData } = props
    const { id: userId } = userData
    const { id, description, destination, image, from_date, to_date, price, followers } = vacationData

    const [realFollowers, setRealFollowers] = useState(followers)
    const [isFollow, setIsFollow] = useState(isFollowProp)

    useEffect(() => {
        myIo.current.on('push_follow', (data) => {
            if (data.vacationId === id) {
                setRealFollowers(data.followers);
            }
        });// All connected users can see REAL TIME followers change
    }, [realFollowers, id, myIo]);

    const handleFollow = (f) => {
        let newFollowers = realFollowers

        if (f) {
            newFollowers++
            setIsFollow(true)
            myIo.current.emit('toggle_follow', { userId: userId, vacationId: id, followers: newFollowers, followRequest: f })
            return
        } else if (!f) {
            newFollowers--
            setIsFollow(false)
            myIo.current.emit('toggle_follow', { userId: userId, vacationId: id, followers: newFollowers, followRequest: f })
            return
        }
    }

    return (
        <div className="col-4">
            <div className="card mb-3">
                <div className="card-header">
                    <div className="row">
                        <div className="col-10"><h3 >{destination}</h3></div>
                        <div className="col-2">
                            {isFollow || <IconContainer
                                toolTip="follow"
                                handleClick={() => handleFollow(true)}
                                iconArrName={["far", "star"]}
                                iconClassName="starIcon"
                            />}
                            {isFollow && <IconContainer
                                toolTip="unfollow"
                                handleClick={() => handleFollow(false)}
                                iconArrName={["fas", "star"]}
                                iconClassName="starIcon"
                            />}
                        </div>
                    </div>
                </div>
                <div className="card-body">
                    <h6 className="card-subtitle text-muted  text-center">
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

export default VacationItem