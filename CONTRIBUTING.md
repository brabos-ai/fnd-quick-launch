# Guia de Contribuição

Obrigado por considerar contribuir com o FND SaaS QuickLaunch! 🎉

Este documento guia você através do processo de contribuição, desde reportar bugs até enviar Pull Requests.

## Código de Conduta

Este projeto e todos os participantes estão sob o [Código de Conduta](CODE_OF_CONDUCT.md). Ao participar, você concorda em manter um ambiente respeitoso e acolhedor para todos.

## Como Posso Contribuir?

### 1. Reportando Bugs 🐛

Se você encontrou um bug, por favor:

1. **Verifique se já foi reportado**: Pesquise nas [issues existentes](https://github.com/xmaiconx/fnd-quick-launch/issues)
2. **Use o template de Bug Report**: Ao criar a issue, preencha todas as seções do formulário
3. **Seja específico**: Inclua passos para reproduzir, comportamento esperado vs. atual, e ambiente

### 2. Sugerindo Funcionalidades ✨

Tem uma ideia para melhorar o QuickLaunch?

1. **Verifique se já foi sugerido**: Pesquise nas [issues existentes](https://github.com/xmaiconx/fnd-quick-launch/issues)
2. **Use o template de Feature Request**: Explique o problema que você quer resolver
3. **Seja claro sobre o valor**: Por que essa funcionalidade é importante?

### 3. Contribuindo com Código 💻

#### Antes de Começar

1. **Fork o repositório** e clone localmente
2. **Configure o ambiente de desenvolvimento** seguindo o [README.md](README.md)
3. **Crie uma branch** a partir da `main`:
   ```bash
   git checkout -b feature/nome-da-funcionalidade
   # ou
   git checkout -b fix/descricao-do-bug
   ```

#### Convenções de Código

**Nomenclatura:**
- Arquivos: `kebab-case` (ex: `user-service.ts`)
- Classes: `PascalCase` (ex: `UserService`)
- Variáveis/Funções: `camelCase` (ex: `getUserById`)
- Constantes: `UPPER_SNAKE_CASE` (ex: `MAX_RETRIES`)

**TypeScript:**
- Sempre use tipos explícitos (evite `any`)
- Prefira interfaces para objetos públicos
- Use tipos utilitários (`Partial`, `Pick`, etc.) quando apropriado

**Organização:**
- Backend: Siga a estrutura NestJS (controllers, services, repositories)
- Frontend: Componentes reutilizáveis em `components/`, páginas em `pages/`
- Shared: Interfaces e tipos em `libs/contracts/`

#### Padrões de Commits

Usamos commits semânticos para manter o histórico organizado:

```
tipo(escopo): descrição curta

Descrição mais detalhada (opcional)

Fixes #123
```

**Tipos:**
- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Mudanças na documentação
- `style`: Formatação, ponto e vírgula, etc. (sem mudança de lógica)
- `refactor`: Refatoração de código
- `perf`: Melhoria de performance
- `test`: Adição ou correção de testes
- `chore`: Mudanças em build, configurações, etc.

**Exemplos:**
```bash
feat(auth): add email verification flow
fix(billing): prevent duplicate subscription charges
docs(readme): update installation instructions
refactor(database): migrate to kysely repository pattern
```

#### Checklist Antes de Enviar PR

- [ ] Código segue os padrões do projeto
- [ ] `npm run typecheck` passa sem erros
- [ ] `npm run lint` passa sem erros
- [ ] `npm run build` funciona corretamente
- [ ] Testei manualmente as mudanças
- [ ] Atualizei a documentação (se necessário)
- [ ] Criei/atualizei migrations (se necessário)

#### Enviando o Pull Request

1. **Push sua branch**:
   ```bash
   git push origin feature/nome-da-funcionalidade
   ```

2. **Abra o PR** no GitHub e preencha o template completamente

3. **Aguarde a revisão**: Um mantenedor revisará seu código e pode solicitar mudanças

4. **Faça ajustes se solicitado**: Adicione commits na mesma branch

5. **Merge**: Quando aprovado, um mantenedor fará o merge

## Guia de Desenvolvimento

### Estrutura do Projeto

```
fnd-quick-launch/
├── apps/
│   ├── server/          # API NestJS
│   ├── web/             # Frontend React
│   ├── admin/           # Dashboard Admin
│   └── site/            # Landing Page
├── libs/
│   ├── contracts/       # Interfaces TypeScript
│   ├── database/        # Migrations e Repositórios
│   └── domain/          # Entidades de domínio
└── .claude/             # Skills FND PRO
```

### Comandos Úteis

```bash
# Desenvolvimento
npm run dev              # Todos os apps
npm run dev:api          # Apenas backend
npm run dev:workers      # Apenas workers

# Qualidade
npm run typecheck        # Verificar tipos
npm run lint             # Verificar estilo
npm run build            # Build completo

# Database
npm run migrate          # Rodar migrations
npm run migrate:rollback # Reverter migration
npm run seed             # Popular dados
```

### Trabalhando com Database

**Criar uma nova migration:**

```bash
cd libs/database
npx knex migrate:make nome_da_migration
```

**Edite o arquivo gerado** em `libs/database/src/migrations/`

**Execute a migration:**

```bash
npm run migrate
```

### Trabalhando com Backend (NestJS)

O backend segue a arquitetura CQRS e injeção de dependência:

```typescript
// 1. Defina a interface (contracts)
export interface IUserService {
  createUser(data: CreateUserDTO): Promise<User>
}

// 2. Implemente o serviço
@Injectable()
export class UserService implements IUserService {
  constructor(
    @Inject(IUserRepository) private userRepo: IUserRepository
  ) {}

  async createUser(data: CreateUserDTO): Promise<User> {
    // implementação
  }
}

// 3. Registre no módulo
@Module({
  providers: [
    { provide: IUserService, useClass: UserService }
  ]
})
```

### Trabalhando com Frontend (React)

**Componentes:**
- Use componentes funcionais com hooks
- Extraia lógica complexa em custom hooks
- Use Shadcn/ui para componentes base

**State Management:**
- TanStack Query para dados do servidor
- Zustand para estado local da aplicação

**Exemplo de hook de API:**

```typescript
import { useQuery } from '@tanstack/react-query'

export function useUser(userId: string) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => api.get(`/users/${userId}`)
  })
}
```

## Segurança

**Nunca inclua:**
- Credenciais, tokens, ou chaves de API
- Arquivos `.env` (sempre use `.env.example`)
- Dados sensíveis de usuários reais

**Reportar vulnerabilidades:**
- Veja [SECURITY.md](SECURITY.md) para detalhes
- **NÃO** abra issues públicas para vulnerabilidades

## Estilo e Boas Práticas

### Backend

✅ **BOM:**
```typescript
// Validação com Zod
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
})

// Dependency Injection
constructor(
  @Inject(IUserService) private userService: IUserService
) {}

// Tratamento de erros específico
throw new UnauthorizedException('Invalid credentials')
```

❌ **EVITE:**
```typescript
// Sem validação
function createUser(data: any) { }

// Acoplamento direto
const userService = new UserService()

// Erros genéricos
throw new Error('Something went wrong')
```

### Frontend

✅ **BOM:**
```typescript
// Componente tipado
interface UserCardProps {
  user: User
  onEdit: (id: string) => void
}

export function UserCard({ user, onEdit }: UserCardProps) {
  return <div>...</div>
}

// Hook personalizado
function useDebounce<T>(value: T, delay: number): T {
  // implementação
}
```

❌ **EVITE:**
```typescript
// Componente sem tipos
export function UserCard({ user, onEdit }) {
  return <div>...</div>
}

// Lógica complexa no componente
function MyComponent() {
  // 200 linhas de lógica aqui...
}
```

## Processo de Revisão

Quando você abre um PR:

1. **CI automático** rodará testes, typecheck e lint
2. **Revisão de código** por um mantenedor
3. **Discussão** se necessário
4. **Aprovação** quando tudo estiver ok
5. **Merge** pelo mantenedor

**Tempo de resposta esperado:** 2-5 dias úteis

## Comunidade

- 💬 **WhatsApp**: [Comunidade FND](https://chat.whatsapp.com/FGvSsWQlMV6DGBL17IWfQr)
- 🐛 **Issues**: [GitHub Issues](https://github.com/xmaiconx/fnd-quick-launch/issues)
- 📖 **Docs**: [README.md](README.md) | [CLAUDE.md](CLAUDE.md)

## Dúvidas?

- Para dúvidas gerais, use o WhatsApp da comunidade
- Para dúvidas sobre uma issue específica, comente na issue
- Para questões sobre o código, abra uma Discussion no GitHub

---

**Obrigado por contribuir com o FND SaaS QuickLaunch!** 🚀

Sua contribuição ajuda empreendedores não-técnicos a construir seus SaaS com qualidade.

<p align="center">
  <strong>Criado com ❤️ pela comunidade FND</strong>
</p>
