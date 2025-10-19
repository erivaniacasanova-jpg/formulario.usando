import RegistroForm from "@/components/registro-form"

export default async function RepresentantePage({ params }) {
  const { representanteId } = params

  // Aqui você define manualmente os representantes
  const representantes = {
    "134684": {
      id: "134684",
      nome: "William Dos Santos Pessoa",
      whatsapp: "5521969400194",
    },
    "135302": {
    id: "135302",
    nome: "Antonia Erivania Delmiro Jacinto",
    whatsapp: "558498410187",
  },
  "153542": {
    id: "153542",
    nome: "Aline Aparecida Melo",
    whatsapp: "553193371195",
  },
}
  const representante = representantes[representanteId]

  // Caso o ID não exista
  if (!representante) {
    return <p>Representante não encontrado.</p>
  }

  // Exibe o mesmo formulário, só com dados diferentes
  return <RegistroForm representante={representante} />
}
