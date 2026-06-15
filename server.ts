import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 5000;

app.use(express.json());

// Initialize GoogleGenAI server-side with high safety
let ai: GoogleGenAI | null = null;
const apiKey = process.env.GEMINI_API_KEY;

if (apiKey) {
  try {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
    console.log("Gemini API initialized successfully server-side.");
  } catch (err) {
    console.error("Error initializing Gemini API:", err);
  }
} else {
  console.warn("GEMINI_API_KEY not found in environment variables. Running in simulation fallback mode.");
}

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// AI Agent Endpoint
app.post("/api/gemini/agent", async (req, res) => {
  const { agentType, tenantName, tenantData, userInput } = req.body;

  if (!agentType || !tenantName) {
    return res.status(400).json({ error: "Missing required parameters: agentType or tenantName" });
  }

  // Define role instructions based on agent type
  let systemInstruction = "";
  if (agentType === "social_media") {
    systemInstruction = `Você é o Agente Social Media sênior da Nexora Pulse, especialista em tráfego orgânico, Instagram, Reels, TikTok, hashtags estratégicas e SEO social.
Sua missão é gerar conteúdo altamente viral e focado em engajamento.
Seu cliente atual é: "${tenantName}".
Dados Contextuais do Cliente: ${JSON.stringify(tenantData)}.
Forneça sempre respostas estruturadas em Markdown, ricas, inspiradoras, profissionais e em português do Brasil. Proponha títulos cativantes, ganchos (hooks) de 3 segundos para vídeos e hashtags inteligentes.`;
  } else if (agentType === "copywriter") {
    systemInstruction = `Você é o Agente Copywriter de alta conversão da Nexora Pulse, expert em técnicas AIDA, PAS, anúncios patrocinados (Meta, Google, TikTok Ads) e copies de vendas matadoras.
Seu cliente atual é: "${tenantName}".
Dados Contextuais do Cliente: ${JSON.stringify(tenantData)}.
Forneça copies impactantes em Markdown em português do Brasil, incluindo gatilhos mentais poderosos, chamadas para ação (CTAs) irresistíveis e sugestões para designs de criativos visuais.`;
  } else if (agentType === "analyst") {
    systemInstruction = `Você é o Agente Analista de Inteligência e Performance da Nexora Pulse. Sua habilidade é triturar números, identificar gargalos históricos, tendências de mercado e diagnosticar a saúde das contas de tráfego orgânico e pago.
Seu cliente atual é: "${tenantName}".
Dados Contextuais do Cliente: ${JSON.stringify(tenantData)}.
Com base nesses dados de performance (como ROI, ROAS, leads, CAC, conversão), dê um diagnóstico realista e ultra profissional em formato Markdown. Aponte 3 tendências de mercado para o nicho de forma analítica em português.`;
  } else if (agentType === "traffic_manager") {
    systemInstruction = `Você é o Agente Gestor de Tráfego Automático (Media Buyer Enterprise) da Nexora Pulse. Você domina distribuição de verba em tráfego pago (Meta Ads, Google Ads e TikTok Ads), otimização de pixels e lances em leilões de anúncios digitais.
Seu cliente atual é: "${tenantName}".
Dados Contextuais do Cliente: ${JSON.stringify(tenantData)}.
Forneça orientações de orçamento em Markdown em português do Brasil. Recomende a melhor distribuição de verba entre Google, Meta e TikTok. Sugira melhorias para otimizar o Pixel e indique como calibrar anúncios saturados.`;
  } else {
    systemInstruction = `Você é um Agente de Marketing Autônomo da Nexora Pulse especialista em crescimento acelerado. Cliente: ${tenantName}. responda em português.`;
  }

  try {
    if (ai) {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: userInput || "Gere uma sugestão estratégica rápida para otimizar meus resultados este mês.",
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.75,
        },
      });

      const text = response.text || "Desculpe, o agente não conseguiu formular uma resposta no momento.";
      return res.json({ result: text });
    } else {
      // Fallback response for testing if Gemini API key isn't provided
      return simulateFallbackAgent(agentType, tenantName, tenantData, userInput, res);
    }
  } catch (error: any) {
    console.error("Gemini API call failed:", error);
    return res.status(500).json({
      error: "Ocorreu um erro ao processar a requisição com a Inteligência Artificial.",
      details: error.message || error,
      simulated: true,
      result: getSimulationPrompt(agentType, tenantName, tenantData, userInput)
    });
  }
});

// Simulated Response Generator
function simulateFallbackAgent(agentType: string, tenantName: string, tenantData: any, userInput: string, res: any) {
  const result = getSimulationPrompt(agentType, tenantName, tenantData, userInput);
  return res.json({
    result: result,
    note: "Resposta gerada via motor de simulação analítica Nexora Pulse (Modo Demonstration Autônomo)."
  });
}

