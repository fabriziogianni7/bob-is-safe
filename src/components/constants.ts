export type Token = {
  address: string
  decimals: number
  symbol: string
  icon: string
  poolFee?: number
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
  },
  {
    // USDC
    address: '0x07865c6e87b9f70255377e024ace6630c1eaa37f',
    decimals: 6,
    symbol: 'USDC',
    icon: '/coin-logo/usdc-logo.png',
    poolFee: 500,
  },
  {
    address: '0xcbe9771ed31e761b744d3cb9ef78a1f32dd99211',
    decimals: 18,
    symbol: 'GHO',
    icon: '/coin-logo/gho-logo.png',
  },
  {
    address: '0x328507DC29C95c170B56a1b3A758eB7a9E73455c',
    decimals: 18,
    symbol: 'APE',
    icon: '/coin-logo/ape-logo.png',
  },
]

export const ZKBOB_ADDRESS_PREFIX_REGEX = /^zkbob_[A-Za-z\d]+:[A-Za-z\d]+$/

export const BOB_IS_SAFE_MODULE_ADDRESS = '0xE7E46c2963Fda3c9390AB63f5c3713F6eF96Fb7F'

export const BOB_TOKEN_CONTRACT_ADDRESS = '0x97a4ab97028466FE67F18A6cd67559BAABE391b8'
