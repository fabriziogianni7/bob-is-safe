import React from 'react'
import styled from 'styled-components'
import 'antd/dist/reset.css'
import { Image } from 'antd'
import Wizard from './components/Wizard'

const Container = styled.div`
  padding: 1rem;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  background-color: #fffaee;
`

const SafeApp = (): React.ReactElement => {
  return (
        <Container>
                <Image width={400} height={200} src="/bob-is-safe.png" preview={false}/>
            <Wizard/>
        </Container>
  )
}

export default SafeApp
