import { createServer } from 'node:http';

export default async (req, res) => {
  const { app } = await import('../public/server/server.mjs');
  return app(req, res);
};