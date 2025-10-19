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
    whatsapp: "https://webhook.fiqon.app/webhook/a0265c1b-d832-483e-af57-8096334a57a8/e167dea4-079e-4af4-9b3f-4acaf711f432",
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
