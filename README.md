# ETEC Quest

RPG gamificado de estudos para o vestibulinho ETEC. Next.js 15 + TypeScript +
TailwindCSS + Firebase.

## ✅ O que já está funcional neste projeto

- **Autenticação real**: Google e e-mail/senha, com recuperação de senha, via
  Firebase Auth (`src/contexts/AuthContext.tsx`).
- **Modelagem completa de dados** (`src/types/models.ts`): usuários, sessões
  de estudo, matérias, módulos, lições, questões, respostas, conquistas,
  inventário, equipamentos, pets, cidade, fazenda, bosses, dungeons, missões
  diárias/semanais, estatísticas, configurações, notificações, ranking,
  títulos, histórico de XP e de nível.
- **Motor de XP/Nível** (`src/lib/xp/engine.ts`): curva de progressão,
  cálculo de nível a partir do XP total, regras de quanto XP cada ação
  concede, detecção de level-up.
- **Cronômetro de estudo** (`src/hooks/useStudyTimer.ts`): cria sessão no
  Firestore ao iniciar, persiste duração e credita XP automaticamente ao
  encerrar, atualizando o perfil numa transação atômica.
- **Sistema de questões** (`src/hooks/useAnswerQuestion.ts`): corrige
  automaticamente múltipla escolha e V/F, credita XP e atualiza taxa de
  acerto.
- **Conteúdo 100% dinâmico**: matérias, módulos, lições e questões são
  documentos do Firestore criados pelo painel admin — nada hardcoded
  (`src/hooks/useSubjects.ts`, `src/app/(app)/admin/subjects/page.tsx`).
- **Dashboard** com XP, nível, horas estudadas, streak, matérias concluídas,
  questões respondidas e taxa de acertos, com gráfico de Recharts alimentado
  por dados reais das sessões.
- **Página de Dungeons** fiel ao mockup enviado, mas lendo matérias/módulos
  reais do Firestore em vez de conteúdo estático.
- **Regras de segurança** do Firestore (`firestore.rules`).
- **Deploy automático no GitHub Pages** via GitHub Actions
  (`.github/workflows/deploy.yml`) a cada push na branch `main`.

### Sobre Storage e IA (removidos desta versão)

Esta versão **não usa o Firebase Storage** (evita a exigência do plano
Blaze/pago) e **não tem a rota de IA** (o GitHub Pages só serve arquivos
estáticos, sem servidor — rotas de API do Next.js não funcionam lá). Avatares
usam a foto de perfil do Google; ícones de matéria são nomes de ícone, não
arquivos de imagem. Se um dia quiser essas features de volta, hospede o app
em Vercel ou Firebase Hosting (ambos têm servidor) em vez do GitHub Pages.

## 🚧 O que NÃO está incluído (e por quê)

Um RPG completo com cidade e fazenda animadas, pets visuais, bosses com
combate próprio, painel admin com CRUD para *todas* as ~25 coleções e as
demais features de IA é, realisticamente, meses de trabalho de um time — não
algo que caiba em um único projeto gerado de uma vez com qualidade real.

O que foi entregue é a **espinha dorsal funcional**: arquitetura, modelo de
dados, autenticação, motor de XP, persistência de estudo e o padrão de
CRUD dinâmico. Para expandir, siga o mesmo padrão já usado em
`useSubjects.ts` / `admin/subjects/page.tsx` para:

- CRUD de módulos, lições, questões e simulados (a estrutura de hooks já
  existe em `useSubjects.ts` — falta só a UI de cada tela admin).
- Inventário/equipamentos/pets: já modelados em `types/models.ts`; crie hooks
  análogos a `useAnswerQuestion.ts` para equipar/desequipar itens.
- Cidade e fazenda: renderize `CityState`/`FarmState` como um Canvas/SVG que
  reage a `unlockedBuildingIds` / `growthStage` — ambos já calculáveis a
  partir do nível e das horas estudadas.
- Bosses e dungeons: reaproveite `useAnswerQuestion` num "modo boss" que
  puxa o banco de questões do boss.
- Missões diárias/semanais: uma Cloud Function agendada (cron) que gera
  documentos em `dailyQuests`/`weeklyQuests` a partir de `AchievementDefinition`-like
  templates.
- Ranking: Cloud Function agendada recalculando `rankings/{period}` a partir
  de `totalXP`.
- Demais features de IA: réplicas da rota `/api/ai/explain` com prompts
  diferentes (gerar questões, flashcards, resumos, diagnóstico de pontos
  fracos a partir do histórico de respostas).

## 🛠️ Como rodar localmente

```bash
npm install
cp .env.local.example .env.local   # preencha com as credenciais do seu projeto Firebase
npm run dev
```

## 🔥 Configurando o Firebase

1. Crie um projeto em https://console.firebase.google.com
2. Ative **Authentication** → métodos Google e E-mail/senha.
3. Crie um banco **Firestore** (modo produção).
4. Copie as credenciais do app web para `.env.local`.
5. Publique as regras do Firestore **direto pelo Console** (mais simples que
   usar a CLI): Firestore Database → aba **Regras** → cole o conteúdo de
   `firestore.rules` → **Publicar**.
6. Crie manualmente o primeiro usuário admin: registre-se normalmente pelo
   app e depois, no Firestore Console, altere o campo `role` do seu
   documento em `users/{uid}` para `"admin"`.

## 🚀 Deploy no GitHub Pages

1. Renomeie `REPO_NAME` em `next.config.js` para o nome exato do seu
   repositório no GitHub.
2. Crie um repositório no GitHub e suba este projeto (`git init`, `git add .`,
   `git commit`, `git remote add origin ...`, `git push -u origin main`).
3. No repositório, vá em **Settings → Pages → Build and deployment → Source**
   e selecione **GitHub Actions**.
4. Vá em **Settings → Secrets and variables → Actions → New repository
   secret** e cadastre cada uma destas chaves com os valores do seu
   `.env.local`: `NEXT_PUBLIC_FIREBASE_API_KEY`,
   `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`,
   `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, `NEXT_PUBLIC_FIREBASE_APP_ID`.
5. Dê um `git push` na branch `main` — o workflow em
   `.github/workflows/deploy.yml` builda e publica automaticamente. Acompanhe
   em **Actions**. O site fica em
   `https://SEU-USUARIO.github.io/NOME-DO-REPOSITORIO/`.
6. No Firebase Console → Authentication → Settings → **Authorized domains**,
   adicione `SEU-USUARIO.github.io` (senão o login com Google é bloqueado).

## 📁 Estrutura

```
src/
  app/                 # rotas (App Router)
    (app)/              # rotas autenticadas (dashboard, dungeons, admin)
    login, register, forgot-password
  components/
    ui/                 # botão, card, progress bar (estilo shadcn)
    layout/              # Sidebar, Header
    dashboard/, dungeons/
  contexts/AuthContext.tsx
  hooks/               # React Query + regras de negócio (XP, timer, respostas)
  lib/
    firebase/client.ts
    xp/engine.ts        # curva de XP e nível
  schemas/validation.ts # Zod
  types/models.ts       # todas as coleções do Firestore
.github/workflows/deploy.yml  # deploy automático no GitHub Pages
firestore.rules
```
