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
                        height: "48px",
                        marginTop: '12px',
                        marginBottom: "0px !important",
                    }}>
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