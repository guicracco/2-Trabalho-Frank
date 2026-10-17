export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const cidade = url.searchParams.get("cidade") || "Curitiba";

  if (!env.OPENWEATHER_API_KEY) {
    return Response.json({ erro: "Chave da API não configurada" }, { status: 500 });
  }

  const api = new URL("https://api.openweathermap.org/data/2.5/weather");
  api.searchParams.set("q", cidade);
  api.searchParams.set("units", "metric");
  api.searchParams.set("lang", "pt_br");
  api.searchParams.set("appid", env.OPENWEATHER_API_KEY);

  const resposta = await fetch(api);

  if (!resposta.ok) {
    return Response.json(
      { erro: "Não foi possível obter o clima" },
      { status: resposta.status }
    );
  }

  const dados = await resposta.json();

  return Response.json({
    cidade: dados.name,
    temperatura: dados.main.temp,
    sensacao: dados.main.feels_like,
    umidade: dados.main.humidity,
    descricao: dados.weather[0].description,
    icone: dados.weather[0].icon
  });
}
