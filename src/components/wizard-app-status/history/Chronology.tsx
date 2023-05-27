import { Alert, Button, Card, Spin } from 'antd'
import React, { useContext } from 'react'
import { Web3Context } from '../../../context'
import { AppStatus } from '../../constants'
import TransactionHistory from './TransactionHistory'

const Chronology: React.FC = () => {
  const { setStatus } = useContext(Web3Context)

  return <div>
    <Button style={{
      background: 'transparent',
      color: '#7D5FFF',
      border: '1px solid #7D5FFF',
      borderRadius: '20px',
      height: '30px',
      width: '100px'
    }} onClick={() => { setStatus(AppStatus.INITIAL) }} size={'small'}>Back</Button>
    <br />
    <br />
    <TransactionHistory />
  </div>
}

export default Chronology
