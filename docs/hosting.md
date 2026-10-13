# Low-Cost Hosting for the Node + React Showcase

Options for hosting this app (Express API plus the React build served from `public/`) cheaply, for a demo or learning showcase.

> Pricing and free tiers change often, and some free tiers have limits such as sleeping apps or expiring databases. Check each provider's pricing page before committing. This list was written from general knowledge and the links were not re-verified.

## What the app needs

- Node.js 18+ running `npm start` (`node server.js`); it reads `PORT` from the environment.
- The React build in `public/` (run `npm --prefix client run build` first; see [react-gui-guide.md](./react-gui-guide.md)).
- A PostgreSQL database (the app uses `pg`; see [database.md](./database.md)).
- Environment variables, never committed: `JWT_SECRET`, database connection settings, and optionally `CORS_ORIGIN` (see [configuration.md](./configuration.md)). Set these in the host's dashboard.

Because Express serves the React build, you deploy one service, so no CORS setup is needed.

## Recommendations

### 1. Render (easiest for a showcase)

- Link: <https://render.com>
- Pricing: <https://render.com/pricing>
- Free web service and a free Postgres tier. The free web service sleeps after inactivity (the first request is slow), and the free database has historically expired after a limited period.
- Deploys directly from a GitHub repo. Build command: `npm install && npm --prefix client install && npm --prefix client run build`. Start command: `npm start`.
- Best when you want the least setup and a public URL fast.

### 2. Railway

- Link: <https://railway.com>
- Pricing: <https://railway.com/pricing>
- Small trial credit and then low usage-based pricing (a few dollars a month for a small app). Postgres is added as a one-click plugin, and its connection variables are injected into your service.
- Good developer experience and no sleeping on paid usage.

### 3. Fly.io

- Link: <https://fly.io>
- Docs: <https://fly.io/docs/js/>
- Pay-as-you-go with small machines costing a few dollars a month or less. Includes managed Postgres options. Uses a CLI (`fly launch`, `fly deploy`) and a Dockerfile or auto-detected Node app.
- Slightly more setup, but good for learning real deployment.

### 4. DigitalOcean App Platform or a Droplet

- Link: <https://www.digitalocean.com/products/app-platform>
- Droplets: <https://www.digitalocean.com/pricing/droplets>
- App Platform has a static-site free tier, but a Node service is a paid tier (a few dollars a month) and a managed database costs extra. A basic Droplet (about $4–6/month) with Postgres installed on it is the cheapest paid all-in-one, but you maintain the server yourself (Node, nginx, PM2, updates).
- Choose this if you want to learn Linux server basics.

### 5. Split hosting: Vercel or Netlify (React) + Neon or Supabase (database)

- Vercel: <https://vercel.com> | Netlify: <https://www.netlify.com>
- Neon (serverless Postgres): <https://neon.tech> | Supabase: <https://supabase.com>
- Generous free tiers. This requires changing the architecture: the React app is deployed as a static site on its own, the API must be hosted separately (or rewritten as serverless functions), and you must set `CORS_ORIGIN` to the front-end URL and point the React `fetch` calls at the API's full URL.
- Neon or Supabase can also serve as the free Postgres for any option above if the host's own database is not free.
- Good for showcasing React alone, but more moving parts than the single-service options.

## AWS-based options (matches the repo name)

- **AWS Lightsail**: <https://aws.amazon.com/lightsail/>. Fixed low monthly price (about $5) for a small server, which you can combine with a Lightsail managed database.
- **AWS Lambda + API Gateway + RDS/Neon**: <https://aws.amazon.com/lambda/>. Cheap at low traffic and fits the "serverless" theme, but needs a Lambda adapter such as `serverless-http` and more setup than the options above.

## Quick comparison

| Option | Setup effort | Typical cost | Notes |
|--------|--------------|--------------|-------|
| Render | Lowest | Free to ~$7/mo | Free tier sleeps |
| Railway | Low | Trial, then a few $/mo | Postgres plugin |
| Fly.io | Medium | A few $/mo | CLI-driven |
| DigitalOcean Droplet | Medium–High | ~$4–6/mo | You manage the server |
| Vercel/Netlify + Neon | Medium | Free tiers | Split front end and API |
| AWS Lightsail | Medium | ~$5/mo | Fits the AWS theme |

## Recommendation

For a Node and React basics showcase, start with **Render** (or **Railway**): connect the GitHub repo, add a Postgres instance, set the environment variables, and share the URL. Move to Fly.io or a Droplet later if you want to learn more about deployment.

## Before you deploy

- Set `NODE_ENV=production` and a strong `JWT_SECRET`.
- Set database connection variables from the host's dashboard.
- Build the React app before starting the server (put it in the host's build command).
- Confirm `PORT` is read from the environment (it is, in [server.js](../server.js)).
- Test `/health` on the public URL (see [using-curl.md](./using-curl.md)).
- Keep demo data disposable: free databases can be reset or expire.
