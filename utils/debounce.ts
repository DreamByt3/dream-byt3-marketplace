// WARNING: This is not a drop in replacement solution and
// it might not work for some edge cases. Test your code!
import Timeout = NodeJS.Timeout;

type DebounceOptions = {
  trailing?: boolean
  leading?: boolean
}

export const debounce = (func: any, delay: number, options: DebounceOptions = { leading: false, trailing: true }) => {
  let timerId: Timeout
  let counter = 0

  return (...args: any) => {
    counter++
    if (!timerId && options?.leading && !options?.trailing) {
      func(...args)
    }

    if (timerId) {
      clearTimeout(timerId)
    }

    timerId = setTimeout(() => {
      if ((options?.trailing && !options?.leading) || (options?.trailing && options?.leading && counter > 1)) {
        func(...args)
        counter = 0
      }
    }, delay)
  }
}