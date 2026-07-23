import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

export const fetchMetrics = async () => {
  const response = await axios.get(`${API_BASE}/metrics`);
  return response.data;
};

export const fetchDockerContainers = async () => {
  const response = await axios.get(`${API_BASE}/docker`);
  return response.data;
};

export const fetchServices = async () => {
  const response = await axios.get(`${API_BASE}/services`);
  return response.data;
};

export const fetchDeployments = async () => {
  const response = await axios.get(`${API_BASE}/deployments`);
  return response.data;
};

export const fetchAlerts = async () => {
  const response = await axios.get(`${API_BASE}/alerts`);
  return response.data;
};
