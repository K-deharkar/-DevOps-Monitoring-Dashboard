require('dotenv').config();
console.log("DB URL:", process.env.DATABASE_URL);
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const { seedMockData, generateDynamicMetrics } = require('./services/mockData');

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.get('/api/metrics', async (req, res) => {
  try {
    const metrics = await prisma.serverMetric.findMany({
      orderBy: { timestamp: 'desc' },
      take: 20
    });
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

app.get('/api/docker', async (req, res) => {
  try {
    const containers = await prisma.dockerContainer.findMany();
    res.json(containers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch docker containers' });
  }
});

app.get('/api/services', async (req, res) => {
  try {
    const services = await prisma.service.findMany();
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

app.get('/api/deployments', async (req, res) => {
  try {
    const deployments = await prisma.deployment.findMany({
      orderBy: { deployedAt: 'desc' },
      take: 10
    });
    res.json(deployments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch deployments' });
  }
});

app.get('/api/alerts', async (req, res) => {
  try {
    const alerts = await prisma.alert.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// Initialize server and seed mock data
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await seedMockData(prisma);
  
  // Start generating dynamic metrics every 5 seconds
  setInterval(() => generateDynamicMetrics(prisma), 5000);
});
