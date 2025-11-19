const testData = {
  "0": {
    json: {
      areas: [
        {
          areaName: "Contabilidad",
          managerName: "Juan Pérez",
          productivePercentage: 65.5,
          supportPercentage: 20.3,
          deadTimePercentage: 14.2,
          totalActivities: 8
        },
        {
          areaName: "Logística",
          managerName: "María García",
          productivePercentage: 70.1,
          supportPercentage: 18.5,
          deadTimePercentage: 11.4,
          totalActivities: 10
        }
      ]
    }
  }
};

console.log("Testing compareAreas endpoint...");
console.log("Request body:", JSON.stringify(testData, null, 2));

const response = await fetch('http://localhost:3000/api/trpc/ai.compareAreas', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(testData),
});

console.log("Response status:", response.status);
const data = await response.text();
console.log("Response body:", data);
