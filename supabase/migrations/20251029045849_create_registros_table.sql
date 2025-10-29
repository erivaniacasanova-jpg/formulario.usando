/*
  # Criar tabela de registros de associados

  1. Nova Tabela
    - `registros`
      - `id` (uuid, primary key)
      - `cpf` (text, unique, not null) - CPF do associado
      - `birth` (date, not null) - Data de nascimento
      - `name` (text, not null) - Nome completo
      - `email` (text, not null) - Email
      - `phone` (text, not null) - Telefone
      - `cell` (text, not null) - Celular
      - `cep` (text, not null) - CEP
      - `district` (text, not null) - Bairro
      - `city` (text, not null) - Cidade
      - `state` (text, not null) - Estado
      - `street` (text, not null) - Rua
      - `number` (text) - Número
      - `complement` (text) - Complemento
      - `type_chip` (text, not null) - Tipo do chip (fisico/eSim)
      - `plan_id` (text, not null) - ID do plano escolhido
      - `type_frete` (text, not null) - Tipo de frete
      - `father_id` (text, not null) - ID do representante
      - `status` (text, default '0') - Status do cadastro
      - `created_at` (timestamptz, default now()) - Data de criação

  2. Segurança
    - Enable RLS na tabela `registros`
    - Adicionar política para permitir INSERT público (para novos cadastros)
    - Adicionar política para SELECT público (para verificar CPF duplicado)
*/

-- Criar tabela de registros
CREATE TABLE IF NOT EXISTS registros (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cpf text UNIQUE NOT NULL,
  birth date NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  cell text NOT NULL,
  cep text NOT NULL,
  district text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  street text NOT NULL,
  number text DEFAULT '',
  complement text DEFAULT '',
  type_chip text NOT NULL,
  plan_id text NOT NULL,
  type_frete text NOT NULL,
  father_id text NOT NULL,
  status text DEFAULT '0',
  created_at timestamptz DEFAULT now()
);

-- Criar índice no CPF para buscas rápidas
CREATE INDEX IF NOT EXISTS idx_registros_cpf ON registros(cpf);

-- Enable RLS
ALTER TABLE registros ENABLE ROW LEVEL SECURITY;

-- Política para permitir INSERT público (novos cadastros)
CREATE POLICY "Permitir inserção pública de novos cadastros"
  ON registros
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Política para permitir SELECT público (verificar CPF duplicado)
CREATE POLICY "Permitir consulta pública de CPFs"
  ON registros
  FOR SELECT
  TO anon
  USING (true);
