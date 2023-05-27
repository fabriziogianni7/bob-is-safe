import { Image, Button } from 'antd'
import React, { useContext } from 'react'
import { Web3Context } from '../../context'
import { AppStatus } from '../constants'
import { Link } from '@material-ui/core'
import { useSafeAppsSDK } from '@safe-global/safe-apps-react-sdk'

const TransactionSuccess = ({ isModuleEnabled }: any) => {
  const { safe } = useSafeAppsSDK()
  const { setStatus } = useContext(Web3Context)

  return <div style={{
    display: 'flex',
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: '15px',
    border: '1px solid rgba(0, 0, 0, 0.06)'
  }}>
        <div style={{ textAlign: 'center', maxWidth: '400px' }}>
          <Image height="80px" src="/bob-meme.png" preview={false} />
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', marginTop: '16px' }}>Transaction confirmed!</h1>
          <div style={{ marginTop: '36px' }}>

            <Button className="gradient-button" style={{
              background: 'linear-gradient(to right, #ffbb33, #f7a10c)',
              color: 'white',
              fontWeight: 'bold',
              border: 'none',
              fontSize: '16px',
              textTransform: 'uppercase',
              borderRadius: '8px',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
              width: '360px',
              height: '48px',
              marginTop: '12px',
              marginBottom: '0px !important'
            }} onClick={() => {
              setStatus(AppStatus.INITIAL)
            }}>
              Make another payment
            </Button>

            {' '}
            <Link href={`https://app.safe.global/transactions/history?safe=gor:${safe.safeAddress}`}
              target="_blank">
              <Button className="back-hover" style={{
                background: 'none',
                color: 'rgba(0, 0, 0, 0.4)',
                fontWeight: 'medium',
                border: 'none',
                fontSize: '16px',
                boxShadow: 'none',
                textTransform: 'uppercase',
                borderRadius: '8px',
                width: '360px',
                height: '48px',
                marginTop: '6px',
                marginBottom: '0px !important'
              }} onClick={() => {
                setStatus(AppStatus.INITIAL)
              }}>
                Check your transactions
              </Button>
            </Link>
          </div>

        </div>
      </div>
}

export default TransactionSuccess
