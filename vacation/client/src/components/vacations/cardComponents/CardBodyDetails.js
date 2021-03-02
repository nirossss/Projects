import React from 'react';

const CardBodyDetails = (props) => {
    const { image, description, price, realFollowers } = props

    return (
        <>
            <img
                className="align-self-center itemImage"
                style={{ height: "200px", width: "95%", display: "block" }}
                src={`/api/images/${image}`}
                alt=""
            />
            <div className="card-body">
                <label htmlFor="cardDecription"><strong>Description:</strong></label>
                <p className="card-text cardDecription ml-2" id="cardDecription" >{description}</p>
                <p className="card-text" id="cardPrice" ><strong>Price: </strong>{price} $</p>
            </div>
            <div className="card-footer text-muted">
                Followers: {realFollowers}
            </div>
        </>
    )
}

export default CardBodyDetails