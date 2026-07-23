async function seedMockData(prisma) {
  // Check if data already exists
  const count = await prisma.dockerContainer.count();
  if (count > 0) return; // Already seeded

  console.log("Seeding mock data...");

  await prisma.dockerContainer.createMany({
    data: [
      { name: 'nginx-proxy', image: 'nginx:latest', status: 'running', ports: '80:80, 443:443' },
      { name: 'postgres-db', image: 'postgres:14', status: 'running', ports: '5432:5432' },
      { name: 'redis-cache', image: 'redis:alpine', status: 'running', ports: '6379:6379' },
      { name: 'failed-worker', image: 'node:18', status: 'exited', ports: null },
    ]
  });

  await prisma.service.createMany({
    data: [
      { name: 'Authentication API', status: 'active' },
      { name: 'Payment Gateway', status: 'active' },
      { name: 'Email Notification', status: 'inactive' },
    ]
  });

  await prisma.deployment.createMany({
    data: [
      { projectName: 'Frontend-App', version: 'v1.4.2', status: 'success' },
      { projectName: 'Backend-API', version: 'v2.0.1', status: 'success' },
      { projectName: 'Payment-Worker', version: 'v1.1.0', status: 'failed' },
      { projectName: 'Auth-Service', version: 'v1.0.5', status: 'success' },
    ]
  });

  await prisma.alert.createMany({
    data: [
      { message: 'High CPU usage on worker node 2', severity: 'warning', resolved: false },
      { message: 'Database connection pool nearing limit', severity: 'critical', resolved: false },
      { message: 'Deployment Backend-API v2.0.1 successful', severity: 'info', resolved: true },
    ]
  });

  // Seed initial metrics
  const initialMetrics = [];
  for (let i = 20; i > 0; i--) {
    initialMetrics.push({
      cpuUsage: Math.random() * 40 + 20, // 20-60%
      ramUsage: Math.random() * 30 + 40, // 40-70%
      diskUsage: 65.5,
      timestamp: new Date(Date.now() - i * 5000)
    });
  }
  await prisma.serverMetric.createMany({ data: initialMetrics });
  
  console.log("Mock data seeded successfully.");
}

async function generateDynamicMetrics(prisma) {
  const cpuUsage = Math.random() * 30 + 30; // 30-60%
  const ramUsage = Math.random() * 20 + 50; // 50-70%
  const diskUsage = 65.5 + Math.random() * 0.1;

  await prisma.serverMetric.create({
    data: {
      cpuUsage,
      ramUsage,
      diskUsage,
    }
  });

  // Clean up old metrics to avoid blowing up DB (keep last 50)
  const count = await prisma.serverMetric.count();
  if (count > 50) {
    const oldest = await prisma.serverMetric.findMany({
      orderBy: { timestamp: 'asc' },
      take: count - 50
    });
    
    if (oldest.length > 0) {
       await prisma.serverMetric.deleteMany({
         where: { id: { in: oldest.map(m => m.id) } }
       });
    }
  }
}

module.exports = {
  seedMockData,
  generateDynamicMetrics
};
