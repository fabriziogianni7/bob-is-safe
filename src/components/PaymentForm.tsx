import React from 'react';
import {Card, Form, Input, Select, Button} from 'antd';
import {Option} from 'antd/lib/mentions';
import {Space, Typography} from 'antd';
import CircleCrop from "./CircleCrop";

const {Text} = Typography;

interface TokenOption {
    icon: string;
    symbol: string;
}

interface PaymentFormProps {
    form: any;
    setZkBobAddress: (value: string) => void;
    setTokenIndex: (value: number) => void;
    setAmount: (value: string) => void;
    submitTx: () => void;
    TOKEN_OPTIONS: TokenOption[];
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
                                                            form,
                                                            setZkBobAddress,
                                                            setTokenIndex,
                                                            setAmount,
                                                            submitTx,
                                                            TOKEN_OPTIONS,
                                                        }) => {
    const layout = {
        labelCol: {span: 24},
        wrapperCol: {span: 24},
    };

    const tailLayout = {
        wrapperCol: {span: 24},
    };

    return (
        <div style={{
            justifyContent: 'center'}}>
            <Form
                {...layout}
                form={form}
                name="control-hooks"
                style={{
                    padding: '32px',
                    borderRadius: '8px',
                    marginTop: '32px',
                    maxWidth: '600px',
                }}
                labelAlign="right"
            >
                <Form.Item name="ZkBobAddress" label="zKBob Address" rules={[{required: true}]} >
                    <Input
                        onChange={(e) => setZkBobAddress(e.target.value)}
                        placeholder="zkbob_goerli:randomString"
                    />
                </Form.Item>
                <Form.Item name="Token" label="Token" rules={[{required: true}]}>
                    <Select
                        placeholder="Select one token"
                        onChange={(tokenIndex: number) => {
                            setTokenIndex(tokenIndex);
                        }}
                        style={{width: '100%'}}
                        allowClear
                    >
                        {TOKEN_OPTIONS.map((token, index) => (
                            <Option value={index.toString()} key={index.toString()}>
                                <Space direction="horizontal">
                                    <CircleCrop imageUrl={token.icon} altText={token.symbol} size={20}/>
                                    <Text>{token.symbol}</Text>
                                </Space>
                            </Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item name="Amount" label="Amount" rules={[{required: true, message: 'Please enter an amount'}]}>
                    <Input type="number" onChange={(e) => setAmount(e.target.value)} placeholder="0.7"/>
                </Form.Item>
                <Form.Item wrapperCol={{...tailLayout.wrapperCol}}>
                    <Button
                        className="gradient-button"
                        htmlType="submit"
                        onClick={submitTx}
                        style={{
                            background: 'linear-gradient(to right, #7D5FFF, #A489FF)',
                            color: 'white',
                            fontWeight: 'bold',
                            border: 'none',
                            borderRadius: '20px',
                            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
                            width: '100%',
                        }}
                    >
                        Send money to your anon fren 👷
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};
