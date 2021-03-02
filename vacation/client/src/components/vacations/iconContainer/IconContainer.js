import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const IconContainer = (props) => {
    const { toolTip, handleClick, iconArrName, iconClassName } = props

    return (
        <div className="iconContainer">
            <div className="iconTooltip" >{toolTip}</div>
            <button className="btn btn-secondary" onClick={handleClick}>
                <FontAwesomeIcon icon={iconArrName} size="lg" className={iconClassName} />
            </button>
        </div>
    )
}

export default IconContainer