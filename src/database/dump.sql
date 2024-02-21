CREATE DATABASE dindin

CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100),
  email VARCHAR(50) UNIQUE,
  senha VARCHAR(100)
);

CREATE TABLE categorias (
  id SERIAL PRIMARY KEY,
  descricao TEXT
);

INSERT INTO categorias (descricao) VALUES
  ('Alimentação'),
  ('Assinaturas e Serviços'),
  ('Casa'),
  ('Mercado'),
  ('Cuidados Pessoais'),
  ('Educação'),
  ('Família'),
  ('Lazer'),
  ('Pets'),
  ('Presentes'),
  ('Roupas'),
  ('Saúde'),
  ('Transporte'),
  ('Salário'),
  ('Vendas'),
  ('Outras receitas'),
  ('Outras despesas');

CREATE TABLE transacoes (
  id SERIAL PRIMARY KEY,
  descricao TEXT,
  valor DECIMAL,
  data DATE,
  categoria_id INTEGER REFERENCES categorias(id),
  usuario_id INTEGER REFERENCES usuarios(id),
  tipo VARCHAR(50)
);