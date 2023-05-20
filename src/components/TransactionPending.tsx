import {Alert, Card, Spin} from "antd";
import React from "react";

const TransactionPending = () => {
    return <Card
        title="Wait for the tx to be confirmed"
        style={{
            width: 700,
            borderRadius: '8px',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
        }}
        extra={
            <a target="_blank" href="https://media.giphy.com/media/tpdG5dt17HaO4/giphy-downsized-large.gif">
                ⁉️
            </a>
        }
    >
        <Alert
            message={
                <div>
                    <Spin size="small" style={{ marginRight: '8px' }} />
                    Transaction is pending
                </div>
            }
            description="Please wait until the transaction is confirmed."
            type="info"
        />
    </Card>
}

export default TransactionPending;