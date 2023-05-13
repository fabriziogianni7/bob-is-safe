import Safe, { EthersAdapter } from '@safe-global/protocol-kit'
import { useSafeAppsSDK } from '@safe-global/safe-apps-react-sdk'
import { Button, Form, Input, Select, Card, Alert, Space, Spin, Result } from 'antd'
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

const bobIsSafeModuleAddress = '0x8b443dca1908d3b1f4c191073e1732e1784e64ca'
const BOB_TOKEN_CONTRACT_ADDRESS = '0x97a4ab97028466FE67F18A6cd67559BAABE391b8'
const receiverZkBobAddress = '38aywFhcqbZmncHA8WM1UwKPgrVnqwsViwRWxbjNGBKtQxwb5YoQtFWUkP1UMgU'
// const bobIsSafeFactoryAddress = "0xb137cf186e6c32b97e20f5abd294e47ee95e8ac1";

export interface Token {
  address: string
  decimals: number
  symbol: string
  icon: string
  poolPercentage?: number
}

const tokenOptions: { address: string; decimals: number; symbol: string; icon: string; poolPercentage?: number }[] = [
  {
    // BOB
    address: '0x97a4ab97028466FE67F18A6cd67559BAABE391b8',
    decimals: 18,
    symbol: 'BOB',
    icon: 'icon.png',
  },
  {
    // USDC
    address: '0x07865c6e87b9f70255377e024ace6630c1eaa37f',
    decimals: 6,
    symbol: 'USDC',
    icon: 'icon.png',
    poolPercentage: 3000,
  },
  {
    address: '0xA',
    decimals: 18,
    symbol: 'GHO',
    icon: 'icon.png',
  },
  {
    address: '0xB',
    decimals: 18,
    symbol: 'APE',
    icon: 'icon.png',
  },
]

