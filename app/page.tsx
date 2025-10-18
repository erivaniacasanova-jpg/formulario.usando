import RegistroForm from "@/components/registro-form"

export default async function HomePage() {
  const defaultRepresentante = {
    id: "110956",
    nome: "Francisco Eliedisom Dos Santos",
    whatsapp: "558481321396",
  }

  return <RegistroForm representante={defaultRepresentante} />
}
