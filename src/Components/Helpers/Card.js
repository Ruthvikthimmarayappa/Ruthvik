import React from 'react'

function Card(props) {
  return (
    <div className={`flex justify-center items-center rounded-lg shadow-cool ${props.className}`}>
        {props.children}
    </div>
  )
}

export default Card