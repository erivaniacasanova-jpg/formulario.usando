import RegistroForm from "@/components/registro-form"
import type { Representante } from "@/lib/types"

interface PageProps {
  params: Promise<{
    representanteId: string
  }>
}

export default async function RepresentantePage({ params }: PageProps) {
  const { representanteId } = await params

  const defaultRepresentante: Representante = {
    id: representanteId,
    nome: "Francisco Eliedisom Dos Santos",
    whatsapp: "558481321396",
  }

  return <RegistroForm representante={defaultRepresentante} />
}
