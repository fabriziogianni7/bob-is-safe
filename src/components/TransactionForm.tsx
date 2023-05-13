import Safe, { EthersAdapter } from '@safe-global/protocol-kit'
import { useSafeAppsSDK } from '@safe-global/safe-apps-react-sdk'
import { Button, Form, Input, Select, Card, Alert, Space, Spin, Result, Typography, Image } from 'antd'
import { ethers } from 'ethers'
import React, { useCallback, useEffect, useState } from 'react'
import safeAbi from '../contracts-abi/safe-abi.json'
import moduleAbi from '../contracts-abi/module-abi.json'
import { BOB_TOKEN_CONTRACT_ADDRESS, BOB_IS_SAFE_MODULE_ADDRESS, TOKEN_OPTIONS } from './constants'
import { layout, tailLayout } from './styles'
import { removeZkbobNetworkPrefix } from './helpers'

const { Option } = Select
const { Text, Link } = Typography

const TransactionForm: React.FC = () => {
  const [form] = Form.useForm()
  const { sdk, safe } = useSafeAppsSDK()

  const [status, setStatus] = useState<'initial' | 'txPending' | 'txSuccess'>('txSuccess')
  const [zkBobAddress, setZkBobAddress] = useState<string>('')
  const [tokenIndex, setTokenIndex] = useState<number>(0)
  const [amount, setAmount] = useState<string>('')
  const [isModuleEnabled, setIsModuleEnabled] = useState<boolean | null>()

  useEffect(() => {
    if (!isModuleEnabled) {
      _setIsModuleEnabled()
    }
  }, [isModuleEnabled])

  useEffect(() => {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const safeContract = new ethers.Contract(safe.safeAddress, safeAbi, provider)

    const safeContractFilters = safeContract.filters.EnabledModule()
    safeContract.on(safeContractFilters, () => {
      setIsModuleEnabled(true)
      setStatus('initial')
    })
    if (isModuleEnabled) {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const moduleContract = new ethers.Contract(BOB_IS_SAFE_MODULE_ADDRESS, moduleAbi, provider)
      if (moduleContract) {
        const moduleContractFilters = moduleContract.filters.DepositSuccess()
        moduleContract.on(moduleContractFilters, async (x, y) => {
          setStatus('txSuccess')
        })
      }
    }
  }, [isModuleEnabled])

  const enableZKModuleTx = useCallback(async () => {
    try {
      setStatus('txPending')
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
            data: new ethers.utils.Interface(safeAbi).encodeFunctionData('enableModule', [BOB_IS_SAFE_MODULE_ADDRESS]),
          },
        ],
      })
      console.log({ safeTxHash })
    } catch (e) {
      console.error(e)
      setStatus('initial')
    }
  }, [safe, sdk])

  const submitTx = async () => {
    try {
      console.log(removeZkbobNetworkPrefix(zkBobAddress))
      const token = TOKEN_OPTIONS[tokenIndex]
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
            to: BOB_IS_SAFE_MODULE_ADDRESS,
            value: '0',
            data: new ethers.utils.Interface(moduleAbi).encodeFunctionData('paymentInPrivateMode', [
              safe.safeAddress,
              ethers.utils.parseUnits(amount, token.decimals),
              removeZkbobNetworkPrefix(zkBobAddress),
              token.address === BOB_TOKEN_CONTRACT_ADDRESS ? [] : [token.address, BOB_TOKEN_CONTRACT_ADDRESS],
              token.address === BOB_TOKEN_CONTRACT_ADDRESS ? 0 : token.poolFee,
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

      const isEnabled = await safeSDK.isModuleEnabled(BOB_IS_SAFE_MODULE_ADDRESS)
      setIsModuleEnabled(isEnabled)
    } catch (e) {
      console.error(e)
    }
  }, [safe, sdk])

  return status === 'txPending' ? (
    <Card
      title="Wait for the tx to be confirmed"
      style={{ width: 700 }}
      extra={
        <a
          target="_blank"
          href="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMjJmNzYzOGQ4ZTQ5NzQ5ZWQxZjc5MDMyMmEzYWQzMTBmNzM1N2NlZiZlcD12MV9pbnRlcm5hbF9naWZzX2dpZklkJmN0PWc/tpdG5dt17HaO4/giphy-downsized-large.gif"
        >
          ⁉️
        </a>
      }
    >
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
      title="Payment powered by zkBob"
      extra={
        <a target="_blank" href="https://media.giphy.com/media/tpdG5dt17HaO4/giphy-downsized-large.gif">
          More
        </a>
      }
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
            <Input onChange={(e: any) => setZkBobAddress(e.target.value)} placeholder="zkbob_goerli:randomString" />
          </Form.Item>
          <Form.Item name="Token" label="Token" rules={[{ required: true }]}>
            <Select
              placeholder="Select one token"
              onChange={(tokenIndex: number) => {
                setTokenIndex(tokenIndex)
              }}
              allowClear
            >
              {TOKEN_OPTIONS.map((token, index) => (
                <Option value={index} key={index}>
                  {/* <img src={`/coin-logo/bob-logo.png`} alt={token.symbol} /> */}
                  <Space direction="horizontal">
                    <img src={token.icon} alt={token.symbol} width={20} height={20} />

                    <Text>{token.symbol}</Text>
                  </Space>
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="Amount" label="Amount" rules={[{ required: true }]}>
            <Input type="number" onChange={(e: any) => setAmount(e.target.value)} placeholder="0.7" />
          </Form.Item>
          <Form.Item {...tailLayout}>
            <Button
              style={{ background: `linear-gradient(to right, #7D5FFF, #FED471)`, color: 'white', fontWeight: 'bold' }}
              htmlType="submit"
              onClick={submitTx}
            >
              Send money to your anon fren 👷
            </Button>
          </Form.Item>
        </Form>
      ) : isModuleEnabled != null ? (
        <Button color="secondary" onClick={enableZKModuleTx}>
          Add privacy-preserving payments module
        </Button>
      ) : (
        <Spin size="default">
          <Alert message="Loading" description="Loading the Safe App" type="info" />
        </Spin>
      )}
      {/* </Card> */}
    </Card>
  ) : (
    <Result
      status="success"
      title="Congrats, Bob is Safe!!!! 👷"
      subTitle="Check transaction in Safe Wallet"
      children={<Image width={300} height={249} src="/bob-meme.png" />}
      extra={[
        <>
          <Link href={`https://app.safe.global/transactions/history?safe=gor:${safe.safeAddress}`} target="_blank">
            <Button type="primary" key="console">
              Check your Safe
            </Button>
          </Link>
        </>,
        <Button
          key="restart"
          onClick={() => {
            setStatus('initial')
          }}
        >
          Send another payment
        </Button>,
      ]}
    />
  )
}

export default TransactionForm
