/* ============================================================
   CONFIGURAÇÃO DA LOJA — edite só este arquivo para mudar
   telefone, WhatsApp, endereço, e-mail e link do Mercado Livre.
   ============================================================ */
window.SITE = {
  nome: "Goiânia Plásticos",
  slogan: "Tudo para tapeceiro",

  // WhatsApp: só números, com 55 + DDD + número
  whatsapp: "5562995513306",
  whatsappExibir: "(62) 99551-3306",

  telefone: "(62) 3271-2133",
  email: "contato@goianiaplasticos.com.br",
  mercadoLivre: "https://goianiaplasticos.mercadoshops.com.br/",

  endereco: {
    linha1: "Avenida Anhanguera, 10155",
    complemento: "Quadra 01, Lote 20",
    bairro: "Bairro dos Rodoviários",
    cidade: "Goiânia", uf: "GO", cep: "74430-030"
  },

  horario: "Segunda a sexta, 8h às 18h · Sábado, 8h às 12h",   // ex.: "Segunda a sexta, 8h às 18h · Sábado, 8h às 12h". Vazio = não aparece no site.

  // true = mostra a etiqueta "a confirmar" ao lado dos dados ainda não validados.
  // Troque para false quando a loja confirmar tudo.
  mostrarPendencias: true,
  pendente: { endereco: false, horario: false }
};
