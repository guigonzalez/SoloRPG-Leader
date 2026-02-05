# Plano de Simplificação da Lógica de Inventário

> **Status:** Implementado em 2025-02-04

## Situação Atual (Problemas) — ANTES

1. **Duas listas sobrepostas**: `STARTING_ITEMS` e `DROPPABLE_ITEMS` — a segunda inclui a primeira (`...STARTING_ITEMS`) mais itens extras. Conceitualmente confuso.

2. **Mapeamentos dispersos**:
   - `PRESET_ITEM_TAGS` em `inventory.ts` mapeia preset → tags
   - `LEGACY_SYSTEM_TO_PRESET_MAP` em `sheet-presets.ts` mapeia sistema legado → preset
   - `migrateSystemToPreset` precisa ser chamado antes de usar o preset

3. **Duas funções públicas similares**:
   - `getDroppableItemsForPreset(presetId)` — para IA e prompt
   - `getStartingItemsForPreset(presetId)` — para criação de personagem
   - Ambas fazem filtro por tags + uma faz filtro extra por `canBeStarting`

4. **Flag `canBeStarting` espalhada** em cada item — fácil esquecer ao adicionar novos itens.

5. **Ordem de definição**: itens declarados em `STARTING_ITEMS` e depois repetidos/estendidos em `DROPPABLE_ITEMS`.

---

## Objetivo

Uma única fonte de verdade, fluxo linear e nomes claros.

---

## Proposta de Simplificação

### 1. Catálogo único de itens

**Antes:**
```
STARTING_ITEMS = [ ... 13 itens ]
DROPPABLE_ITEMS = [ ...STARTING_ITEMS, ... 11 itens extras ]
```

**Depois:**
```
ITEM_CATALOG = [ ... todos os itens em uma única lista ]
```

Cada item tem:
- `tags: string[]` — obrigatório (ex: `['fantasy', 'generic']`)
- `availability: 'starting' | 'drop-only'` — substitui `canBeStarting`
  - `starting` = pode ser escolhido na criação e dropado na aventura
  - `drop-only` = só dropado durante o jogo (ex: espada mágica, poção maior)

---

### 2. Colocar tags do preset junto do preset

**Antes:** `PRESET_ITEM_TAGS` em `inventory.ts` — desconectado dos presets.

**Depois:** Cada `SheetPreset` em `sheet-presets.ts` ganha:

```ts
itemTags: string[]  // ex: ['fantasy', 'generic']
```

Assim, ao definir um preset, já se define quais tags de itens ele aceita. Um único lugar para entender o preset.

---

### 3. Uma única função pública

**Antes:**
- `getDroppableItemsForPreset(presetId)` 
- `getStartingItemsForPreset(presetId)`

**Depois:**
```ts
getItemsForPreset(presetId: string, options?: { startingOnly?: boolean }): ItemDefinition[]
```

- `startingOnly: false` (padrão) → itens para drops da IA (todos com tag compatível)
- `startingOnly: true` → itens para criação de personagem (tag compatível + availability !== 'drop-only')

Quem chama decide o uso; a lógica fica centralizada.

---

### 4. Resolver preset uma vez

**Antes:** `inventory.ts` importa `migrateSystemToPreset` e chama em cada função.

**Depois:** `getItemsForPreset` recebe o `presetId` já resolvido, ou usa internamente um helper:

```ts
function resolvePresetId(systemOrPresetId: string): string {
  return migrateSystemToPreset(systemOrPresetId);
}
```

A migração fica encapsulada; o restante do código usa sempre IDs de preset.

---

### 5. Estrutura de arquivos sugerida

```
inventory.ts
├── ItemDefinition (com availability em vez de canBeStarting)
├── ITEM_CATALOG (lista única)
├── getItemsForPreset(presetId, { startingOnly? })
├── getItemDefinition(itemId)
├── getItemDisplayName(...)
├── createInventoryItem(...)
└── helpers de efeito (parseItemEffect, etc.)

sheet-presets.ts
├── SheetPreset (com itemTags: string[])
├── SHEET_PRESETS (cada preset com itemTags)
└── migrateSystemToPreset (mantido para compatibilidade)
```

---

## Resumo das mudanças

| Antes | Depois |
|-------|--------|
| STARTING_ITEMS + DROPPABLE_ITEMS | ITEM_CATALOG (único) |
| canBeStarting?: boolean | availability: 'starting' \| 'drop-only' |
| PRESET_ITEM_TAGS em inventory | itemTags em cada SheetPreset |
| getDroppableItemsForPreset | getItemsForPreset(presetId, { startingOnly: false }) |
| getStartingItemsForPreset | getItemsForPreset(presetId, { startingOnly: true }) |

---

## Ordem de implementação sugerida

1. Adicionar `itemTags` em cada preset em `sheet-presets.ts`
2. Criar `ITEM_CATALOG` único e trocar `canBeStarting` por `availability`
3. Implementar `getItemsForPreset` e deprecar as duas funções antigas
4. Atualizar `CharacterCreation`, `prompt-builder` e `useAI` para usar `getItemsForPreset`
5. Remover `STARTING_ITEMS`, `DROPPABLE_ITEMS`, `PRESET_ITEM_TAGS` e as funções antigas
6. Ajustar `getCustomItemDefinitions` para mapear `availability` (custom items default: 'starting')

---

## Benefícios

- **Uma lista** de itens em vez de duas
- **Preset autocontido** — tags de itens junto da definição do preset
- **Uma função** para obter itens por preset
- **Nomes explícitos** — `availability` deixa claro o papel do item
- **Menos acoplamento** — inventory não precisa conhecer o mapa preset→tags separadamente