const TransactionForm: React.FC = () => {
  const [form] = Form.useForm()
  const { sdk, safe } = useSafeAppsSDK()

  const [status, setStatus] = useState<'initial' | 'txPending' | 'txSuccess'>('initial')
  const [zkBobAddress, setZkBobAddress] = useState<string>('')
  const [token, setToken] = useState<Token>({
    address: '0x97a4ab97028466FE67F18A6cd67559BAABE391b8',
    decimals: 18,
    symbol: 'BOB',
    icon: 'icon.png',
  })
  const [amount, setAmount] = useState<string>('')
  const [isModuleEnabled, setIsModuleEnabled] = useState(false)
  const [moduleContract, setModuleContract] = useState<any>()

  useEffect(() => {
    if (!isModuleEnabled) {
      _setIsModuleEnabled()
    }
    const provider = new ethers.providers.JsonRpcProvider('https://goerli.infura.io/v3/')
    const moduleContract = new ethers.Contract(bobIsSafeModuleAddress, safeAbi, provider)
    setModuleContract(moduleContract)
  }, [isModuleEnabled])

  useEffect(() => {
    // const filters = contract.filters.LedgerCreated(account)
    // contract.on(filters, () => {
    //   alert(`xxx`)
    // })

    // emit BobModuleSetup();
    if (moduleContract) {
      // const filters = moduleContract.filters.BobModuleSetup()
      // moduleContract.on(filters, () => {
      //   alert(`Module is enabled`)
      // })
    }
  }, [moduleContract])

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
      // sdk.eth.
      if (safeTx) {
        setIsModuleEnabled(true)
      }
      console.log({ safeTx })
    } catch (e) {
      console.error(e)
    }
  }, [safe, sdk])

  const submitTx = async () => {
    try {
      console.log('zkBobAddress,', zkBobAddress)
      console.log('amount,', amount)
      console.log('safe.safeAddress', safe.safeAddress)
      console.log([
        safe.safeAddress,
        ethers.utils.parseUnits(amount, token.decimals),
        zkBobAddress,
        token.address === BOB_TOKEN_CONTRACT_ADDRESS ? [] : [token.address, BOB_TOKEN_CONTRACT_ADDRESS],
        token.address === BOB_TOKEN_CONTRACT_ADDRESS ? 0 : token.poolPercentage,
        0,
      ])
      const { safeTxHash } = await sdk.txs.send({
        txs: [
          /*{
            to: BOB_CONTRACT_ADDRESS,
            value: '0',
            data: new ethers.utils.Interface(bobTokenAbi).encodeFunctionData('approve', [
              '0xE4C77B7787cC116A5E1549c5BB36DE07732100Bb',
              ethers.utils.parseUnits('100', 18),
            ]),
          },*/
          {
            to: bobIsSafeModuleAddress,
            value: '0',
            data: new ethers.utils.Interface(moduleAbi).encodeFunctionData('paymentInPrivateMode', [
              safe.safeAddress,
              ethers.utils.parseUnits(amount, token.decimals),
              zkBobAddress,
              token.address === BOB_TOKEN_CONTRACT_ADDRESS ? [] : [token.address, BOB_TOKEN_CONTRACT_ADDRESS],
              token.address === BOB_TOKEN_CONTRACT_ADDRESS ? 0 : token.poolPercentage,
              0,
            ]),
          },
        ],
        /*params: {
          safeTxGas: 1000000,
        },*/
      })
      console.log({ safeTxHash })
      const safeTx = await sdk.txs.getBySafeTxHash(safeTxHash)
      console.log({ safeTx })
      setStatus('txPending')
    } catch (e) {
      console.error(e)
    }
  }

  const _setIsModuleEnabled = useCallback(async () => {
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

  return status === 'txPending' ? (
    <Card title="Wait for the tx to be confirmed" style={{ width: 700 }} extra={<a href="https://google.com">More</a>}>
      <Spin size="default">
        <Alert
          message="Transaction is pending"
          description="Please wait until the transaction is confirmed."
          type="info"
        />
      </Spin>
    </Card>
  ) : status === 'initial' ? (
    <Card
      title="Send a Direct Deposit using Safe and ZkBob"
      extra={<a href="https://google.com">More</a>}
      style={{ width: 700 }}
    >
      {isModuleEnabled && status === 'initial' ? (
        <Form
          {...layout}
          form={form}
          name="control-hooks"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          style={{
            maxWidth: 600,
            border: 10,
          }}
          labelAlign="right"
        >
          <Form.Item name="ZkBob Address" label="zKBob Address" rules={[{ required: true }]}>
            <Input onChange={(e: any) => setZkBobAddress(e.target.value)} />
          </Form.Item>
          <Form.Item name="Amount" label="Amount" rules={[{ required: true }]}>
            <Input onChange={(e: any) => setAmount(e.target.value)} />
          </Form.Item>
          <Form.Item name="Token Address" label="Token Address" rules={[{ required: true }]}>
            <Select
              placeholder="Select a option and change input text above"
              onChange={(token: Token) => {
                console.log(token)
              }}
              allowClear
            >
              {tokenOptions.map((token, index) => (
                <Option value={token.address} key={token.address}>
                  {token.symbol}
                </Option>
              ))}
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
            <Button type="primary" htmlType="submit" onClick={submitTx}>
              Send Direct Deposit
            </Button>
          </Form.Item>
        </Form>
      ) : (
        <Button color="secondary" onClick={enableZKModuleTx}>
          Click to enable ZK module
        </Button>
      )}
      {/* </Card> */}
    </Card>
  ) : (
    <Result
      status="success"
      title="Successfully Deposited Bob"
      subTitle="Transaction ID: 123assasa"
      extra={[
        <Button type="primary" key="console">
          Check Tx in Etherscan
        </Button>,
        <Button
          key="restart"
          onClick={() => {
            setStatus('initial')
          }}
        >
          Start Again
        </Button>,
      ]}
    />
  )
}

export default TransactionForm
