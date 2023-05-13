import Safe, { EthersAdapter } from '@safe-global/protocol-kit'
import { useSafeAppsSDK } from '@safe-global/safe-apps-react-sdk'
import { Button, Form, Input, Select } from 'antd'
import { ethers } from 'ethers'
import React, { useCallback, useEffect, useState } from 'react'
import safeAbi from '../contracts-abi/safe-abi.json'
import { moduleAbi } from '../module-abi'

const { Option } = Select

const layout = {
  labelCol: {
    span: 0,
    color: 'red',
  },
  wrapperCol: { span: 14 },
}

const tailLayout = {
  wrapperCol: { offset: 8, span: 16 },
}

const bobIsSafeModuleAddress = '0xa384c43054603c49D1Fa306AC47e3747C49AB93c'
// const BOB_CONTRACT_ADDRESS = '0x97a4ab97028466FE67F18A6cd67559BAABE391b8'
const receiverZkBobAddress = '38aywFhcqbZmncHA8WM1UwKPgrVnqwsViwRWxbjNGBKtQxwb5YoQtFWUkP1UMgU'
// const bobIsSafeFactoryAddress = "0xb137cf186e6c32b97e20f5abd294e47ee95e8ac1";

const TransactionForm: React.FC = () => {
  const [form] = Form.useForm()
  const { sdk, safe } = useSafeAppsSDK()
  const [isModuleLoading, setIsModuleLoading] = useState(false)
  const [isModuleEnabled, setIsModuleEnabled] = useState(false)
  const bobIsSafeModuleAddress = '0xa384c43054603c49D1Fa306AC47e3747C49AB93c'

  const onFinish = (values: any) => {
    console.log(values)
  }

  useEffect(() => {
    setIsModuleLoading(true)
    _isModuleEnabled()
    setIsModuleLoading(false)
  }, [])

  const enableZKModuleTx = useCallback(async () => {
    try {
      const { safeTxHash } = await sdk.txs.send({
        txs: [
          // TODO: call the factory to deploy the module and then enable the module by passing a predicted address
          /*{
            to: bobIsSafeFactoryAddress,
            value: '0',
            data: new ethers.utils.Interface(factoryAbi).encodeFunctionData("deployModule", [bobIsSafeModuleAddress]),
          },*/
          {
            to: safe.safeAddress,
            value: '0',
            data: new ethers.utils.Interface(safeAbi).encodeFunctionData('enableModule', [bobIsSafeModuleAddress]),
          },
        ],
      })
      console.log({ safeTxHash })
      const safeTx = await sdk.txs.getBySafeTxHash(safeTxHash)
      console.log({ safeTx })
    } catch (e) {
      console.error(e)
    }
  }, [safe, sdk])

  const submitTx = useCallback(async () => {
    try {
      const { safeTxHash } = await sdk.txs.send({
        txs: [
          {
            to: bobIsSafeModuleAddress,
            value: '0',
            data: new ethers.utils.Interface(moduleAbi).encodeFunctionData('paymentInPrivateMode', [
              safe.safeAddress,
              ethers.utils.parseUnits('1', 18),
              receiverZkBobAddress,
              [],
              0,
              0,
            ]),
          },
        ],
      })
      console.log({ safeTxHash })
      const safeTx = await sdk.txs.getBySafeTxHash(safeTxHash)
      console.log({ safeTx })
    } catch (e) {
      console.error(e)
    }
  }, [safe, sdk])

  const _isModuleEnabled = useCallback(async () => {
    try {
      const ethAdapter = new EthersAdapter({
        ethers,
        signerOrProvider: new ethers.providers.Web3Provider(window.ethereum),
      })
      const safeSDK = await Safe.create({
        ethAdapter,
        safeAddress: safe.safeAddress,
      })

      const isEnabled = await safeSDK.isModuleEnabled(bobIsSafeModuleAddress)
      setIsModuleEnabled(isEnabled)
    } catch (e) {
      console.error(e)
    }
  }, [safe, sdk])

  return (
    <div>
      {isModuleEnabled && !isModuleLoading ? (
        <Form {...layout} form={form} name="control-hooks" onFinish={onFinish} style={{ maxWidth: 600 }}>
          <Form.Item name="ZkBob" label="zKBob Address" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="amount" label="Amount" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="token" label="Token Address" rules={[{ required: true }]}>
            <Select
              placeholder="Select a option and change input text above"
              onChange={() => {
                alert('ok')
              }}
              allowClear
            >
              <Option value="0x..">USDC</Option>
              <Option value="0x..">GHO</Option>
              <Option value="0x..">OTHER</Option>
            </Select>
          </Form.Item>
          <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.gender !== currentValues.gender}>
            {({ getFieldValue }) =>
              getFieldValue('gender') === 'other' ? (
                <Form.Item name="customizeGender" label="Customize Gender" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
              ) : null
            }
          </Form.Item>
          <Form.Item {...tailLayout}>
            <Button type="primary" htmlType="submit">
              Send Direct Deposit
            </Button>
          </Form.Item>
        </Form>
      ) : (
        <Button color="primary" onClick={enableZKModuleTx}>
          Click to enable ZK module
        </Button>
      )}
    </div>
  )
}

export default TransactionForm
