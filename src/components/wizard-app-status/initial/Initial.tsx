import { Button, Form, Typography } from 'antd'
import { useCallback, useContext, useState } from 'react'
import { PaymentForm } from './PaymentForm'
import { ethers } from 'ethers'
import { AppStatus, BOB_DEPOSIT_PROTOCOL, BOB_TOKEN_CONTRACT_ADDRESS, MODULE_FACTORY_CONTRACT_ADDRESS, TOKEN_OPTIONS, UNISWAP_ROUTER } from '../../constants'
import { useSafeAppsSDK } from '@safe-global/safe-apps-react-sdk'
import moduleAbi from '../../../contracts-abi/module-abi.json'
import factoryAbi from '../../../contracts-abi/factory-abi.json'
import safeAbi from '../../../contracts-abi/safe-abi.json'

import { removeZkbobNetworkPrefix } from '../../helpers'
import { Web3Context } from '../../../context'
const { Text, Link } = Typography

const Initial = ({ isModuleEnabled }: any) => {
  const [form] = Form.useForm()
  const { sdk, safe } = useSafeAppsSDK()
  const { setStatus } = useContext(Web3Context)

  const [zkBobAddress, setZkBobAddress] = useState<string>('')
  const [tokenIndex, setTokenIndex] = useState<number>(0)
  const [amount, setAmount] = useState<string>('')

  const submitTx = async () => {
    try {
      const module = localStorage.getItem('moduleAddress')
      if (module) {
        const token = TOKEN_OPTIONS[tokenIndex]
        const { safeTxHash } = await sdk.txs.send({
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
                0
              ])
            }
          ]
        })
        setStatus(AppStatus.TX_PENDING)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const enableZKModule = useCallback(async (moduleAddress: string) => {
    try {
      const { safeTxHash } = await sdk.txs.send({
        txs: [
          {
            to: safe.safeAddress,
            value: '0',
            data: new ethers.utils.Interface(safeAbi).encodeFunctionData('enableModule', [moduleAddress])
          }
        ]
      })
      console.log({ safeTxHash })
    } catch (e) {
      console.error(e)
      setStatus('initial')
    }
  }, [safe.safeAddress, sdk.txs])

  const _deployModule = useCallback(async () => {
    setStatus('txPending')

    const provider = new ethers.providers.Web3Provider(window.ethereum)
    await provider.send('eth_requestAccounts', []) // <- this promps user to connect metamask
    const signer = provider.getSigner()
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
      UNISWAP_ROUTER
    )
    console.log('DEPLOYED MODULE', deployModule)
  }, [])

  if (isModuleEnabled) {
    return <div>
      {/* <Button style={{
                        background: 'transparent',
                        color: '#7D5FFF',
                        border: '1px solid #7D5FFF',
                        borderRadius: '20px',
                        height: '40px',
                    }} size={'small'} onClick={() => setStatus('history')}>History</Button> */}
      <br />
      <br />
      <PaymentForm form={form} setZkBobAddress={setZkBobAddress} setTokenIndex={setTokenIndex}
        setAmount={setAmount}
        submitTx={submitTx} TOKEN_OPTIONS={TOKEN_OPTIONS} />
    </div>
  }
  return <div style={{
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: '15px',
    border: '1px solid rgba(0, 0, 0, 0.06)',
    padding: '32px'
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
        height: '48px',
        marginTop: '12px',
        marginBottom: '0px !important'
      }}
      onClick={_deployModule}
    >
      <Text style={{ fontSize: '16px', color: 'white' }}>Enable module</Text>
    </Button>
  </div>
}

export default Initial
