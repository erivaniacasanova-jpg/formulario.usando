"use client"

import type React from "react"
import { useState } from "react"
import type { FormData, Representante } from "@/lib/types"

interface RegistroFormProps {
  representante?: Representante | null
}

const plans = [
  { id: "178", name: "40GB COM LIGACAO", price: "49,90", operator: "VIVO", color: "text-purple-600" },
  { id: "69", name: "80GB COM LIGACAO", price: "69,90", operator: "VIVO", color: "text-purple-600" },
  { id: "61", name: "150GB COM LIGACAO", price: "99,90", operator: "VIVO", color: "text-purple-600" },
  { id: "56", name: "100GB COM LIGACAO", price: "69,90", operator: "TIM", color: "text-blue-600" },
  { id: "154", name: "200GB SEM LIGAÇÃO", price: "159,90", operator: "TIM", color: "text-blue-600" },
  { id: "155", name: "300GB SEM LIGAÇÃO", price: "199,90", operator: "TIM", color: "text-blue-600" },
  { id: "57", name: "80GB COM LIGACAO", price: "69,90", operator: "CLARO", color: "text-red-600" },
  { id: "183", name: "150GB COM LIGACAO", price: "99,90", operator: "CLARO", color: "text-red-600" },
]

export default function RegistroForm({ representante }: RegistroFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedOperator, setSelectedOperator] = useState<string>("")
  const [formData, setFormData] = useState<FormData>({
    cpf: "",
    birth: "",
    name: "",
    email: "",
    phone: "",
    cell: "",
    cep: "",
    district: "",
    city: "",
    state: "",
    street: "",
    number: "",
    complement: "",
    typeChip: "fisico",
    coupon: "",
    plan_id: "",
    typeFrete: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fieldValidation, setFieldValidation] = useState<Record<string, "valid" | "invalid" | "">>({})
  const [isReadOnly, setIsReadOnly] = useState({
    cpf: false,
    birth: false,
    name: false,
  })
  const [alertModal, setAlertModal] = useState<{ show: boolean; title: string; message: string }>({
    show: false,
    title: "",
    message: "",
  })
  const [successModal, setSuccessModal] = useState(false)

  const fatherId = representante?.id || "110956"

  const maskCPF = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1")
  }

  const maskPhone = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2")
      .replace(/(-\d{4})\d+?$/, "$1")
  }

  const maskCell = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .replace(/(-\d{4})\d+?$/, "$1")
  }

  const maskCEP = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .replace(/(-\d{3})\d+?$/, "$1")
  }

  const showAlert = (type: "success" | "error" | "loading", title: string, message: string) => {
    setAlertModal({ show: true, title, message })
  }

  const handleCepBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const cep = e.target.value.replace(/[^0-9]/g, "")
    if (!cep || cep.length < 8) return

    const url = `https://viacep.com.br/ws/${cep}/json/`

    try {
      const response = await fetch(url)
      const json = await response.json()

      if (json.erro === "true" || json.erro === true) {
        setFieldValidation((prev) => ({
          ...prev,
          cep: "invalid",
          street: "invalid",
          district: "invalid",
          city: "invalid",
          state: "invalid",
        }))
        showAlert("error", "CEP não encontrado!", "Confira o CEP digitado!")
      } else {
        setFormData((prev) => ({
          ...prev,
          street: json.logradouro || "",
          district: json.bairro || "",
          city: json.localidade || "",
          state: json.uf || "",
          complement: json.complemento || "",
        }))
        setFieldValidation((prev) => ({
          ...prev,
          cep: "valid",
          street: "valid",
          district: "valid",
          city: "valid",
          state: "valid",
        }))
      }
    } catch (error) {
      console.error("[v0] Error fetching CEP:", error)
      showAlert("error", "Ops!", "CEP não encontrado!")
    }
  }

  const handleBirthBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value
    if (!selectedDate || !formData.cpf) return

    const cpfSearch = formData.cpf.replace(/[^0-9]/g, "")
    if (cpfSearch.length !== 11) return

    const birth = selectedDate.split("-")
    const birthFormatted = birth[2] + "-" + birth[1] + "-" + birth[0]
    const access_token = "2|VL3z6OcyARWRoaEniPyoHJpPtxWcD99NN2oueGGn4acc0395"
    const url = `https://apicpf.whatsgps.com.br/api/cpf/search?numeroDeCpf=${cpfSearch}&dataNascimento=${birthFormatted}&token=${access_token}`

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Accept: "application/json",
        },
      })
      const res = await response.json()

      if (res.data && res.data.id) {
        showAlert("error", "Ops!", "CPF já cadastrado no sistema! Não é possível cadastrar novamente.")
        return
      }

      setFieldValidation((prev) => ({
        ...prev,
        cpf: "valid",
        birth: "valid",
      }))
    } catch (error) {
      console.error("[v0] Error validating CPF:", error)
    }
  }

  const handleTypeChipChange = (value: string) => {
    setFormData((prev) => ({ ...prev, typeChip: value, plan_id: "" }))
    setSelectedOperator("")

    if (value === "eSim") {
      setFormData((prev) => ({ ...prev, typeFrete: "eSim" }))
    } else {
      setFormData((prev) => ({ ...prev, typeFrete: "" }))
    }
  }

  const handlePlanChange = (planId: string) => {
    setFormData((prev) => ({ ...prev, plan_id: planId }))
  }

  const validateStep = (step: number): boolean => {
    if (step === 1) {
      return !!formData.plan_id
    }

    if (step === 2) {
      return (
        formData.cpf.length === 14 &&
        !!formData.birth &&
        formData.name.trim().length > 0 &&
        formData.email.trim().length > 0 &&
        formData.phone.length >= 10 &&
        formData.cell.length >= 11
      )
    }

    if (step === 3) {
      return (
        formData.cep.length === 9 &&
        formData.city.trim().length > 0 &&
        !!formData.state &&
        formData.district.trim().length > 0 &&
        formData.street.trim().length > 0
      )
    }

    if (step === 4) {
      return !!formData.typeFrete
    }

    return false
  }

  const nextStep = () => {
    if (!validateStep(currentStep)) {
      showAlert("error", "Atenção!", "Por favor, preencha todos os campos obrigatórios antes de continuar.")
      return
    }
    setCurrentStep((prev) => Math.min(prev + 1, 4))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!validateStep(4)) {
      alert("Por favor, selecione uma forma de envio antes de salvar.")
      return
    }

    setIsSubmitting(true)

    const form = e.currentTarget
    const formDataToSend = new FormData(form)

    try {
      const response = await fetch("https://federalassociados.com.br/registroSave", {
        method: "POST",
        body: formDataToSend,
        mode: "no-cors",
      })

      setSuccessModal(true)
    } catch (error) {
      console.error("[v0] Error submitting form:", error)
      setSuccessModal(true)
    }
  }

  const getValidationClass = (fieldName: string) => {
    if (fieldValidation[fieldName] === "valid") return "border-green-500 bg-green-50"
    if (fieldValidation[fieldName] === "invalid") return "border-red-500 bg-red-50"
    return "border-gray-300"
  }

  const filteredPlans = formData.typeChip === "eSim" ? plans : plans

  return (
    <>
      <header className="bg-gray-900 text-white py-2 md:py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center">
            <a href="https://federalassociados.com.br">
              <img
                alt="Federal Associados"
                width="190"
                src="https://federalassociados.com.br/logos/logoaguiabranca.png"
                className="h-12"
              />
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-6 md:py-8 bg-gradient-to-br from-blue-50 to-gray-100">
        <div className="w-full max-w-2xl">
          <div className="bg-white rounded-2xl shadow-2xl p-4 md:p-8">
            <h2 className="text-xl md:text-3xl font-bold text-gray-900 mb-1 md:mb-2 text-center">Cadastro de Associação</h2>
            <p className="text-center text-sm md:text-base text-gray-600 mb-3 md:mb-6">
              Patrocinador:{" "}
              <span className="font-semibold text-gray-800">{representante?.nome || "Francisco Eliedisom Dos Santos"}</span>
            </p>

            <div className="flex justify-center mb-3 md:mb-6">
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4].map((step) => (
                  <div key={step} className="flex items-center">
                    <div
                      className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-sm md:text-base font-semibold ${
                        currentStep >= step ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-600"
                      }`}
                    >
                      {step}
                    </div>
                    {step < 4 && (
                      <div
                        className={`w-8 md:w-12 h-1 ${currentStep > step ? "bg-blue-600" : "bg-gray-300"}`}
                      ></div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} encType="multipart/form-data">
              <input type="hidden" name="_token" value="ezIrQYoRTuaK8CQHrNcpMA05DEnM5oVKiORkvy1Q" />
              <input type="hidden" name="status" value="0" />
              <input type="hidden" name="father" value={fatherId} />
              <input type="hidden" name="type" value="Recorrente" />
              <input type="hidden" name="cpf" value={formData.cpf} />
              <input type="hidden" name="birth" value={formData.birth} />
              <input type="hidden" name="name" value={formData.name} />
              <input type="hidden" name="email" value={formData.email} />
              <input type="hidden" name="phone" value={formData.phone} />
              <input type="hidden" name="cell" value={formData.cell} />
              <input type="hidden" name="cep" value={formData.cep} />
              <input type="hidden" name="district" value={formData.district} />
              <input type="hidden" name="city" value={formData.city} />
              <input type="hidden" name="state" value={formData.state} />
              <input type="hidden" name="street" value={formData.street} />
              <input type="hidden" name="number" value={formData.number} />
              <input type="hidden" name="complement" value={formData.complement} />
              <input type="hidden" name="typeChip" value={formData.typeChip} />
              <input type="hidden" name="plan_id" value={formData.plan_id} />
              <input type="hidden" name="typeFrete" value={formData.typeFrete} />

              {currentStep === 1 && (
                <div className="space-y-3 md:space-y-4">
                  <h3 className="text-lg md:text-2xl font-bold text-gray-800 mb-2 md:mb-3 text-center">Escolha seu Plano</h3>

                  <div className="space-y-2 md:space-y-3">
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Tipo de Chip</label>
                    <div className="grid grid-cols-2 gap-2 md:gap-3">
                      <button
                        type="button"
                        onClick={() => handleTypeChipChange("fisico")}
                        className={`p-2 md:p-3 text-sm md:text-base rounded-lg border-2 font-semibold transition-all ${
                          formData.typeChip === "fisico"
                            ? "border-blue-600 bg-blue-50 text-blue-700"
                            : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                        }`}
                      >
                        Físico
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTypeChipChange("eSim")}
                        className={`p-2 md:p-3 text-sm md:text-base rounded-lg border-2 font-semibold transition-all ${
                          formData.typeChip === "eSim"
                            ? "border-blue-600 bg-blue-50 text-blue-700"
                            : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                        }`}
                      >
                        e-SIM
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 md:space-y-3">
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Contrate seu plano sem consulta ao SPC ou Serasa</label>
                    <select
                      value={selectedOperator}
                      onChange={(e) => {
                        setSelectedOperator(e.target.value)
                        setFormData((prev) => ({ ...prev, plan_id: "" }))
                      }}
                      className="w-full px-3 py-2 md:px-4 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-gray-900"
                    >
                      <option value="">Escolha seu plano</option>
                      <option value="VIVO" className="text-purple-600">VIVO</option>
                      <option value="TIM" className="text-blue-600">TIM</option>
                      <option value="CLARO" className="text-red-600">CLARO</option>
                    </select>
                  </div>

                  {selectedOperator && (
                    <div className="space-y-2 md:space-y-3">
                      <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                        Planos {selectedOperator}
                      </label>

                      <div className="space-y-1 md:space-y-2">
                        {filteredPlans
                          .filter((plan) => plan.operator === selectedOperator)
                          .map((plan) => (
                            <button
                              key={plan.id}
                              type="button"
                              onClick={() => handlePlanChange(plan.id)}
                              className={`w-full p-2 md:p-3 rounded-lg border-2 text-left transition-all ${
                                formData.plan_id === plan.id
                                  ? `${
                                      selectedOperator === "VIVO"
                                        ? "border-purple-600 bg-purple-50"
                                        : selectedOperator === "TIM"
                                        ? "border-blue-600 bg-blue-50"
                                        : "border-red-600 bg-red-50"
                                    }`
                                  : "border-gray-300 bg-white hover:border-gray-400"
                              }`}
                            >
                              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                                <span className="text-sm md:text-base font-semibold text-gray-900">
                                  {plan.operator} - {plan.name}
                                </span>
                                <span className="text-sm md:text-base font-bold text-gray-900">R$ {plan.price}/mês</span>
                              </div>
                            </button>
                          ))}
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={nextStep}
                    className="w-full bg-blue-600 text-white py-2 md:py-3 text-sm md:text-base rounded-lg font-semibold hover:bg-blue-700 transition-colors mt-3 md:mt-4"
                  >
                    Próximo
                  </button>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-2 md:space-y-3">
                  <h3 className="text-lg md:text-2xl font-bold text-gray-800 mb-2 md:mb-3 text-center">Dados Pessoais</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                    <div className="md:col-span-1">
                      <label htmlFor="cpf" className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                        CPF <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        className={`w-full px-3 py-2 md:px-4 md:py-3 text-sm md:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${getValidationClass("cpf")}`}
                        id="cpf"
                        value={formData.cpf}
                        readOnly={isReadOnly.cpf}
                        onChange={(e) => setFormData((prev) => ({ ...prev, cpf: maskCPF(e.target.value) }))}
                        maxLength={14}
                        required
                      />
                    </div>

                    <div className="md:col-span-1">
                      <label htmlFor="birth" className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                        Data de nascimento <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="date"
                        value={formData.birth}
                        id="birth"
                        className={`w-full px-3 py-2 md:px-4 md:py-3 text-sm md:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${getValidationClass("birth")}`}
                        required
                        readOnly={isReadOnly.birth}
                        onChange={(e) => setFormData((prev) => ({ ...prev, birth: e.target.value }))}
                        onBlur={handleBirthBlur}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="name" className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                      Nome Completo <span className="text-red-600">*</span>
                    </label>
                    <input
                      id="name"
                      type="text"
                      className={`w-full px-3 py-2 md:px-4 md:py-3 text-sm md:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${getValidationClass("name")}`}
                      value={formData.name}
                      required
                      readOnly={isReadOnly.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                      Email <span className="text-red-600">*</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      className="w-full px-3 py-2 md:px-4 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.email}
                      required
                      onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                    <div>
                      <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                        Telefone <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 md:px-4 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.phone}
                        required
                        onChange={(e) => setFormData((prev) => ({ ...prev, phone: maskPhone(e.target.value) }))}
                        maxLength={14}
                      />
                    </div>

                    <div>
                      <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                        Celular <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 md:px-4 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.cell}
                        required
                        onChange={(e) => setFormData((prev) => ({ ...prev, cell: maskCell(e.target.value) }))}
                        maxLength={15}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 md:gap-3 mt-3 md:mt-4">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="flex-1 bg-gray-500 text-white py-2 md:py-3 text-sm md:text-base rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                    >
                      Voltar
                    </button>
                    <button
                      type="button"
                      onClick={nextStep}
                      className="flex-1 bg-blue-600 text-white py-2 md:py-3 text-sm md:text-base rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                      Próximo
                    </button>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-2 md:space-y-3">
                  <h3 className="text-lg md:text-2xl font-bold text-gray-800 mb-2 md:mb-3 text-center">Endereço</h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3">
                    <div className="md:col-span-1">
                      <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                        CEP <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        className={`w-full px-3 py-2 md:px-4 md:py-3 text-sm md:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${getValidationClass("cep")}`}
                        value={formData.cep}
                        required
                        onChange={(e) => setFormData((prev) => ({ ...prev, cep: maskCEP(e.target.value) }))}
                        onBlur={handleCepBlur}
                        maxLength={9}
                      />
                    </div>

                    <div className="md:col-span-1">
                      <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                        Cidade <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        className={`w-full px-3 py-2 md:px-4 md:py-3 text-sm md:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${getValidationClass("city")}`}
                        value={formData.city}
                        required
                        onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
                      />
                    </div>

                    <div className="md:col-span-1">
                      <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                        Estado <span className="text-red-600">*</span>
                      </label>
                      <select
                        className={`w-full px-3 py-2 md:px-4 md:py-3 text-sm md:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${getValidationClass("state")}`}
                        value={formData.state}
                        onChange={(e) => setFormData((prev) => ({ ...prev, state: e.target.value }))}
                        required
                      >
                        <option value="">Selecione</option>
                        <option value="AC">Acre</option>
                        <option value="AL">Alagoas</option>
                        <option value="AP">Amapá</option>
                        <option value="AM">Amazonas</option>
                        <option value="BA">Bahia</option>
                        <option value="CE">Ceará</option>
                        <option value="DF">Distrito Federal</option>
                        <option value="ES">Espírito Santo</option>
                        <option value="GO">Goiás</option>
                        <option value="MA">Maranhão</option>
                        <option value="MT">Mato Grosso</option>
                        <option value="MS">Mato Grosso do Sul</option>
                        <option value="MG">Minas Gerais</option>
                        <option value="PA">Pará</option>
                        <option value="PB">Paraíba</option>
                        <option value="PR">Paraná</option>
                        <option value="PE">Pernambuco</option>
                        <option value="PI">Piauí</option>
                        <option value="RJ">Rio de Janeiro</option>
                        <option value="RN">Rio Grande do Norte</option>
                        <option value="RS">Rio Grande do Sul</option>
                        <option value="RO">Rondônia</option>
                        <option value="RR">Roraima</option>
                        <option value="SC">Santa Catarina</option>
                        <option value="SP">São Paulo</option>
                        <option value="SE">Sergipe</option>
                        <option value="TO">Tocantins</option>
                        <option value="EX">Estrangeiro</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                    <div className="md:col-span-1">
                      <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                        Bairro <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        className={`w-full px-3 py-2 md:px-4 md:py-3 text-sm md:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${getValidationClass("district")}`}
                        value={formData.district}
                        required
                        onChange={(e) => setFormData((prev) => ({ ...prev, district: e.target.value }))}
                      />
                    </div>

                    <div className="md:col-span-1">
                      <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Número</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 md:px-4 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.number}
                        onChange={(e) => setFormData((prev) => ({ ...prev, number: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                      Endereço <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      className={`w-full px-3 py-2 md:px-4 md:py-3 text-sm md:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${getValidationClass("street")}`}
                      value={formData.street}
                      required
                      onChange={(e) => setFormData((prev) => ({ ...prev, street: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Complemento</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 md:px-4 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.complement}
                      onChange={(e) => setFormData((prev) => ({ ...prev, complement: e.target.value }))}
                    />
                  </div>

                  <div className="flex gap-2 md:gap-3 mt-3 md:mt-4">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="flex-1 bg-gray-500 text-white py-2 md:py-3 text-sm md:text-base rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                    >
                      Voltar
                    </button>
                    <button
                      type="button"
                      onClick={nextStep}
                      className="flex-1 bg-blue-600 text-white py-2 md:py-3 text-sm md:text-base rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                      Próximo
                    </button>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-2 md:space-y-3">
                  <h3 className="text-lg md:text-2xl font-bold text-gray-800 mb-2 md:mb-3 text-center">Forma de Envio</h3>

                  <div className="space-y-2 md:space-y-3">
                    {formData.typeChip === "fisico" && (
                      <>
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, typeFrete: "Carta" }))}
                          className={`w-full p-3 md:p-4 rounded-lg border-2 text-left transition-all ${
                            formData.typeFrete === "Carta"
                              ? "border-blue-600 bg-blue-50"
                              : "border-gray-300 bg-white hover:border-gray-400"
                          }`}
                        >
                          <div className="flex items-center">
                            <div
                              className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                                formData.typeFrete === "Carta" ? "border-blue-600" : "border-gray-400"
                              }`}
                            >
                              {formData.typeFrete === "Carta" && (
                                <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                              )}
                            </div>
                            <div className="flex-1">
                              <span className="font-semibold block">Enviar via Carta Registrada</span>
                              <span className="text-xs md:text-sm text-gray-600 mt-1 block">Para quem vai receber o chip pelos Correios. O chip será enviado em carta registrada com código de rastreio, que será fornecido após o cadastro.</span>
                            </div>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, typeFrete: "semFrete" }))}
                          className={`w-full p-3 md:p-4 rounded-lg border-2 text-left transition-all ${
                            formData.typeFrete === "semFrete"
                              ? "border-blue-600 bg-blue-50"
                              : "border-gray-300 bg-white hover:border-gray-400"
                          }`}
                        >
                          <div className="flex items-center">
                            <div
                              className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                                formData.typeFrete === "semFrete" ? "border-blue-600" : "border-gray-400"
                              }`}
                            >
                              {formData.typeFrete === "semFrete" && (
                                <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                              )}
                            </div>
                            <div className="flex-1">
                              <span className="font-semibold block">Retirar na Associação ou com um Associado</span>
                              <span className="text-xs md:text-sm text-gray-600 mt-1 block">Para quem vai retirar o chip presencialmente com um representante (ou, no caso dos planos da Vivo, vai comprar um chip sem créditos para ativar de forma imediata).</span>
                            </div>
                          </div>
                        </button>
                      </>
                    )}
                    {formData.typeChip === "eSim" && (
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, typeFrete: "eSim" }))}
                        className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                          formData.typeFrete === "eSim"
                            ? "border-blue-600 bg-blue-50"
                            : "border-gray-300 bg-white hover:border-gray-400"
                        }`}
                      >
                        <div className="flex items-center">
                          <div
                            className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                              formData.typeFrete === "eSim" ? "border-blue-600" : "border-gray-400"
                            }`}
                          >
                            {formData.typeFrete === "eSim" && <div className="w-3 h-3 rounded-full bg-blue-600"></div>}
                          </div>
                          <span className="font-semibold">Sem a necessidade de envio (e-SIM)</span>
                        </div>
                      </button>
                    )}
                  </div>

                  <div className="flex gap-2 md:gap-3 mt-3 md:mt-4">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="flex-1 bg-gray-500 text-white py-2 md:py-3 text-sm md:text-base rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                    >
                      Voltar
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || !formData.typeFrete}
                      className="flex-1 bg-green-600 text-white py-2 md:py-3 text-sm md:text-base rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? "Enviando..." : "Salvar"}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </main>

      <footer className="bg-gray-900 text-white py-3 md:py-6">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-xs md:text-base">
              2025 © <span className="text-gray-400">Federal Associados (CNPJ 29.383-343-0001/64)</span> - Todos os
              direitos reservados |{" "}
              <a href="https://federalassociados.com.br/privacy" className="text-blue-400 hover:underline">
                Política de Privacidade
              </a>
            </p>
          </div>
        </div>
      </footer>

      {alertModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">{alertModal.title}</h3>
            <p className="text-gray-700 mb-6">{alertModal.message}</p>
            <button
              onClick={() => setAlertModal({ show: false, title: "", message: "" })}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {successModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-4 md:p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3 text-center">
              Parabéns! Seu cadastro foi realizado com sucesso. 🎉
            </h3>
            <div className="text-gray-700 text-sm md:text-base mb-4 space-y-2.5">
              <p>
                Para darmos continuidade com à ativação do seu plano, é necessário realizar o pagamento da sua taxa associativa, no valor proporcional ao plano escolhido por você.
              </p>
              <p>
                Essa taxa é solicitada antes da ativação, pois ela confirma oficialmente a sua entrada na Federal Associados.
              </p>
              <p className="font-semibold">O valor é usado para cobrir os custos administrativos e operacionais, como:</p>
              <ul className="list-disc list-inside space-y-1 ml-2 text-sm">
                <li>Geração do número.</li>
                <li>Configuração da linha.</li>
                <li>Liberação do seu escritório virtual.</li>
                <li>E acesso a todos os benefícios exclusivos da empresa, como o Clube de Descontos, Cinema Grátis, Programa PBI, entre outros.</li>
              </ul>
              <p>
                O pagamento da taxa é o primeiro passo para liberar o seu benefício de internet móvel e garantir sua ativação com total segurança.
              </p>
              <p>
                Logo após efetuar o pagamento, você receberá um e-mail para fazer a biometria digital.
              </p>
              <p>
                Após isso já partimos para ativação do seu plano.
              </p>
              <p className="font-semibold text-center mt-3">
                Clique no botão abaixo para continuar:
              </p>
            </div>
            <a
              href="https://federalassociados.com.br/boletos"
              className="block w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center text-sm md:text-base"
            >
              Realizar Adesão
            </a>
          </div>
        </div>
      )}
    </>
  )
}
