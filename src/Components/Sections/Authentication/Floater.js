import React from 'react'
import Container from '../../Helpers/Container'
import Button from '../../Helpers/Button'


function Floater(props) {
  return (
    <Container className="py-10 px-20 h-full max-w-[40%] text-center rounded-lg shadow-cool">
        <span className='flex flex-col items-center justify-between h-full'>
            <h1 className='text-4xl font-extrabold'>{props.heading}</h1>
            <p className='text-md font-light text-gray-400'>{props.subheading}</p>
            <Button onClick={props.buttonClick} className="shadow-cool">
                {props.buttonText}
            </Button>
        </span>
    </Container>
  )
}

export default Floater