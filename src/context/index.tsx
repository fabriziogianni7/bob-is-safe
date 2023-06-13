/* eslint-disable @typescript-eslint/no-empty-interface */
import { createContext, type ReactNode, useState, type Dispatch } from 'react'
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
  const [status, setStatus] = useState<any>(AppStatus.INITIAL)

  return (<Web3Context.Provider value={{
    appStatus: status,
    setStatus
  }}>
    {children}
  </Web3Context.Provider>)
}

export const Web3Consumer = Web3Context.Consumer
