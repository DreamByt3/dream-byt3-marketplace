import React, {FC, useMemo} from 'react'
import { styled } from '../../stitches.config'
import { StyledComponent } from '@stitches/react/types/styled-component'
import { useReservoirClient } from '@reservoir0x/reservoir-kit-ui'
import { zeroAddress } from 'viem'
import {DREAM_LP, VE_DREAM} from "../../utils/contracts";

type Props = {
  address: string
  chainId?: number
} & Parameters<StyledComponent>['0']

const StyledImg = styled('img', {})

const CryptoCurrencyIcon: FC<Props> = ({
  address = zeroAddress,
  chainId,
  css,
}) => {
  const client = useReservoirClient()
  const chain = (client?.chains || [])?.find((chain) =>
    chainId !== undefined ? chain.id === chainId : chain.active
  )

  const imageSrc = useMemo(() => {
    const isDREAMLP = address.toLowerCase() === DREAM_LP.toLowerCase()
    const isVEDREAM = address.toLowerCase() === VE_DREAM.toLowerCase()

    if (isDREAMLP) {
      return '/icons/currency/dream-lp.svg'
    }

    if (isVEDREAM) {
      return '/icons/currency/ve-dream.svg'
    }

    return `${chain?.baseApiUrl}/redirect/currency/${address}/icon/v1`
  }, [address])

  return (
    <StyledImg
      src={imageSrc}
      css={css}
    />
  )
}

export default CryptoCurrencyIcon
