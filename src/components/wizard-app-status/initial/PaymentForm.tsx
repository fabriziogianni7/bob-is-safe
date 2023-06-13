import React from 'react'
import { Form, Input, Select, Button, Space, Typography } from 'antd'
import { Option } from 'antd/lib/mentions'
import CircleCrop from "../../CircleCrop";

const { Text } = Typography

interface TokenOption {
  icon: string
  symbol: string
}

interface PaymentFormProps {
  form: any
  setZkBobAddress: (value: string) => void
  setTokenIndex: (value: number) => void
  setAmount: (value: string) => void
  submitTx: () => void
  TOKEN_OPTIONS: TokenOption[]
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  form,
  setZkBobAddress,
  setTokenIndex,
  setAmount,
  submitTx,
  TOKEN_OPTIONS
}) => {
  const layout = {
    labelCol: { span: 24 },
    wrapperCol: { span: 24 }
  }

  return (
        <div style={{
          justifyContent: 'center',
          backgroundColor: 'white',
          borderRadius: '15px',
          border: '1px solid rgba(0, 0, 0, 0.06)'
        }}>
            <Form
                {...layout}
                form={form}
                name="control-hooks"
                style={{
                  padding: '32px',
                  borderRadius: '8px',
                  maxWidth: '800px'
                }}
                labelAlign="right"
            >
                <Form.Item name="Amount" style={{ borderRadius: '8px' }} rules={[{ required: true, message: 'Please enter an amount' }]}>
                    <Input pattern="[0-9.]*" onKeyPress={(e) => {
                      const pattern = /[\d.]/
                      const inputChar = String.fromCharCode(e.charCode)
                      if (!pattern.test(inputChar)) {
                        e.preventDefault()
                      }
                    }} onChange={(e) => { setAmount(e.target.value) }} placeholder="0"/>
                </Form.Item>
                <Form.Item name="ZkBobAddress" style={{ borderRadius: '8px' }} rules={[{ required: true }]}>
                    <Input
                        onChange={(e) => { setZkBobAddress(e.target.value) }}
                        placeholder="zkBob receiver address"
                    />
                </Form.Item>
                <Form.Item name="Token" rules={[{ required: true }]} style={{ borderRadius: '8px' }}>
                    <Select
                        placeholder="Select one token"
                        onChange={(tokenIndex: number) => {
                          setTokenIndex(tokenIndex)
                        }}
                        style={{ width: '100%' }}
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
                    <Button
                        className="gradient-button"
                        htmlType="submit"
                        onClick={submitTx}
                        style={{
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
                        }}
                    >
                        Transfer
                    </Button>
            </Form>
        </div>
  )
}
