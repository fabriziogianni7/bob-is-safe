import Safe, {EthersAdapter} from '@safe-global/protocol-kit'
import {useSafeAppsSDK} from '@safe-global/safe-apps-react-sdk'
import {Button, Form, Input, Select, Card, Alert, Space, Spin, Result, Typography, Image} from 'antd'
import {ethers} from 'ethers'
import React, {useCallback, useEffect, useState} from 'react'
import safeAbi from '../contracts-abi/safe-abi.json'
import moduleAbi from '../contracts-abi/module-abi.json'
import factoryAbi from '../contracts-abi/factory-abi.json'
import {
    BOB_TOKEN_CONTRACT_ADDRESS,
    TOKEN_OPTIONS,
    MODULE_FACTORY_CONTRACT_ADDRESS,
    BOB_DEPOSIT_PROTOCOL,
    UNISWAP_ROUTER,
} from './constants'
import masterCopyAbi from '../contracts-abi/master-copy-abi.json'
import {layout, tailLayout} from './styles'
import {removeZkbobNetworkPrefix} from './helpers'
import {PaymentForm} from "./PaymentForm";
import { CheckCircleTwoTone } from '@ant-design/icons';
const {Option} = Select
const {Text, Link} = Typography

const TransactionForm: React.FC = () => {
    const [form] = Form.useForm()
    const {sdk, safe} = useSafeAppsSDK()

    const [status, setStatus] = useState<'initial' | 'txPending' | 'txSuccess'>('txSuccess')
    const [zkBobAddress, setZkBobAddress] = useState<string>('')
    const [tokenIndex, setTokenIndex] = useState<number>(0)
    const [amount, setAmount] = useState<string>('')
    const [isModuleEnabled, setIsModuleEnabled] = useState<boolean | null>(false)

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
            const module = localStorage.getItem('moduleAddress')
            if (module) {
                const provider = new ethers.providers.Web3Provider(window.ethereum)
                const moduleContract = new ethers.Contract(module, moduleAbi, provider)
                if (moduleContract) {
                    const moduleContractFilters = moduleContract.filters.DepositSuccess()
                    moduleContract.on(moduleContractFilters, () => {
                        setStatus('txSuccess')
                    })
                }
            }
        }
    }, [isModuleEnabled])

    const _deployModule = useCallback(async () => {
        setStatus('txPending')

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send('eth_requestAccounts', []); // <- this promps user to connect metamask
        const signer = provider.getSigner();
        const factoryContract = new ethers.Contract(MODULE_FACTORY_CONTRACT_ADDRESS, factoryAbi, signer)

        const factoryContractFilters = factoryContract.filters.ModuleProxyCreation()
        factoryContract.on(factoryContractFilters, (address, y) => {
            localStorage.setItem('moduleAddress', address)
            enableZKModule(address)
        })

        const deployModule = await factoryContract.createModule(
            safe.safeAddress,
            safe.safeAddress,
            safe.safeAddress,
            BOB_TOKEN_CONTRACT_ADDRESS,
            BOB_DEPOSIT_PROTOCOL,
            UNISWAP_ROUTER,
        )
        console.log('DEPLOYED MODULE', deployModule)
    }, [])

    const enableZKModule = useCallback(async (moduleAddress: string) => {
        try {
            const {safeTxHash} = await sdk.txs.send({
                txs: [
                    {
                        to: safe.safeAddress,
                        value: '0',
                        data: new ethers.utils.Interface(safeAbi).encodeFunctionData('enableModule', [moduleAddress]),
                    },
                ],
            })
            console.log({safeTxHash})
        } catch (e) {
            console.error(e)
            setStatus('initial')
        }
    }, [])

    const submitTx = async () => {
        try {
            const module = localStorage.getItem('moduleAddress')
            if (module) {
                const token = TOKEN_OPTIONS[tokenIndex]
                const {safeTxHash} = await sdk.txs.send({
                    txs: [
                        {
                            to: module,
                            value: '0',
                            data: new ethers.utils.Interface(moduleAbi).encodeFunctionData('paymentInPrivateMode', [
                                safe.safeAddress,
                                ethers.utils.parseUnits(amount, token.decimals),
                                removeZkbobNetworkPrefix(zkBobAddress),
                                token.address === BOB_TOKEN_CONTRACT_ADDRESS ? [] : [token.address, ...token.swapAddresses],
                                token.address === BOB_TOKEN_CONTRACT_ADDRESS ? [] : token.swapFees,
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
            const module = localStorage.getItem('moduleAddress')
            if (module) {
                const isEnabled = await safeSDK.isModuleEnabled(module)
                setIsModuleEnabled(isEnabled)
            } else {
                setIsModuleEnabled(false)
            }
        } catch (e) {
            console.error(e)
        }
    }, [safe, sdk])

    return status === 'txPending' ? (
        <Card
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
    ) : status === 'initial' ? (
        <Card
            title="Payments powered by zkBob"
            extra={
                <a target="_blank" href="https://zkbob.com" rel="noopener noreferrer">
                    More
                </a>
            }
            style={{
                width: 700,
                borderRadius: '8px',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
            }}
        >
            {isModuleEnabled && status === 'initial' ? (
                <PaymentForm form={form} setZkBobAddress={setZkBobAddress} setTokenIndex={setTokenIndex} setAmount={setAmount}
                             submitTx={submitTx} TOKEN_OPTIONS={TOKEN_OPTIONS}/>
            ) : isModuleEnabled != null ? (
                <Button
                    style={{
                        background: 'linear-gradient(to right, #7D5FFF, #A489FF)',
                        color: 'white',
                        fontWeight: 'bold',
                        border: 'none',
                        borderRadius: '20px',
                        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
                        width: '100%',
                        height: '40px',
                    }}
                    onClick={_deployModule}
                >
                    <Space>
                        <Text style={{ fontSize: '16px', color: "white"}}>Add privacy-preserving payments module</Text>
                    </Space>
                </Button>
            ) : (
                <Spin size="default" tip="Loading the Safe App" style={{ textAlign: 'center' }}>
                    <Alert message="Loading" type="info" />
                </Spin>
            )}
        </Card>
    ) : (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
            <div style={{ textAlign: 'center', maxWidth: '400px' }}>
                <CheckCircleTwoTone twoToneColor="#52c41a" style={{ fontSize: '72px', marginBottom: '24px' }} />
                <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>Congrats, Bob is Safe!</h1>
                <div style={{ marginBottom: '40px' }}>
                    <Link href={`https://app.safe.global/transactions/history?safe=gor:${safe.safeAddress}`} target="_blank">
                        <Button type="primary" style={{ width: '100%', borderRadius: '20px', marginBottom: '16px' }}>
                            Check your Safe transactions
                        </Button>
                    </Link>
                    <Button style={{ width: '100%', borderRadius: '20px' }} onClick={() => { setStatus('initial') }}>
                        Go back to Home
                    </Button>
                </div>
                <Image width={300} height={249} src="/bob-meme.png" preview={false} />
            </div>
        </div>
    )
}

export default TransactionForm
