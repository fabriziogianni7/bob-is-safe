import Safe, { EthersAdapter } from '@safe-global/protocol-kit'
import { useSafeAppsSDK } from '@safe-global/safe-apps-react-sdk'
import {  Typography } from 'antd'
import { ethers } from 'ethers'
import React, { useCallback, useContext, useEffect, useState } from 'react'
import safeAbi from '../contracts-abi/safe-abi.json'
import moduleAbi from '../contracts-abi/module-abi.json'
import {
  AppStatus
} from './constants'
import TransactionPending from './TransactionPending'
import Initial from './wizard-app-status/Initial'
import { Web3Context } from '../context'
import Chronology from './wizard-app-status/history/Chronology'
import TransactionSuccess from './wizard-app-status/TransactionSuccess'

const { Text, Link } = Typography

const Wizard: React.FC = () => {
  const {  safe } = useSafeAppsSDK()
  const { appStatus, setStatus } = useContext(Web3Context)

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
      setStatus(AppStatus.INITIAL)
    })

    if (isModuleEnabled) {
      const module = localStorage.getItem('moduleAddress')
      if (module) {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const moduleContract = new ethers.Contract(module, moduleAbi, provider)
        if (moduleContract) {
          const moduleContractFilters = moduleContract.filters.DepositSuccess()
          moduleContract.on(moduleContractFilters, () => {
            setStatus(AppStatus.TX_SUCCESS)
          })
        }
      }
    }
  }, [isModuleEnabled, safe.safeAddress])

  const _setIsModuleEnabled = useCallback(async () => {
    try {
      const ethAdapter = new EthersAdapter({
        ethers,
        signerOrProvider: new ethers.providers.Web3Provider(window.ethereum)
      })
      const safeSDK = await Safe.create({
        ethAdapter,
        safeAddress: safe.safeAddress
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

  switch (appStatus) {
    case AppStatus.TX_PENDING:
      return <TransactionPending isModuleEnabled={isModuleEnabled} />
    case AppStatus.INITIAL:
      return <Initial isModuleEnabled={isModuleEnabled} />
    case AppStatus.HISTORY:
      return <Chronology />
    case AppStatus.TX_SUCCESS:
      return <TransactionSuccess/>
    default:
      return <div>Something went wrong</div>
  }
}

export default Wizard
