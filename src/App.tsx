import React, { useCallback } from 'react'
import styled from 'styled-components'
import { Button, Title } from '@gnosis.pm/safe-react-components'
import { useSafeAppsSDK } from '@safe-global/safe-apps-react-sdk'
import {ethers} from "ethers";
import {safeAbi} from "./safe-abi";

const Container = styled.div`
  padding: 1rem;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`

const Link = styled.a`
  margin-top: 8px;
`

const multiSendModuleAddress = "0x38869bf66a61cF6bDB996A6aE40D5853Fd43B526";

const SafeApp = (): React.ReactElement => {
  const { sdk, safe } = useSafeAppsSDK()

  const enableZKModuleTx = useCallback(async () => {
    try {

      const { safeTxHash } = await sdk.txs.send({
        txs: [
          {
            to: safe.safeAddress,
            value: '0',
            data: ethers.Interface.from(safeAbi).encodeFunctionData("enableModule", [multiSendModuleAddress]),
          },
        ],
      })
      console.log({ safeTxHash })
      const safeTx = await sdk.txs.getBySafeTxHash(safeTxHash)
      console.log({ safeTx })
    } catch (e) {
      console.error(e)
    }
  }, [safe, sdk])

  const submitTx = useCallback(async () => {
    try {
      const { safeTxHash } = await sdk.txs.send({
        txs: [
          {
            to: safe.safeAddress,
            value: '0',
            data: '0x',
          },
        ],
      })
      console.log({ safeTxHash })
      const safeTx = await sdk.txs.getBySafeTxHash(safeTxHash)
      console.log({ safeTx })
    } catch (e) {
      console.error(e)
    }
  }, [safe, sdk])


  return (
    <Container>
      <Title size="md">Safe: {safe.safeAddress}</Title>

      <Button size="lg" color="primary" onClick={enableZKModuleTx}>
        Click to enable ZK module
      </Button>

      <Button size="lg" color="primary" onClick={submitTx}>
        Click to send a test transaction
      </Button>

      <Link href="https://github.com/safe-global/safe-apps-sdk" target="_blank" rel="noreferrer">
        Documentation
      </Link>
    </Container>
  )
}

export default SafeApp
