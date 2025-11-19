import React from "react"
import axios from "axios"

import "./cards.css"


export default function Cards() {
    async function getCardInfo() {
        const response = await axios.get("http://localhost:3000/api/cards")
        return response.data
    }

    const response = getCardInfo()

    const cardTitle = response.data.title
    const cardContent = response.data.content
    const limitDate = response.data.limitDate

    return (
        <div className="Card">
            <h2 className="cardTitle">{cardTitle}</h2>

            <p className="cardContent">{cardContent}</p>

            <p className="limitDate">{limitDate}</p>
        </div>
    )
}