function getSimulationPrompt(agentType: string, tenantName: string, tenantData: any, userInput: string): string {
  const followers = tenantData?.followers || "12.4k";
  const conversionRate = tenantData?.conversionRate || "2.4%";
  const leads = tenantData?.leads || "1,240";
  const roas = tenantData?.roas || "3.8x";

  if (agentType === "social_media") {
    return `### ⚡ Nexora Pulse - Plano de Conteúdo Orgânico Recomendado para **${tenantName}**

Com base nos seus **${followers} seguidores**, criamos esse cronograma estratégico:

1. **Reels Viral (Engajamento)**
   * **Gancho de 3s**: "O segredo oculto que seu mercado esconde para faturar mais..."
   * **Conteúdo**: Revelar brevemente um processo facilitado pelo uso de automação.
   * **CTA**: "Comente 'PULSE' abaixo e receba no Direct o passo a passo completo automático!"
   * **Hashtags**: \`#${tenantName.replace(/\s+/g, '')} #tráfegoorgânico #marketingdeconteudo #socialmedia2026 #ia\`

2. **Carrossel Educacional (Autoridade)**
   * **Slide 1**: Como aumentar sua conversão orgânica atual de ${conversionRate} do seu público.
   * **Slide 2**: Identificar os principais canais onde sua audiência passa mais tempo.
   * **Slide 3**: Otimizar a biografia do seu perfil com Link de Chatbot ativo.
   * **CTA**: "Salve esse post para estruturar seu marketing orgânico!"

*Sugestão de SEO Social*: Use as palavras-chaves 'automação de vendas', 'funil inteligente', e 'growth hacking' na legenda para otimizar o rankeamento nativo da plataforma.`;
  }

  if (agentType === "copywriter") {
    return `### ✍️ Nexora Pulse - Copy de Anúncio de Alta Performance (**${tenantName}**)

Criamos 2 opções persuasivas sob medida para atingir seu público-alvo:

#### Opção A - Foco em Dor & Resolução (Passagem Direta - PAS)
* **Título**: Cansado de queimar verba em anúncios que não vendem?  
* **Texto Principal**: Enquanto você tenta gerenciar campanhas manualmente, seus concorrentes usam inteligência preditiva para atrair clientes prontos para comprar. Chega de suposições. Com a nossa estrutura exclusiva para o nicho de **${tenantName}**, nós transformamos cliques em faturamento de forma automática.  
* **Chamada para Ação (CTA)**: [Saiba Mais] - Toque no botão e inicie suas automações integradas hoje mesmo!  
* **Dica de Criativo**: Vídeo de 15 segundos exibindo um gráfico verde subindo em tempo real e a logo brilhando.

#### Opção B - Foco em Escala & Facilidade (AIDA)
* **Título**: Como escalamos as vendas de **${tenantName}** para um ROAS de **${roas}** de forma guiada pela IA?  
* **Texto Principal**: Descubra a plataforma SaaS omnichannel com IA integrada nativa que gerencia múltiplos canais, automatiza funis inteiros e fecha conversações com chatbots de alta fidelidade sem que você precise mexer em código.  
* **CTA**: [Quero Escalar Meu Negócio]`;
  }

  if (agentType === "analyst") {
    return `### 📊 Nexora Pulse - Relatório de Inteligência & Tendências para **${tenantName}**

Análise de Métricas Gerais:
* **Taxa de Conversão**: ${conversionRate} (Ideal seria aumentar para 3.5%)
* **Captura de Leads**: ${leads} leads qualificados ativos
* **ROAS Alcançado**: ${roas} de retorno sobre investimento em ads

#### 🔮 3 Tendências Críticas de Mercado para seu Nicho:
1. **Vídeos de Lo-Fi e Bastidores Humanizados**: O público está saturado de anúncios hiper-produzidos. O formato do tipo "gravado com celular sem filtro" tem gerado maior taxa de retenção (+23% no Instagram Reels).
2. **Chatbots Híbridos Dinâmicos**: Leads buscam resposta imediata. Empresas que respondem o WhatsApp em menos de 1 minuto registram um aumento imediato de até 40% em agendamentos de propostas.
3. **Hiper-personalização por Canal**: Segmentar campanhas por interesse ultra nichado no Meta Ads, em vez de público geral, reduziu o CAC médio em cerca de 18% neste trimestre.`;
  }

  return `### 🎯 Nexora Pulse - Recomendação Estratégica de Alocação de Orçamento para **${tenantName}**

Com seu ROAS atual estabelecido em **${roas}**, sugerimos a seguinte otimização de verba:

#### 💼 Divisão Sugerida de Verba Mensal (Mix Omnichannel)
* **Meta Ads (Instagram & Facebook)**: **50% do orçamento** - Ideal para conversão direta, campanhas de mensagens para WhatsApp e geração de desejo visual (Reels patrocinados).
* **Google Ads (Pesquisa & YouTube)**: **35% do orçamento** - Direcionado para capturar a intenção imediata de compra de palavras-chaves de alta intenção comercial.
* **TikTok Ads**: **15% do orçamento** - Foco em branding juvenil, criativos rápidos e conquista de público topo de funil a baixo custo.

#### ⚙️ Calibragem do Pixel e Remarketing:
* Ative a **API de conversão avançada** para reter mais eventos do iOS 14+.
* Crie um público personalizado de 180 dias engajados com o perfil do Instagram e rode um anúncio do tipo 'Oferta Irresistível de Segunda Chance' com 20% do orçamento total reservado para remarketing.`;
}

// Vite and static asset configuration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite middleware mounted in development mode.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving static production assets from Dist folder.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Nexora Pulse server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
