import { Toaster as SonnerToaster } from 'sonner'

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast: 'rounded-lg border border-gray-200 bg-white shadow-lg',
          title: 'text-sm font-semibold text-gray-900',
          description: 'text-sm text-gray-500',
          error: 'border-red-200 bg-red-50',
          success: 'border-green-200 bg-green-50',
        },
      }}
    />
  )
}
