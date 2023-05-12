import React, { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'
import { Title } from '@gnosis.pm/safe-react-components'
import { Button } from 'antd';
import 'antd/dist/reset.css';
import { useSafeAppsSDK } from '@safe-global/safe-apps-react-sdk'
import { ethers } from "ethers";
import Safe, { EthersAdapter } from "@safe-global/protocol-kit";
import TransactionForm from './components/TransactionForm';

const Container = styled.div`
  padding: 1rem;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  background-color: #ffffff
`

const bobIsSafeModuleAddress = "0x38869bf66a61cF6bDB996A6aE40D5853Fd43B526";
// const bobIsSafeFactoryAddress = "0xb137cf186e6c32b97e20f5abd294e47ee95e8ac1";

const SafeApp = (): React.ReactElement => {
  // const { sdk, safe } = useSafeAppsSDK()
  // const [isModuleLoading, setIsModuleLoading] = useState(false)
  // const [isModuleEnabled, setIsModuleEnabled] = useState(false)

  // useEffect(() => {
  //   setIsModuleLoading(true)
  //   _isModuleEnabled()
  //   setIsModuleLoading(false)
  // }, [])

  // const enableZKModuleTx = useCallback(async () => {
  //   try {

  //     const { safeTxHash } = await sdk.txs.send({
  //       txs: [
  //           // TODO: call the factory to deploy the module and then enable the module by passing a predicted address
  //         /*{
  //           to: bobIsSafeFactoryAddress,
  //           value: '0',
  //           data: new ethers.utils.Interface(factoryAbi).encodeFunctionData("deployModule", [bobIsSafeModuleAddress]),
  //         },*/
  //         {
  //           to: safe.safeAddress,
  //           value: '0',
  //           data: new ethers.utils.Interface(safeAbi).encodeFunctionData("enableModule", [bobIsSafeModuleAddress]),
  //         },
  //       ],
  //     })
  //     console.log({ safeTxHash })
  //     const safeTx = await sdk.txs.getBySafeTxHash(safeTxHash)
  //     console.log({ safeTx })
  //   } catch (e) {
  //     console.error(e)
  //   }
  // }, [safe, sdk])

  // const submitTx = useCallback(async () => {
  //   try {
  //     const { safeTxHash } = await sdk.txs.send({
  //       txs: [
  //         {
  //           to: safe.safeAddress,
  //           value: '0',
  //           data: '0x',
  //         },
  //       ],
  //     })
  //     console.log({ safeTxHash })
  //     const safeTx = await sdk.txs.getBySafeTxHash(safeTxHash)
  //     console.log({ safeTx })
  //   } catch (e) {
  //     console.error(e)
  //   }
  // }, [safe, sdk])

  // const _isModuleEnabled = useCallback(async () => {
  //   try {
  //     const ethAdapter = new EthersAdapter({
  //       ethers,
  //       signerOrProvider: new ethers.providers.Web3Provider(window.ethereum)
  //     })
  //     const safeSDK = await Safe.create({
  //       ethAdapter,
  //       safeAddress: safe.safeAddress
  //     })

  //     const isEnabled = await safeSDK.isModuleEnabled(bobIsSafeModuleAddress)
  //     console.log("isEnabled", isEnabled);
  //     setIsModuleEnabled(isEnabled)
  //   } catch (e) {
  //     console.error(e)
  //   }
  // }, [safe, sdk])


  return (
    <Container>
      <TransactionForm/>
      {/* <Title size="md">Safe: {safe.safeAddress}</Title>
      {
        isModuleLoading &&
        !isModuleEnabled &&
        <Button  color="primary" onClick={enableZKModuleTx}>
          Click to enable ZK module
        </Button>
      }

      <br />

      <Button  color="primary" onClick={submitTx}>
        Click to send a test transaction
      </Button> */}

    </Container>
  )
}

export default SafeApp
