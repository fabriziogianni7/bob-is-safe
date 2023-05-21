import React from 'react';
import { Space, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import "./../style.css"
import CircleCrop from "./CircleCrop";

interface DataType {
    key: string;
    address: string;
    amount: number;
    token: any
    tags: string[];
    action: string;
    transaction: string;
}

const columns: ColumnsType<DataType> = [
    {
        title: 'Address',
        dataIndex: 'address',
        key: 'address',
        render: (address) => <p >{address.substring(0, 6) + '...' + address.substring(address.length - 5)}</p>,
    },
    {
        title: 'Amount',
        dataIndex: 'amount',
        key: 'amount',
    },
    {
        title: 'Token',
        dataIndex: 'token',
        key: 'token.name',
        render: (token) => {
            switch (token[0]) {
                case 'BOB':
                    return (<Space size="middle">
                        <img src={token[1]} alt={token.symbol} width={20} height={20} />
                    </Space>)
                case 'USDC':
                    return (<Space size="middle">
                        <img src={token[1]} alt={token.symbol} width={20} height={20} />
                    </Space>)
                case 'GHO':
                    return (<Space size="middle">
                        <CircleCrop imageUrl={token[1]} altText={token.symbol} size={20} />
                    </Space>)
                case 'APE':
                    return (<Space size="middle">
                        <img src={token[1]} alt={token.symbol} width={20} height={20} />
                    </Space>)
                default:
                    break;
            }

        }
    },
    {
        title: 'Tags',
        key: 'tags',
        dataIndex: 'tags',
        render: (_, { tags }) => (
            <>
                {tags.map((tag) => {
                    let color = tag.length > 5 ? 'geekblue' : 'green';
                    if (tag === 'developer') {
                        color = 'volcano';
                    }
                    if (tag === 'DONATION') {
                        color = '#7D5FFF';
                    }
                    return (
                        <Tag color={color} key={tag}>
                            {tag.toUpperCase()}
                        </Tag>
                    );
                })}
            </>
        ),
    },
    {
        title: 'Action',
        dataIndex: 'action',
        key: 'action',
        render: (action) => (
            <Space size="middle">
                <p >{action}</p>
            </Space>
        ),
    },
    {
        title: 'Transaction',
        dataIndex: 'transaction',
        key: 'transaction',
        render: (transaction) => (
            <Space size="middle">
                <a href={`https://etherscan.io/tx/${transaction}`} >{transaction.substring(0, 6) + '...' + transaction.substring(transaction.length - 5)}</a>
            </Space>
        ),

    },
];

const data: DataType[] = [
    {
        key: '1',
        address: 'zkbob_goerli:93zRekKk69QahZWB4UX261bV9FMJtJbGjoj1ugZtunrCfpupAYkS9hojZuw5miS',
        amount: 300,
        token: ["BOB", "/coin-logo/bob-logo.png"],
        tags: ['DEV', 'JUNIOR'],
        action: "Send",
        transaction: "0x54a15feeaae02ef0ad756c16bb1b3ed0a0a1eefa59049c3083457dde8dcbdb13"
    },
    {
        key: '2',
        address: 'zkbob_goerli:8vYHiH84ijNxDaCDb31hWjp4rzGdndm2oZybDUD4nHNUf31hDo8pREDnpYNdza9',
        amount: 250,
        token: ["GHO", "/coin-logo/gho-logo.png"],
        tags: ['PM'],
        action: "Send",
        transaction: "0xba0e26cb8d8b4acd97bc64294af7223ed559e2b85ecb856a2c3b022dbeac9494"
    },
    {
        key: '3',
        address: 'zkbob_goerli:AFs9zLdSHhUsEvx9jekr4JpcgCzzYUGog9utSaqr4m7PRagVJQBTAv3r8dbvjAP',
        amount: 1000,
        token: ["USDC", "/coin-logo/usdc-logo.png"],
        tags: ['DONATION'],
        action: "Receive",
        transaction: "0x1135ea88eb93b20d45a019f510f2c0652df952fa9e820b72355fe0cca2c5b940"
    },
    {
        key: '4',
        address: 'zkbob_goerli:85VnkbKjL9f7S98KLaTGxLHdADtyNvtK1ZckYKvydCNdBUbkRn2X1LVKkBT5f7Y',
        amount: 750,
        token: ["GHO", "/coin-logo/gho-logo.png"],
        tags: ['DONATION'],
        action: "Receive",
        transaction: "0xa0e84e6cd6d3ceb0c74c83d7a71ebbf89482334cf51acc941f3afb54f44330ef"
    },
    {
        key: '5',
        address: 'zkbob_goerli:2p9sXneUjbPFRosqY51B3aiLwXAMvS47rZup5nZ27zJRqswhDrUhgcTEXQ5Cik3',
        amount: 500,
        token: ["APE", "/coin-logo/ape-logo.png"],
        tags: ['developer'],
        action: "Send",
        transaction: "0xb45b462f3a9e9c6a9b8d77525192369c8e31d9492488bc20314298777d11099d"
    },
];



const TransactionHistory: React.FC = () => {
    const rowClassName = (record: any, index: number) => {
        return index % 2 === 0 ? 'even-row' : 'odd-row';
    };
    return <Table columns={columns} className="custom-table" dataSource={data} rowClassName={rowClassName} />;
}

export default TransactionHistory;