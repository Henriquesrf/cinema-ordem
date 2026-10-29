// Cartazes usados somente na interface; o Firestore registra apenas os 5 campos da atividade.
const cartazes: Record<string, string> = {
  "jogos vorazes": "https://upload.wikimedia.org/wikipedia/en/4/42/HungerGamesPoster.jpg",
  "jogos vorazes em chamas": "https://www.impawards.com/2013/posters/hunger_games_catching_fire_ver32_xxlg.jpg",
  "jogos vorazes a esperanca parte 1": "https://upload.wikimedia.org/wikipedia/en/7/78/Hunger_Games_Mockingjay_Part_1_poster.jpg",
  "jogos vorazes a esperanca o final": "https://www.querofilme.com.br/images/posters/t4x/897-jogos-vorazes-a-esperanca-o-final-1.jpg",
  "interestelar": "https://image.tmdb.org/t/p/w342/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
  "oppenheimer": "https://image.tmdb.org/t/p/w342/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
  "duna parte dois": "https://image.tmdb.org/t/p/w342/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
  "parasita": "https://web2-cf-image.cjenm.com/crop/660x950/public/share/metamng/programs/parasite-movie-poster-en-001-03.jpg?v=1677460950",
  "la la land": "https://image.tmdb.org/t/p/w342/uDO8zWDhfWwoFdKS4fzkUJt0Rf0.jpg",
  "barbie": "https://image.tmdb.org/t/p/w342/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg",
};

export function cartazDoFilme(nome: string): string | undefined {
  const normalizado = nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return cartazes[normalizado];
}
