import Safe, { EthersAdapter } from '@safe-global/protocol-kit'
import { useSafeAppsSDK } from '@safe-global/safe-apps-react-sdk'
import { Button, Form, Input, Select, Card, Alert, Space, Spin, Result, Typography } from 'antd'
import { ethers } from 'ethers'
import React, { useCallback, useEffect, useState } from 'react'
import safeAbi from '../contracts-abi/safe-abi.json'
import moduleAbi from '../contracts-abi/module-abi.json'
import factoryAbi from '../contracts-abi/factory-abi.json'
import masterCopyAbi from '../contracts-abi/master-copy-abi.json'
import { BOB_TOKEN_CONTRACT_ADDRESS, TOKEN_OPTIONS, MODULE_FACTORY_CONTRACT_ADDRESS, MASTER_COPY_CONTRACT } from './constants'
import { layout, tailLayout } from './styles'
import { keccak256 } from 'ethers/lib/utils'

const { Option } = Select
const { Text, Link } = Typography

const TransactionForm: React.FC = () => {
  const [form] = Form.useForm()
  const { sdk, safe } = useSafeAppsSDK()

  const [status, setStatus] = useState<'initial' | 'txPending' | 'txSuccess'>('initial')
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
      const module = localStorage.getItem("moduleAddress")
      if (module) {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const moduleContract = new ethers.Contract(module, moduleAbi, provider)
        if (moduleContract) {
          console.log("SHOULD ENABLE THE EVENT LISTENER", module)
          const moduleContractFilters = moduleContract.filters.DepositSuccess()
          moduleContract.on(moduleContractFilters, () => {
            console.log("DEPOSIT SUCCESS")
            setStatus('txSuccess')
          })
        }
      }
    }
  }, [isModuleEnabled])



  const _deployModule = useCallback(
    async () => {
      setStatus('txPending')

      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = await provider.getSigner()
      const factoryContract = new ethers.Contract(MODULE_FACTORY_CONTRACT_ADDRESS, factoryAbi, signer)
      
      const factoryContractFilters = factoryContract.filters.ModuleProxyCreation()
      factoryContract.on(factoryContractFilters, (address,y) => {
        console.log("ADDRESSSSS", address,y)
        localStorage.setItem('moduleAddress', address);

        enableZKModule(address)
      })

      const addr = ethers.utils.getAddress(safe.safeAddress);
      const encoded = ethers.utils.defaultAbiCoder.encode(["address", "address", "address"], [addr, addr, addr]);
      console.log(encoded)
      const masterCopyInterface = new ethers.utils.Interface(masterCopyAbi);
      const encodedMasterCopy = masterCopyInterface.encodeFunctionData("setUp", [encoded]);

      const deployModule = await factoryContract.deployModule(MASTER_COPY_CONTRACT, encodedMasterCopy, Date.now())
      console.log("DEPLOYED MODULE", deployModule)
    }, []
  )





  const enableZKModule = useCallback(async (moduleAddress: string) => {
    try {
      const { safeTxHash } = await sdk.txs.send({
        txs: [
          {
            to: safe.safeAddress,
            value: '0',
            data: new ethers.utils.Interface(safeAbi).encodeFunctionData('enableModule', [moduleAddress]),
          },
        ],
      })
      console.log({ safeTxHash })
    } catch (e) {
      console.error(e)
      setStatus('initial')
    }
  }, [])

  const submitTx = async () => {
    try {
      const module = localStorage.getItem("moduleAddress")
      if (module) {
        const token = TOKEN_OPTIONS[tokenIndex]
        const { safeTxHash } = await sdk.txs.send({
          txs: [
            {
              to: module,
              value: '0',
              data: new ethers.utils.Interface(moduleAbi).encodeFunctionData('paymentInPrivateMode2', [
                safe.safeAddress,
                ethers.utils.parseUnits(amount, token.decimals),
                zkBobAddress,
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
        // console.log({ safeTxHash })
        // const safeTx = await sdk.txs.getBySafeTxHash(safeTxHash)
        setStatus('txPending')
      }
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
      const module = localStorage.getItem('moduleAddress');
      if (module) {
        const isEnabled = await safeSDK.isModuleEnabled(module)
        setIsModuleEnabled(isEnabled)
      } else { setIsModuleEnabled(false) }


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
          <Form.Item name="Token Address" label="Token Address" rules={[{ required: true }]}>
            <Select
              placeholder="Select a option and change input text above"
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
            <Input onChange={(e: any) => setAmount(e.target.value)} />
          </Form.Item>
          <Form.Item {...tailLayout}>
            <Button type="primary" htmlType="submit" onClick={submitTx}>
              Send Direct Deposit
            </Button>
          </Form.Item>
        </Form>
      ) : isModuleEnabled != null ? (
        <Button color="secondary" onClick={_deployModule}>
          Click to enable ZK module
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
      title="Successfully Deposited Bob"
      subTitle="Check transaction in Safe Wallet"
      extra={[
        <Link href={`https://app.safe.global/transactions/history?safe=gor:${safe.safeAddress}`}
          target="_blank">
          <Button type="primary" key="console">
            Check your Safe
          </Button>
        </Link>,
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