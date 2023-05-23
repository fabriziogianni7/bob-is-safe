import React from 'react'

const CircleCrop = ({ imageUrl, altText, size }: any) => {

  const circleStyle = {
    width: size,
    height: size,
    borderRadius: '50%',
    overflow: 'hidden',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  }

  return (
        <div className="circle" style={circleStyle}>
            <img src={imageUrl} alt={altText} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
  )
}

export default CircleCrop
