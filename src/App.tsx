import React from 'react'
import styled from 'styled-components'
import 'antd/dist/reset.css'
import TransactionForm from './components/TransactionForm'

const Container = styled.div`
  padding: 1rem;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  background-color: #ffffff;
`

const SafeApp = (): React.ReactElement => {
  return (
    <Container>
      <TransactionForm />
    </Container>
  )
}

export default SafeApp
