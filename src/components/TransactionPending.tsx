import {Alert, Card, Spin} from "antd";
import React from "react";

const TransactionPending = ({isModuleEnabled}: any) => {
    return <Alert
        message={
            <div>
                <Spin size="small" style={{ marginRight: '8px' }} />
                {isModuleEnabled ? "Transaction is pending" : "Module is being deployed and enabled"}
            </div>
        }
        description="Please wait until the transaction is confirmed."
        type="info"
        style={{
            background: 'rgba(0, 0, 0, 0.05)',
            border: '1px solid rgba(0, 0, 0, 0.1)',
            borderRadius: '4px',
        }}
    />
}

export default TransactionPending;