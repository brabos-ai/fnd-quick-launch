import { useErrorModalStore } from '@/stores/error-modal-store'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from '@/components/ui/alert-dialog'

export function ErrorModal() {
  const { isOpen, error, close } = useErrorModalStore()

  return (
    <AlertDialog open={isOpen} onOpenChange={close}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-base sm:text-lg">
            Acesso Negado
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm sm:text-base">
            {error?.message || 'Você não tem permissão para acessar este recurso.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={close} className="w-full sm:w-auto">
            Entendi
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
