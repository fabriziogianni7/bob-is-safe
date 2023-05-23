import React from 'react'
import { Col, Row, Typography } from 'antd'
import { LinkOutlined, ArrowDownOutlined } from '@ant-design/icons'

const { Text } = Typography

const DropdownItem = ({ amount, receiver, timestamp, txLink }: { amount: number, receiver: string, timestamp: string, txLink: string }) => {
  return (
        <div className="dropdown-item">
            <Row gutter={16} align="middle">
                <Col span={4} className="icon"><ArrowDownOutlined/></Col>
                <Col span={20}>
                    <Row gutter={[8, 8]}>
                        <Col span={24}>
                            <Text strong>{amount}</Text>
                        </Col>
                        <Col span={24}>
                            <Text>{receiver}</Text>
                        </Col>
                        <Col span={24}>
                            <Text type="secondary">{timestamp}</Text>
                        </Col>
                        <Col span={24}>
                            <a href={txLink} target="_blank" rel="noopener noreferrer" className="tx-link">
                                View tx <LinkOutlined />
                            </a>
                        </Col>
                    </Row>
                </Col>
            </Row>
        </div>
  )
}

export default DropdownItem
