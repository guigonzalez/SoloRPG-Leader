# Plano do Fork: SoloRPG Leader

Fork do SoloRPG Detective para um jogo de **liderança de nação** com decisões sociais e geopolíticas.

## Conceito

- **Jogador**: Líder de uma nação
- **IA**: Apresenta cenários e desafios (não necessariamente sequenciais)
- **Decisões**: Cada ação gera impacto em eixos políticos
- **Avaliação**: O jogador é classificado como social, liberal, esquerda, direita, democrata, ditador, militar, etc.

---

## Eixos Políticos (Impacto por decisão)

| Eixo | Extremo A | Extremo B | Exemplo de decisão |
|------|-----------|-----------|---------------------|
| **Econômico** | Esquerda (intervenção) | Direita (mercado livre) | Nacionalizar indústria vs privatizar |
| **Social** | Conservador | Progressista | Política de imigração, direitos civis |
| **Governo** | Democrata | Ditador | Consultar parlamento vs decreto unilateral |
| **Militar** | Civil/Pacifista | Militarista | Cortar gastos militares vs expandir exército |
| **Diplomático** | Isolacionista | Internacionalista | Sair de alianças vs aprofundar integração |

Cada decisão do jogador altera pontos nesses eixos. A IA narra o cenário e calcula o impacto.

---

## Mapeamento Detective → Leader

| Detective | Leader |
|-----------|--------|
| Campaign | Reign / Mandato |
| Investigation | Governança |
| Arrest (acusar culpado) | **Removido** – substituído por decisões contínuas |
| MysteryAnswer | **Removido** |
| Character (detetive) | Leader (perfil político com eixos) |
| Entity (suspeito, lugar) | Entity (país, organização, figura política) |
| Fact | Fact (tratado, evento, aliança) |
| Case closed | **Removido** – narrativa episódica sem "vitória" única |

---

## Arquivos a Modificar/Criar

### 1. Tipos (`src/types/models.ts`)

```ts
// Novos tipos
export interface PoliticalAxes {
  economic: number;    // -100 (esquerda) a +100 (direita)
  social: number;      // -100 (conservador) a +100 (progressista)
  governance: number;  // -100 (democrata) a +100 (ditador)
  military: number;    // -100 (civil) a +100 (militarista)
  diplomatic: number;  // -100 (isolacionista) a +100 (internacionalista)
}

export interface Leader {
  id: string;
  campaignId: string;
  name: string;
  title?: string;       // "Presidente", "Primeiro-Ministro", etc.
  politicalAxes: PoliticalAxes;
  // ... createdAt, updatedAt
}

export interface DecisionImpact {
  economic?: number;
  social?: number;
  governance?: number;
  military?: number;
  diplomatic?: number;
}
```

### 2. Campaign → Reign

- `Campaign` vira `Reign` ou mantém `Campaign` com campos: `nation`, `era`, `scenario`
- Remover: `solvedAnswer`, `status: solved | failed`
- Adicionar: `scenarioType` (crise econômica, guerra, pandemia, eleição...)

### 3. AI Prompts (`src/services/ai/prompt-builder.ts`)

- Trocar "detective mystery" por "nation leadership simulation"
- A IA apresenta cenários episódicos (crise, evento, decisão)
- Cada resposta da IA pode incluir `<impact>` com deltas nos eixos
- Sugestões de ações: decisões políticas (aprovar lei, declarar guerra, negociar tratado...)

### 4. Remover/Substituir

| Remover | Substituir por |
|---------|----------------|
| ArrestPanel | **LeaderProfilePanel** – mostra eixos políticos |
| mystery-answer-repo | **Remover** |
| arrest-verifier | **decision-impact-parser** – extrai impacto das decisões |
| CaseClosedOverlay | **Remover** ou **ReignSummaryOverlay** (resumo do mandato) |
| Preset campaigns (detective) | Preset scenarios (crise econômica, guerra civil, pandemia...) |

### 5. Novos Presets de Cenário

- Crise econômica
- Guerra civil / conflito interno
- Pandemia / saúde pública
- Eleição / golpe
- Crise migratória
- Desastre natural
- Tensão diplomática / guerra

---

## Fluxo do Jogo

1. Jogador cria/seleciona um **mandato** (reino/campanha)
2. Define nação, era, cenário inicial
3. IA apresenta o primeiro desafio (ex: "Uma greve geral paralisa o país...")
4. Jogador toma decisão (texto livre ou ações sugeridas)
5. IA narra consequências e aplica impacto nos eixos
6. IA apresenta próximo desafio (pode ser relacionado ou novo)
7. Ciclo continua – sem "vitória" definida, foco em narrativa e evolução do perfil

---

## Próximos Passos

1. Criar repositório fork (SoloRPG-Leader)
2. Renomear package.json e ajustar vite base
3. Implementar `PoliticalAxes` e `Leader`
4. Reescrever prompt-builder para liderança
5. Criar LeaderProfilePanel (substituir ArrestPanel)
6. Remover arrest/mystery
7. Adaptar presets e onboarding
8. Traduções (PT, EN, ES)
