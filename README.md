# SoloRPG Detective

Jogo de narrativa investigativa estilo Agatha Christie e Sherlock Holmes. A IA narra um caso de mistério; você é o detetive que investiga, interroga suspeitos e descobre pistas para identificar o **criminoso**, a **arma** e o **motivo**.

## Como funciona

- **Narrativa pura**: Sem dados, atributos ou rolagens. Apenas decisões narrativas.
- **Investigação**: Explore cenários, interrogue suspeitos, examine evidências.
- **Voz de Prisão**: Quando tiver uma teoria, use a sidebar para dar voz de prisão (suspeito, arma, motivo).
- **3 tentativas**: Você tem no máximo 3 acusações erradas antes do criminoso escapar.
- **Vitória**: Acertar criminoso, arma e motivo encerra o caso com sucesso.

## Como rodar

```bash
cd SoloRPG-Detective
npm install
npm run dev
```

## Banco de dados

Usa `solo-rpg-detective-db` (IndexedDB) — separado do SoloRPG original.
