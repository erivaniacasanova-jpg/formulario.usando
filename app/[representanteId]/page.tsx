import RegistroForm from "@/components/registro-form"

export default async function RepresentantePage({ params }) {
  const { representanteId } = params

  // Aqui você define manualmente os representantes
  const representantes = {
    "134684": {
      id: "134684",
      nome: "William Dos Santos Pessoa",
    },
     if (fatherId === "135302") {
        try {
          await fetch("https://webhook.fiqon.app/webhook/a027566a-c651-460e-8805-6f6414de55b1/a98d0f5c-c379-4104-abf9-d07124ccd1ff", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              nome: formData.name || "",
              whatsapp: formData.cell || "",
              tipoChip: formData.typeChip || "",
              formaEnvio: formData.typeFrete || "",
              planoEscolhido: planoEscolhido || "",
            }),
          })
          console.log("Webhook enviado:", {
            nome: formData.name,
            whatsapp: formData.cell,
            tipoChip: formData.typeChip,
            formaEnvio: formData.typeFrete,
            planoEscolhido: planoEscolhido,
          })
          
        } catch (webhookError) {
          console.error("[v0] Webhook error:", webhookError)
        }
      }
    } catch (error) {
      console.error("[v0] Error submitting form:", error)
      setSuccessModal(true)
    }
  }
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
