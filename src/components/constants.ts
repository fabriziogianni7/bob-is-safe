export type Token = {
  address: string
  decimals: number
  symbol: string
  icon: string
  swapFees: number[]
  swapAddresses: string[]
  width?: number
  height?: number
}

export const TOKEN_OPTIONS: Token[] = [
  {
    // BOB
    address: '0x97a4ab97028466FE67F18A6cd67559BAABE391b8',
    decimals: 18,
    symbol: 'BOB',
    icon: '/coin-logo/bob-logo.png',
    swapAddresses: [],
    swapFees: [],
  },
  {
    // USDC
    address: '0x07865c6e87b9f70255377e024ace6630c1eaa37f',
    decimals: 6,
    symbol: 'USDC',
    icon: '/coin-logo/usdc-logo.png',
    swapFees: [500],
    swapAddresses: ['0x97a4ab97028466FE67F18A6cd67559BAABE391b8'],
  },
  {
    address: '0xcbe9771ed31e761b744d3cb9ef78a1f32dd99211',
    decimals: 18,
    symbol: 'GHO',
    icon: '/coin-logo/gho-logo.png',
    swapFees: [500, 100, 500],
    swapAddresses: [
      '0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6',
      '0x07865c6e87b9f70255377e024ace6630c1eaa37f',
      '0x97a4ab97028466FE67F18A6cd67559BAABE391b8',
    ],
  },
  {
    address: '0x328507DC29C95c170B56a1b3A758eB7a9E73455c',
    decimals: 18,
    symbol: 'APE',
    icon: '/coin-logo/ape-logo.png',
    swapAddresses: [
      '0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6',
      '0x07865c6e87b9f70255377e024ace6630c1eaa37f',
      '0x97a4ab97028466FE67F18A6cd67559BAABE391b8',
    ],
    swapFees: [500, 100, 500],
  },
]

export const ZKBOB_ADDRESS_PREFIX_REGEX = /^zkbob_[A-Za-z\d]+:/
export const BOB_IS_SAFE_MODULE_ADDRESS = '0xE7E46c2963Fda3c9390AB63f5c3713F6eF96Fb7F'
export const BOB_TOKEN_CONTRACT_ADDRESS = '0x97a4ab97028466FE67F18A6cd67559BAABE391b8'
export const MODULE_FACTORY_CONTRACT_ADDRESS = '0x1bae54b856082b8698d7c2c91425fbcf960b3335'
export const MASTER_COPY_CONTRACT = '0xc2F4232924b0A522371378c59Cf4Cd8AEcBbb2fD'
export const BOB_DEPOSIT_PROTOCOL = '0xE4C77B7787cC116A5E1549c5BB36DE07732100Bb'
export const UNISWAP_ROUTER = '0xE592427A0AEce92De3Edee1F18E0157C05861564'
