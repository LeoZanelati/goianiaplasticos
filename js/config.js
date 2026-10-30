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

  mapaLink: "https://maps.app.goo.gl/xE5QYmmc9DdV8J2EA",   // link do Google Maps da loja

  mapaEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3822.158815816883!2d-49.306139425297594!3d-16.6689342841009!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x935ef414374890ef%3A0xf81a663277c3b239!2zR29pw6JuaWEgUGzDoXN0aWNvcw!5e0!3m2!1sen!2sbr!4v1793384304240!5m2!1sen!2sbr",   // mapa incorporado (Google Maps > Compartilhar > Incorporar)

  horario: "Segunda a sexta, 8h às 18h · Sábado, 8h às 12h",   // ex.: "Segunda a sexta, 8h às 18h · Sábado, 8h às 12h". Vazio = não aparece no site.

  // true = mostra a etiqueta "a confirmar" ao lado dos dados ainda não validados.
  // Troque para false quando a loja confirmar tudo.
  mostrarPendencias: true,
  pendente: { endereco: false, horario: false }
};
