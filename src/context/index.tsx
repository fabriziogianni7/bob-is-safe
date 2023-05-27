/* eslint-disable @typescript-eslint/no-empty-interface */
import { createContext, type ReactNode, useEffect, useRef, useState, useCallback, type Dispatch } from 'react'
import { ethers } from 'ethers'
import { BOB_DEPOSIT_PROTOCOL, BOB_TOKEN_CONTRACT_ADDRESS, GOERLI, MODULE_FACTORY_CONTRACT_ADDRESS, UNISWAP_ROUTER } from './constants'
import { useSafeAppsSDK } from '@safe-global/safe-apps-react-sdk'
import factoryAbi from '../contracts-abi/factory-abi.json'
import { AppStatus } from '../components/constants'
import React from 'react'

interface Web3ContextType {
  appStatus: AppStatus
  setStatus: Dispatch<any>
  // provider?: ethers.providers.Web3Provider
  // signer?: ethers.providers.JsonRpcSigner
  // account?: any
  // connectSigner: () => void
  // connectToDefaultNetwork: () => any
}

export const Web3Context = createContext<Web3ContextType>({
  appStatus: AppStatus.INITIAL,
  setStatus: () => {}
  // provider: {} as ethers.providers.Web3Provider,
  // signer: {} as ethers.providers.JsonRpcSigner,
  // connectSigner: () => { },
  // connectToDefaultNetwork: () => { }
})

/**
 * @todo create the ethersjs Provider
 * @todo provide the function  to instantiate module
 * @todo read logs to retrieve the custom module. if found, save it in cache. need to use ethersJS (see https://medium.com/@kaishinaw/ethereum-logs-hands-on-with-ethers-js-a28dde44cbb6)
 * @todo provide the function to send a transaction
 * @todo provide the function retrieve the tx history
 */
export const Web3Provider = ({ children }: { children: ReactNode }) => {
  const { sdk, safe, connected } = useSafeAppsSDK()
  const [status, setStatus] = useState<any>(AppStatus.INITIAL)

  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const signer = provider.getSigner()


  // const provider: any = useRef(undefined)
  //  const signer: any = useRef(undefined)

  // const [_account, _setAccount] = useState<any>()
  // const [_signer, _setSigner] = useState<any>()

  // useEffect(() => {
  //   // setSigner(acc)
  //   checkWindowEthereum()

  //   // setting account
  //   checkAccountAndSigner()

  //   // subscribing to wallet events:
  //   window.ethereum.on('accountsChanged', handleAccountChange)
  //   return () => {
  //     provider?.current?.removeListener('accountsChanged', handleAccountChange)
  //   }
  // }, [_account, signer])

  // const checkWindowEthereum = () => {
  //   if (!window.ethereum) { alert('MetaMask not installed; using read-only defaults') } else {
  //     provider.current = new ethers.providers.Web3Provider(window.ethereum)
  //   }
  // }

  // const checkAccountAndSigner = () => {
  //   if (!localStorage.getItem('account')) {
  //     connectSigner()
  //   } else {
  //     _setAccount(localStorage.getItem('account'))
  //     getSigner()
  //   }
  // }

  // const getSigner = async () => {
  //   try {
  //     signer.current = await provider.current.getSigner()
  //     _setSigner(signer.current)
  //     console.log('new singre', signer.current)
  //   } catch (error) {
  //     console.log(error)
  //   }
  // }

  // const connectSigner = async () => {
  //   try {
  //     const accs = await provider?.current.send('eth_requestAccounts', [])
  //     localStorage.setItem('account', accs[0])
  //     _setAccount(accs[0])
  //     await connectToDefaultNetwork()
  //   } catch (error) {
  //     console.log(error)
  //   }
  // }

  // const connectToDefaultNetwork = async () => {
  //   try {
  //     const x = await window.ethereum.request({
  //       method: 'wallet_addEthereumChain',
  //       params: [GOERLI]
  //     })
  //   } catch (error) {
  //     console.log(error)
  //   }
  // }

  // const handleAccountChange = (accounts: string[]) => {
  //   const acc: string = accounts[0]
  //   localStorage.setItem('account', acc)
  //   _setAccount(acc)
  //   getSigner()
  //   console.log('account is changed')
  // }

  return (<Web3Context.Provider value={{
    appStatus: status,
    setStatus
    // account: _account,
    // provider: provider.current,
    // signer: signer.current,
    // connectSigner,
    // connectToDefaultNetwork
  }}>
    {children}
  </Web3Context.Provider>)
}

export const Web3Consumer = Web3Context.Consumer
