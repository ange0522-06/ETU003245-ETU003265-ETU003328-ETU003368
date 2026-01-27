// API service for fetching reports/points data
const API_BASE_URL = 'http://localhost:8080/api'; // Adjust based on your backend URL

export const apiService = {
  // Fetch all reports/points
  async getReports() {
    try {
      const response = await fetch(`${API_BASE_URL}/reports`);
      if (!response.ok) {
        throw new Error('Failed to fetch reports');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching reports:', error);
      // Return mock data if backend is not available
      return this.getMockReports();
    }
  },

  // Mock data for development
  getMockReports() {
    return [
      {
        id: 1,
        latitude: -18.8792,
        longitude: 47.5079,
        titre: "Route endommagée",
        status: "en cours",
        date: "2026-01-15",
        surface: 20,
        budget: 1000,
        entreprise: "ABC Construction"
      },
      {
        id: 2,
        latitude: -18.9100,
        longitude: 47.5250,
        titre: "Travaux de revêtement",
        status: "nouveau",
        date: "2026-01-20",
        surface: 50,
        budget: 3000,
        entreprise: "XYZ Travaux"
      },
      {
        id: 3,
        latitude: -18.8650,
        longitude: 47.5350,
        titre: "Réparation de pont",
        status: "termine",
        date: "2026-01-10",
        surface: 100,
        budget: 5000,
        entreprise: "InfraPlus"
      },
      {
        id: 4,
        latitude: -18.8950,
        longitude: 47.5200,
        titre: "Aménagement trottoir",
        status: "en cours",
        date: "2026-01-25",
        surface: 30,
        budget: 1500,
        entreprise: "UrbanDev"
      }
    ];
  }
};
