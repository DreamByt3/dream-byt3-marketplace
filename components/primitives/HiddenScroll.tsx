import {styled} from "../../stitches.config";

const HiddenScroll = styled('div', {
  overflow: 'scroll',
  '-webkit-overflow-scrolling': 'touch',
  '-ms-overflow-style': 'none',
  scrollbarWidth: 'none',
  '::-webkit-scrollbar': {
    display: 'none'
  }
})

export default HiddenScroll;