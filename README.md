# AI App Platform

A production-ready modular monolith built with Next.js 14, featuring authentication, database management, job queues, and comprehensive testing.

## Features

- 🚀 **Next.js 14** with TypeScript and App Router
- 🔐 **Authentication** with NextAuth (email/password, provider-ready)
- 🗄️ **Database** with PostgreSQL and Prisma ORM
- 🎯 **Job Queue** with BullMQ and Redis
- 🧪 **Testing** with Jest (unit) and Playwright (e2e)
- 🐳 **Docker** support with health checks
- ⚙️ **CI/CD** with GitHub Actions
- 📦 **Monorepo** structure with workspaces

## Architecture

```
├── apps/
│   └── web/                 # Next.js application
├── packages/
│   ├── config/             # Shared configuration
│   ├── db/                 # Database layer (Prisma)
│   └── jobs/               # Job queue system (BullMQ)
├── tests/
│   ├── unit/               # Jest unit tests
│   └── e2e/                # Playwright e2e tests
├── docker-compose.yml      # Development services
├── Dockerfile              # Production container
└── .github/workflows/      # CI/CD pipeline
```

## Prerequisites

- Node.js 20+ (check `.nvmrc`)
- npm 10+
- Docker & Docker Compose (for services)

## Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd ai-app-platform
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Start Services

```bash
# Start PostgreSQL and Redis
docker compose up -d db redis

# Run database migrations
npm run migrate

# Seed with demo data
npm run seed
```

### 4. Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Environment Variables

| Variable          | Description           | Default                  |
| ----------------- | --------------------- | ------------------------ |
| `NODE_ENV`        | Environment           | `development`            |
| `PORT`            | Server port           | `3000`                   |
| `DATABASE_URL`    | PostgreSQL connection | Required                 |
| `REDIS_URL`       | Redis connection      | `redis://localhost:6379` |
| `NEXTAUTH_SECRET` | NextAuth secret key   | Required                 |
| `NEXTAUTH_URL`    | NextAuth base URL     | `http://localhost:3000`  |

## Available Scripts

### Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server

### Database

- `npm run migrate` - Run database migrations
- `npm run seed` - Seed database with demo data
- `npm run generate` - Generate Prisma client

### Testing

- `npm run test` - Run unit tests
- `npm run e2e` - Run e2e tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

### Utilities

- `npm run smoke` - Health check smoke test
- `npm run clean` - Clean build artifacts

## Docker Compose Development

### Full Stack

```bash
# Start all services
docker compose up --build

# View logs
docker compose logs -f web

# Stop services
docker compose down
```

### Services Only

```bash
# Start just PostgreSQL and Redis
docker compose up -d db redis

# Then run the app locally
npm run dev
```

## Testing

### Unit Tests

```bash
# Run all unit tests
npm run test

# Run with coverage
npm run test:coverage --workspace=tests/unit

# Watch mode
npm run test:watch --workspace=tests/unit
```

### E2E Tests

```bash
# Install Playwright browsers (first time)
npm run install-deps --workspace=tests/e2e

# Run e2e tests
npm run e2e

# Run with UI
npm run e2e:ui --workspace=tests/e2e

# Run in headed mode
npm run e2e:headed --workspace=tests/e2e
```

## API Endpoints

### Authentication

- `POST /api/auth/signin` - Sign in
- `POST /api/auth/signout` - Sign out
- `GET /api/auth/session` - Get session

### Projects (Protected)

- `GET /api/projects` - List projects
- `POST /api/projects` - Create project
- `GET /api/projects/[id]` - Get project
- `PUT /api/projects/[id]` - Update project
- `DELETE /api/projects/[id]` - Delete project

### System

- `GET /health` - Health check

## Project Structure

### Apps

- **web**: Next.js application with pages, components, and API routes

### Packages

- **config**: Environment configuration and validation
- **db**: Database schema, migrations, and Prisma client
- **jobs**: Job queue setup, workers, and job definitions

### Tests

- **unit**: Jest tests for models and API routes
- **e2e**: Playwright tests for user workflows

## Development Workflow

1. **Make Changes**: Edit code in relevant workspace
2. **Test Locally**: Run unit tests and lint
3. **E2E Testing**: Test full user workflows
4. **Build Check**: Ensure production build works
5. **Docker Test**: Verify containerized deployment

## Demo Account

For testing, use the seeded demo account:

- **Email**: `demo@example.com`
- **Password**: `demo123`

## Deployment

### Production Build

```bash
npm run build
npm start
```

### Docker Production

```bash
docker build -t ai-app-platform .
docker run -p 3000:3000 ai-app-platform
```

### Environment Variables for Production

Ensure all required environment variables are set:

- Generate a secure `NEXTAUTH_SECRET`
- Configure production `DATABASE_URL`
- Set appropriate `NEXTAUTH_URL`

## Health Monitoring

The application includes health checks at `/health`:

```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "services": {
    "database": "connected",
    "jobQueue": {
      "status": "ready",
      "counts": {
        "waiting": 0,
        "active": 0,
        "completed": 10,
        "failed": 0
      }
    }
  }
}
```

## Troubleshooting

### Common Issues

