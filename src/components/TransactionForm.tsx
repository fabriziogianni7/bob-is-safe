import Safe, {EthersAdapter} from '@safe-global/protocol-kit'
import {useSafeAppsSDK} from '@safe-global/safe-apps-react-sdk'
import {Button, Form, Input, Select, Card, Alert, Space, Spin, Result, Typography, Image, Dropdown, Menu} from 'antd'
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
import {removeZkbobNetworkPrefix} from './helpers'
import {PaymentForm} from "./PaymentForm";
import {CheckCircleTwoTone} from '@ant-design/icons';
import TransactionPending from "./TransactionPending";
import TransactionHistory from './TransactionHistory'
import LoadingSpinner from "./LoadingSpinner";
import {Spacer} from "@nextui-org/react";

const {Text, Link} = Typography

const TransactionForm: React.FC = () => {
    const [form] = Form.useForm()
    const {sdk, safe} = useSafeAppsSDK()

    const [status, setStatus] = useState<any>('initial')
    const [zkBobAddress, setZkBobAddress] = useState<string>('')
    const [tokenIndex, setTokenIndex] = useState<number>(0)
    const [amount, setAmount] = useState<string>('')
    const [isModuleEnabled, setIsModuleEnabled] = useState<boolean | null>(false)

    useEffect(() => {
        if (!isModuleEnabled) {
            _setIsModuleEnabled()
        }
    }, [isModuleEnabled, safe.safeAddress])

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
    }, [isModuleEnabled, safe.safeAddress])

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
    }, [safe.safeAddress, sdk.txs])

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
                })
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
    }, [safe])

    switch (status) {
        case 'txPending':
            return <TransactionPending isModuleEnabled={isModuleEnabled}/>
        case 'initial':
            if (isModuleEnabled) {
                return <div>
                    {/* <Button style={{
                        background: 'transparent',
                        color: '#7D5FFF',
                        border: '1px solid #7D5FFF',
                        borderRadius: '20px',
                        height: '40px',
                    }} size={'small'} onClick={() => setStatus('history')}>History</Button> */}
                    <br/>
                    <br/>
                    <PaymentForm form={form} setZkBobAddress={setZkBobAddress} setTokenIndex={setTokenIndex}
                                 setAmount={setAmount}
                                 submitTx={submitTx} TOKEN_OPTIONS={TOKEN_OPTIONS}/></div>
            } else {
                return <div style={{
                    justifyContent: 'center',
                    backgroundColor: "white",
                    borderRadius: "15px",
                    border: "1px solid rgba(0, 0, 0, 0.06)",
                    padding: "32px",
                }}>
                    <p className="testo-bellissimo">
                        You need to enable the module in order to use it. This is a one time action.
                    </p>
                    <Button
                        className="gradient-button"
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
                            height: "48px",
                            marginTop: '12px',
                            marginBottom: "0px !important",
                        }}
                        onClick={_deployModule}
                    >
                        <Text style={{fontSize: '16px', color: "white"}}>Enable module</Text>
                    </Button>
                </div>
            }
        case 'history':
            return <div>
                <Button style={{
                    background: 'transparent',
                    color: '#7D5FFF',
                    border: '1px solid #7D5FFF',
                    borderRadius: '20px',
                    height: '30px',
                    width: '100px',
                }} onClick={() => setStatus('initial')} size={'small'}>Back</Button>
                <br/>
                <br/>
                <TransactionHistory/>
            </div>
        case 'txSuccess':
            return <div style={{
                display: 'flex',
                padding: 32,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: "white",
                borderRadius: "15px",
                border: "1px solid rgba(0, 0, 0, 0.06)",
            }}>
                <div style={{textAlign: 'center', maxWidth: '400px'}}>
                    <Image height="80px" src="/bob-meme.png" preview={false}/>
                    <h1 style={{fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', marginTop: "16px"}}>Transaction confirmed!</h1>
                    <div style={{marginTop: '36px'}}>

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
                        }} onClick={() => {
                            setStatus('initial')
                        }}>
                            Make another payment
                        </Button>

                        {' '}
                        <Link href={`https://app.safe.global/transactions/history?safe=gor:${safe.safeAddress}`}
                              target="_blank">
                            <Button className="back-hover" style={{
                                background: "none",
                                color: 'rgba(0, 0, 0, 0.4)',
                                fontWeight: 'medium',
                                border: 'none',
                                fontSize: '16px',
                                boxShadow: 'none',
                                textTransform: 'uppercase',
                                borderRadius: '8px',
                                width: '360px',
                                height: "48px",
                                marginTop: '6px',
                                marginBottom: "0px !important",
                            }} onClick={() => {
                                setStatus('initial')
                            }}>
                                Check your transactions
                            </Button>
                        </Link>
                    </div>

                </div>
            </div>
        default:
            return <div>Something went wrong</div>
    }
}

export default TransactionForm
