/**
 * Pre-written onboarding tutorial content - no AI required.
 * Simple murder mystery: Lord Blackwood, the butler did it.
 */

export const ONBOARDING_CAMPAIGN_ID = 'onboarding-tutorial';

export interface OnboardingContent {
  opening: string;
  secret: { criminal: string; weapon: string; motive: string };
  scriptedResponses: Array<{
    keywords: string[];
    response: string;
    suggestedActions?: Array<{ id: string; label: string; action: string }>;
  }>;
  hint: string;
}

const CONTENT_EN: OnboardingContent = {
  opening: `The grand manor of Blackwood Hall has seen better days. Lord Edmund Blackwood lies dead in his study, discovered this morning by the butler. The police have cordoned off the scene, but they've called you in—a renowned detective known for solving the impossible.

The family has gathered in the drawing room: Lady Blackwood, pale and composed; the heir, Robert, nervously pacing; the secretary, Miss Hartley, clutching her handkerchief; and the groundskeeper, old Mr. Graves, standing by the window. Each has an alibi. Each has a motive. And somewhere in this house, the truth waits to be uncovered.

You examine the body. Lord Blackwood was struck from behind. The weapon is missing. The study shows signs of a struggle—an overturned chair, scattered papers. Outside, the rain continues to fall, as it has for three days.

What do you do?`,
  secret: {
    criminal: 'the butler',
    weapon: 'fireplace poker',
    motive: 'blackmail - Lord Blackwood had discovered his past',
  },
  scriptedResponses: [
    {
      keywords: ['examine', 'study', 'room', 'scene', 'crime'],
      response: `You enter the study. Lord Blackwood's body has been removed, but the scene remains. An overturned chair. Scattered papers. A bookshelf knocked askew. You notice something: the fireplace poker stand is empty. The poker itself is missing—could it be the weapon?

The desk holds correspondence. Nothing obvious. But the empty poker stand nags at you.`,
      suggestedActions: [
        { id: '1', label: 'Question the butler', action: 'I want to question the butler who found the body.' },
        { id: '2', label: 'Question Lady Blackwood', action: 'I question Lady Blackwood about her husband.' },
        { id: '3', label: 'Make an arrest', action: 'I am ready to make my accusation.' },
      ],
    },
    {
      keywords: ['butler', 'question', 'interrogate', 'found', 'discovered'],
      response: `The butler, a man in his fifties named Higgins, is nervous. His hands tremble as he speaks. "I found his lordship at eight o'clock, sir. I brought his morning tea and... there he was."

You press him. His alibi: he was in the servants' quarters until 7:45. But the kitchen staff say they didn't see him between 7:30 and 8. A gap. And when you mention Lord Blackwood's recent interest in old employment records, Higgins goes pale. "I have nothing to hide," he says too quickly.`,
      suggestedActions: [
        { id: '1', label: 'Examine the study', action: 'I examine the crime scene in the study.' },
        { id: '2', label: 'Question Lady Blackwood', action: 'I question Lady Blackwood.' },
        { id: '3', label: 'Make an arrest', action: 'I am ready to make my accusation.' },
      ],
    },
    {
      keywords: ['lady', 'blackwood', 'wife', 'question'],
      response: `Lady Blackwood sits with perfect posture. "My husband and I had our differences," she admits. "But I was in my room all morning. The maid can confirm."

She seems cold, almost relieved. She mentions the inheritance—Robert will get the estate. She will get the London townhouse. "The butler has been acting strangely lately," she adds. "Edmund was looking into something about the staff."`,
      suggestedActions: [
        { id: '1', label: 'Examine the study', action: 'I examine the study.' },
        { id: '2', label: 'Question the butler', action: 'I question the butler.' },
        { id: '3', label: 'Make an arrest', action: 'I am ready to make my accusation.' },
      ],
    },
    {
      keywords: ['robert', 'heir', 'son', 'question'],
      response: `Robert, the heir, paces. "I was in the garden. The gardener saw me. I had no reason to kill my father—I inherit everything anyway."

He seems genuine. Anxious, but not guilty. He mentions his father had been "digging into old skeletons" lately. "Something about the butler's past. Father was going to dismiss him."`,
      suggestedActions: [
        { id: '1', label: 'Question the butler', action: 'I question the butler.' },
        { id: '2', label: 'Examine the study', action: 'I examine the study.' },
        { id: '3', label: 'Make an arrest', action: 'I am ready to make my accusation.' },
      ],
    },
    {
      keywords: ['arrest', 'accusation', 'accuse', 'culprit', 'accusar', 'prender'],
      response: `You've gathered your clues. When you're ready to name the culprit, open the sidebar (menu icon) and click "Voice Your Accusation." You'll need to identify the criminal, the weapon, and the motive.

In this tutorial, the solution is: the butler, the fireplace poker, and blackmail. Good luck!`,
      suggestedActions: [
        { id: '1', label: 'Open sidebar and arrest', action: 'I open the sidebar to make my arrest.' },
      ],
    },
  ],
  hint: 'Use the suggested action buttons, or type what you want to do (e.g. "examine the study", "question the butler"). When ready, open the sidebar and make your accusation.',
};

