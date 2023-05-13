export type Token = {
  address: string
  decimals: number
  symbol: string
  icon: string
  poolPercentage?: number
}

export const TOKEN_OPTIONS: Token[] = [
  {
    // BOB
    address: '0x97a4ab97028466FE67F18A6cd67559BAABE391b8',
    decimals: 18,
    symbol: 'BOB',
    icon: 'icon.png',
  },
  {
    // USDC
    address: '0x07865c6e87b9f70255377e024ace6630c1eaa37f',
    decimals: 6,
    symbol: 'USDC',
    icon: 'icon.png',
    poolPercentage: 3000,
  },
  {
    address: '0xA',
    decimals: 18,
    symbol: 'GHO',
    icon: 'icon.png',
  },
  {
    address: '0xB',
    decimals: 18,
    symbol: 'APE',
    icon: 'icon.png',
  },
]


export const BOB_IS_SAFE_MODULE_ADDRESS = '0x8b443dca1908d3b1f4c191073e1732e1784e64ca'

export const BOB_TOKEN_CONTRACT_ADDRESS = '0x97a4ab97028466FE67F18A6cd67559BAABE391b8'

export const MODULE_FACTORY_CONTRACT_ADDRESS = '0x92f7bdff111e692e88e51140def107813b9c3a03'

export const RECEIVER_ZK_BOB_ADDRESS = '38aywFhcqbZmncHA8WM1UwKPgrVnqwsViwRWxbjNGBKtQxwb5YoQtFWUkP1UMgU'