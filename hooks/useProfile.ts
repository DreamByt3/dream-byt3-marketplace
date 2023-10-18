import useSWR, {SWRConfiguration} from "swr";

export default function useProfile(address: string | undefined, options?: SWRConfiguration) {
  const { data, mutate, isValidating, isLoading } = useSWR(
    (address && address !== '' ) ? `/api/profile?address=${address}` :  null,
    (url: string) => {
      if (!address) {
        return null
      }
      return fetch(url).then((response) => response.json())
    },
    {
      revalidateOnFocus: true,
      revalidateIfStale: true,
      revalidateOnReconnect: true,
      ...options
    }
  )

  return {
    data,
    mutate,
    isValidating,
    isLoading
  };
}