const CONTENT_PT: OnboardingContent = {
  opening: `A mansão Blackwood Hall já viu dias melhores. Lord Edmund Blackwood está morto em seu estudo, descoberto esta manhã pelo mordomo. A polícia isolou a cena, mas chamou você—um detetive renomado conhecido por resolver o impossível.

A família se reuniu na sala de estar: Lady Blackwood, pálida e composta; o herdeiro Robert, andando nervosamente; a secretária Miss Hartley, segurando seu lenço; e o jardineiro, o velho Sr. Graves, à janela. Cada um tem um álibi. Cada um tem um motivo. E em algum lugar desta casa, a verdade espera ser descoberta.

Você examina o corpo. Lord Blackwood foi atingido por trás. A arma está desaparecida. O estudo mostra sinais de luta—uma cadeira tombada, papéis espalhados. Lá fora, a chuva continua caindo há três dias.

O que você faz?`,
  secret: {
    criminal: 'o mordomo',
    weapon: 'atiçador de lareira',
    motive: 'chantagem - Lord Blackwood havia descoberto seu passado',
  },
  scriptedResponses: [
    {
      keywords: ['examinar', 'estudo', 'sala', 'cena', 'crime', 'examine'],
      response: `Você entra no estudo. O corpo de Lord Blackwood foi removido, mas a cena permanece. Uma cadeira tombada. Papéis espalhados. Uma estante desalinhada. Você nota algo: o suporte do atiçador de lareira está vazio. O atiçador sumiu—seria a arma?

A escrivaninha tem correspondências. Nada óbvio. Mas o suporte vazio não sai da sua cabeça.`,
      suggestedActions: [
        { id: '1', label: 'Interrogar o mordomo', action: 'Quero interrogar o mordomo que encontrou o corpo.' },
        { id: '2', label: 'Interrogar Lady Blackwood', action: 'Interrogo Lady Blackwood sobre o marido.' },
        { id: '3', label: 'Fazer acusação', action: 'Estou pronto para fazer minha acusação.' },
      ],
    },
    {
      keywords: ['mordomo', 'interrogar', 'questionar', 'encontrou', 'descobriu', 'butler'],
      response: `O mordomo, um homem de cinquenta anos chamado Higgins, está nervoso. Suas mãos tremem ao falar. "Encontrei o lorde às oito da manhã, senhor. Trouxe o chá e... lá estava ele."

Você o pressiona. Seu álibi: estava nos aposentos dos criados até 7h45. Mas a equipe da cozinha diz que não o viram entre 7h30 e 8h. Uma lacuna. E quando você menciona o interesse recente de Lord Blackwood em registros antigos de funcionários, Higgins fica pálido. "Não tenho nada a esconder," diz rápido demais.`,
      suggestedActions: [
        { id: '1', label: 'Examinar o estudo', action: 'Examino a cena do crime no estudo.' },
        { id: '2', label: 'Interrogar Lady Blackwood', action: 'Interrogo Lady Blackwood.' },
        { id: '3', label: 'Fazer acusação', action: 'Estou pronto para fazer minha acusação.' },
      ],
    },
    {
      keywords: ['lady', 'blackwood', 'esposa', 'mulher', 'question'],
      response: `Lady Blackwood senta com postura perfeita. "Meu marido e eu tínhamos nossas diferenças," admite. "Mas eu estava no meu quarto a manhã toda. A criada pode confirmar."

Ela parece fria, quase aliviada. Menciona a herança—Robert ficará com a propriedade. Ela ficará com a casa em Londres. "O mordomo tem agido estranho ultimamente," acrescenta. "Edmund estava investigando algo sobre a equipe."`,
      suggestedActions: [
        { id: '1', label: 'Examinar o estudo', action: 'Examino o estudo.' },
        { id: '2', label: 'Interrogar o mordomo', action: 'Interrogo o mordomo.' },
        { id: '3', label: 'Fazer acusação', action: 'Estou pronto para fazer minha acusação.' },
      ],
    },
    {
      keywords: ['robert', 'herdeiro', 'filho', 'question'],
      response: `Robert, o herdeiro, anda de um lado para o outro. "Eu estava no jardim. O jardineiro me viu. Não tinha motivo para matar meu pai—herdo tudo de qualquer forma."

Ele parece genuíno. Ansioso, mas não culpado. Menciona que o pai estava "revolvendo esqueletos antigos" ultimamente. "Algo sobre o passado do mordomo. O pai ia demiti-lo."`,
      suggestedActions: [
        { id: '1', label: 'Interrogar o mordomo', action: 'Interrogo o mordomo.' },
        { id: '2', label: 'Examinar o estudo', action: 'Examino o estudo.' },
        { id: '3', label: 'Fazer acusação', action: 'Estou pronto para fazer minha acusação.' },
      ],
    },
    {
      keywords: ['acusação', 'acusar', 'prender', 'culpado', 'arrest', 'accusation'],
      response: `Você reuniu suas pistas. Quando estiver pronto para nomear o culpado, abra a barra lateral (ícone de menu) e clique em "Fazer Acusação". Você precisará identificar o criminoso, a arma e o motivo.

Neste tutorial, a solução é: o mordomo, o atiçador de lareira e chantagem. Boa sorte!`,
      suggestedActions: [
        { id: '1', label: 'Abrir barra e acusar', action: 'Abro a barra lateral para fazer minha acusação.' },
      ],
    },
  ],
  hint: 'Use os botões de ação sugerida ou digite o que quer fazer (ex: "examinar o estudo", "interrogar o mordomo"). Quando pronto, abra a barra lateral e faça sua acusação.',
};

