export interface Notificacao {
  id: number
  titulo: string
  mensagem: string
  tipoNotificacao: string
  dataEnvio: string
  lida: boolean
  usuarioId: number
}