1. **Database Connection Errors**

   ```bash
   # Check if PostgreSQL is running
   docker compose ps db

   # Restart database
   docker compose restart db
   ```

2. **Redis Connection Errors**

   ```bash
   # Check Redis status
   docker compose ps redis

   # View Redis logs
   docker compose logs redis
   ```

3. **Build Errors**

   ```bash
   # Clean and reinstall
   npm run clean
   rm -rf node_modules
   npm install
   ```

4. **Migration Issues**
   ```bash
   # Reset database (WARNING: destroys data)
   npm run migrate:reset --workspace=packages/db
   ```

### Development Tips

- Use `npm run dev` for hot reloading
- Check logs with `docker compose logs -f`
- Run individual workspace commands with `--workspace=<name>`
- Use `.env.local` for local overrides

## Next Steps: LiteLLM + Langfuse

This foundation is ready for advanced AI features:

### LiteLLM Integration ✅

The platform now includes **LiteLLM integration** for unified access to multiple AI providers:

- **Multi-Provider Support**: Access OpenAI, Anthropic, Google AI, Azure OpenAI, and more through a single interface
- **Cost Tracking**: Automatic cost calculation for supported models
- **Latency Monitoring**: Track response times for performance optimization
- **Request Routing**: Unified API for different model providers
- **Built-in Testing**: Mock service for deterministic testing in CI/CD

#### Quick Start with LiteLLM

1. **Install and Start LiteLLM Server**:

   ```bash
   pip install litellm[proxy]
   litellm --config /path/to/config.yaml
   ```

2. **Configure Provider API Keys**:

   ```bash
   # Copy and edit environment file
   cp .env.example .env

   # Add your provider API keys:
   OPENAI_API_KEY=your-openai-key
   ANTHROPIC_API_KEY=your-anthropic-key
   GOOGLE_API_KEY=your-google-key
   # ... etc
   ```

3. **Test the Integration**:

   ```bash
   # Start the development server
   npm run dev

   # Visit the test page
   open http://localhost:3000/llm-test
   ```

#### Provider Configuration

Add your API keys to `.env` for the providers you want to use:

| Provider         | Environment Variables                                  | Models                            |
| ---------------- | ------------------------------------------------------ | --------------------------------- |
| **OpenAI**       | `OPENAI_API_KEY`                                       | gpt-3.5-turbo, gpt-4, gpt-4-turbo |
| **Anthropic**    | `ANTHROPIC_API_KEY`                                    | claude-3-sonnet, claude-3-haiku   |
| **Google AI**    | `GOOGLE_API_KEY`                                       | gemini-pro, gemini-1.5-pro        |
| **Azure OpenAI** | `AZURE_API_KEY`, `AZURE_API_BASE`, `AZURE_API_VERSION` | Azure-hosted models               |
| **Cohere**       | `COHERE_API_KEY`                                       | command-r, command-r-plus         |
| **Hugging Face** | `HUGGINGFACE_API_KEY`                                  | Various open-source models        |

#### LiteLLM Configuration Example

Create a `litellm_config.yaml` file:

```yaml
model_list:
  - model_name: gpt-3.5-turbo
    litellm_params:
      model: gpt-3.5-turbo
      api_key: os.environ/OPENAI_API_KEY

  - model_name: claude-3-sonnet
    litellm_params:
      model: claude-3-sonnet-20240229
      api_key: os.environ/ANTHROPIC_API_KEY

  - model_name: gemini-pro
    litellm_params:
      model: gemini/gemini-pro
      api_key: os.environ/GOOGLE_API_KEY

general_settings:
  master_key: your-master-key
  database_url: 'postgresql://...' # Optional: for logging
```

Start LiteLLM with the config:

```bash
litellm --config litellm_config.yaml --port 4000
```

#### Testing & Development

The platform includes comprehensive testing support:

- **Mock Gateway**: Deterministic responses for CI/CD pipelines
- **Unit Tests**: Full test coverage for gateway functionality
- **Integration Tests**: End-to-end testing with mock responses
- **Performance Monitoring**: Built-in latency and cost tracking

Test the LLM integration:

```bash
# Run unit tests
npm run test --workspace=packages/gateway

# Test the API endpoint
curl -X POST http://localhost:3000/api/llm \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [{"role": "user", "content": "Hello!"}],
    "temperature": 0.7
  }'

# Check gateway health
curl http://localhost:3000/api/llm
```

### Langfuse Observability

Next features to implement:

- **LLM Monitoring**: Track model performance, costs, and latency
- **Conversation Analytics**: Monitor user interactions and model responses
- **Prompt Management**: Version control and A/B test prompts
- **Quality Metrics**: Measure response quality and user satisfaction

### Implementation Plan

1. **✅ Add LiteLLM package** to handle model orchestration
2. **Integrate Langfuse SDK** for comprehensive observability
3. **Create AI service layer** in packages/ai with proper abstractions
4. **Extend job queue** to handle asynchronous AI workloads
5. **Add AI-specific API routes** for chat, completions, and embeddings
6. **Implement streaming responses** for real-time user experience

The current modular architecture makes these additions straightforward while maintaining clean separation of concerns.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

MIT License - see LICENSE file for details.
