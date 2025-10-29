import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface RegistroData {
  cpf: string
  birth: string
  name: string
  email: string
  phone: string
  cell: string
  cep: string
  district: string
  city: string
  state: string
  street: string
  number: string
  complement: string
  type_chip: string
  plan_id: string
  type_frete: string
  father_id: string
  status: string
}

export async function checkCpfExists(cpf: string): Promise<boolean> {
  const cpfNumeros = cpf.replace(/\D/g, '')

  const { data, error } = await supabase
    .from('registros')
    .select('id')
    .eq('cpf', cpfNumeros)
    .maybeSingle()

  if (error) {
    console.error('Erro ao verificar CPF:', error)
    return false
  }

  return data !== null
}

export async function insertRegistro(registro: RegistroData) {
  const cpfNumeros = registro.cpf.replace(/\D/g, '')

  const { data, error } = await supabase
    .from('registros')
    .insert({
      cpf: cpfNumeros,
      birth: registro.birth,
      name: registro.name,
      email: registro.email,
      phone: registro.phone,
      cell: registro.cell,
      cep: registro.cep,
      district: registro.district,
      city: registro.city,
      state: registro.state,
      street: registro.street,
      number: registro.number,
      complement: registro.complement,
      type_chip: registro.type_chip,
      plan_id: registro.plan_id,
      type_frete: registro.type_frete,
      father_id: registro.father_id,
      status: registro.status,
    })
    .select()

  if (error) {
    console.error('Erro ao inserir registro:', error)
    throw error
  }

  return data
}