const CONTENT_ES: OnboardingContent = {
  opening: `La gran mansión de Blackwood Hall ha visto mejores días. Lord Edmund Blackwood yace muerto en su estudio, descubierto esta mañana por el mayordomo. La policía ha acordonado la escena, pero te han llamado a ti—un detective renombrado conocido por resolver lo imposible.

La familia se ha reunido en el salón: Lady Blackwood, pálida y compuesta; el heredero Robert, caminando nerviosamente; la secretaria Miss Hartley, agarrando su pañuelo; y el jardinero, el viejo Sr. Graves, junto a la ventana. Cada uno tiene una coartada. Cada uno tiene un motivo. Y en algún lugar de esta casa, la verdad espera ser descubierta.

Examinas el cuerpo. Lord Blackwood fue golpeado por detrás. El arma ha desaparecido. El estudio muestra signos de lucha—una silla volcada, papeles dispersos. Afuera, la lluvia sigue cayendo, como lleva tres días.

¿Qué haces?`,
  secret: {
    criminal: 'el mayordomo',
    weapon: 'atizador de chimenea',
    motive: 'chantaje - Lord Blackwood había descubierto su pasado',
  },
  scriptedResponses: [
    {
      keywords: ['examinar', 'estudio', 'sala', 'escena', 'crimen', 'examine'],
      response: `Entras al estudio. El cuerpo de Lord Blackwood ha sido removido, pero la escena permanece. Una silla volcada. Papeles dispersos. Una estantería desordenada. Notas algo: el soporte del atizador de chimenea está vacío. El atizador ha desaparecido—¿será el arma?

El escritorio tiene correspondencia. Nada obvio. Pero el soporte vacío no deja de molestarte.`,
      suggestedActions: [
        { id: '1', label: 'Interrogar al mayordomo', action: 'Quiero interrogar al mayordomo que encontró el cuerpo.' },
        { id: '2', label: 'Interrogar a Lady Blackwood', action: 'Interrogo a Lady Blackwood sobre su marido.' },
        { id: '3', label: 'Hacer acusación', action: 'Estoy listo para hacer mi acusación.' },
      ],
    },
    {
      keywords: ['mayordomo', 'interrogar', 'preguntar', 'encontró', 'descubrió', 'butler'],
      response: `El mayordomo, un hombre de cincuenta años llamado Higgins, está nervioso. Sus manos tiemblan al hablar. "Encontré a su señoría a las ocho, señor. Le traje el té y... ahí estaba."

Lo presionas. Su coartada: estaba en los aposentos del servicio hasta las 7:45. Pero el personal de cocina dice que no lo vieron entre las 7:30 y las 8. Una brecha. Y cuando mencionas el interés reciente de Lord Blackwood en registros antiguos de empleados, Higgins palidece. "No tengo nada que ocultar," dice demasiado rápido.`,
      suggestedActions: [
        { id: '1', label: 'Examinar el estudio', action: 'Examino la escena del crimen en el estudio.' },
        { id: '2', label: 'Interrogar a Lady Blackwood', action: 'Interrogo a Lady Blackwood.' },
        { id: '3', label: 'Hacer acusación', action: 'Estoy listo para hacer mi acusación.' },
      ],
    },
    {
      keywords: ['lady', 'blackwood', 'esposa', 'mujer', 'question'],
      response: `Lady Blackwood se sienta con postura perfecta. "Mi marido y yo teníamos nuestras diferencias," admite. "Pero estuve en mi habitación toda la mañana. La doncella puede confirmarlo."

Parece fría, casi aliviada. Menciona la herencia—Robert obtendrá la propiedad. Ella obtendrá la casa en Londres. "El mayordomo ha estado actuando extraño últimamente," añade. "Edmund estaba investigando algo sobre el personal."`,
      suggestedActions: [
        { id: '1', label: 'Examinar el estudio', action: 'Examino el estudio.' },
        { id: '2', label: 'Interrogar al mayordomo', action: 'Interrogo al mayordomo.' },
        { id: '3', label: 'Hacer acusación', action: 'Estoy listo para hacer mi acusación.' },
      ],
    },
    {
      keywords: ['robert', 'heredero', 'hijo', 'question'],
      response: `Robert, el heredero, camina de un lado a otro. "Estaba en el jardín. El jardinero me vio. No tenía motivo para matar a mi padre—heredo todo de todos modos."

Parece genuino. Ansioso, pero no culpable. Menciona que su padre había estado "revolviendo esqueletos viejos" últimamente. "Algo sobre el pasado del mayordomo. Padre iba a despedirlo."`,
      suggestedActions: [
        { id: '1', label: 'Interrogar al mayordomo', action: 'Interrogo al mayordomo.' },
        { id: '2', label: 'Examinar el estudio', action: 'Examino el estudio.' },
        { id: '3', label: 'Hacer acusación', action: 'Estoy listo para hacer mi acusación.' },
      ],
    },
    {
      keywords: ['acusación', 'acusar', 'arrestar', 'culpable', 'arrest', 'accusation'],
      response: `Has reunido tus pistas. Cuando estés listo para nombrar al culpable, abre la barra lateral (icono de menú) y haz clic en "Hacer Acusación". Necesitarás identificar al criminal, el arma y el motivo.

En este tutorial, la solución es: el mayordomo, el atizador de chimenea y chantaje. ¡Buena suerte!`,
      suggestedActions: [
        { id: '1', label: 'Abrir barra y acusar', action: 'Abro la barra lateral para hacer mi acusación.' },
      ],
    },
  ],
  hint: 'Usa los botones de acción sugerida o escribe lo que quieres hacer (ej: "examinar el estudio", "interrogar al mayordomo"). Cuando estés listo, abre la barra lateral y haz tu acusación.',
};

export function getOnboardingContent(language: string): OnboardingContent {
  if (language === 'pt') return CONTENT_PT;
  if (language === 'es') return CONTENT_ES;
  return CONTENT_EN;
}

/**
 * Match user message to scripted response by keywords
 */
export function getScriptedResponse(content: string, language: string): { response: string; suggestedActions?: Array<{ id: string; label: string; action: string }> } | null {
  const data = getOnboardingContent(language);
  const lower = content.toLowerCase().trim();

  for (const script of data.scriptedResponses) {
    const matchCount = script.keywords.filter(kw => lower.includes(kw.toLowerCase())).length;
    if (matchCount > 0) {
      return {
        response: script.response,
        suggestedActions: script.suggestedActions,
      };
    }
  }

  return null;
}

/**
 * Get fallback response when user input doesn't match any script
 */
export function getOnboardingFallbackResponse(language: string): string {
  const data = getOnboardingContent(language);
  return data.hint;
}
