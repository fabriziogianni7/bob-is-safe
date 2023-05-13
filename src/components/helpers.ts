import { ZKBOB_ADDRESS_PREFIX_REGEX } from './constants'

export const removeZkbobNetworkPrefix = (input: string): string => {
  return input.replace(ZKBOB_ADDRESS_PREFIX_REGEX, '')
}
