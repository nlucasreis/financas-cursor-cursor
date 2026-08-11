import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_api_KEY,
  dangerouslyAllowBrowser: true,
});

export async function pedirParaOpenAI(promptUsuario: string) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: promptUsuario }],
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error("Erro na chamada da OpenAI:", error);
    return "Erro ao processar a resposta da IA.";
  }
}