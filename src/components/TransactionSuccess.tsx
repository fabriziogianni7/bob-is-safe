import {CheckCircleTwoTone} from "@ant-design/icons";
import {Button, Image} from "antd";
import React from "react";
import {Link} from "@material-ui/core";

const TransactionSuccess = ({
                                safeAddress,
                                setStatus
                            }: any) => {
    return <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh'}}>
        <div style={{textAlign: 'center', maxWidth: '400px'}}>
            <CheckCircleTwoTone twoToneColor="#52c41a" style={{fontSize: '72px', marginBottom: '24px'}}/>
            <h1 style={{fontSize: '24px', fontWeight: 'bold', marginBottom: '16px'}}>Congrats, Bob is Safe!</h1>
            <div style={{marginBottom: '40px'}}>
                <Link href={`https://app.safe.global/transactions/history?safe=gor:${safeAddress}`} target="_blank">
                    <Button type="primary" style={{width: '100%', borderRadius: '20px', marginBottom: '16px'}}>
                        Check your Safe transactions
                    </Button>
                </Link>
                <Button style={{width: '100%', borderRadius: '20px'}} onClick={() => {
                    setStatus('initial')
                }}>
                    Go back to Home
                </Button>
            </div>
            <Image width={300} height={249} src="/bob-meme.png" preview={false}/>
        </div>
    </div>
}

export default TransactionSuccess;