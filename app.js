const express = require('express');
const app = express();
const port = 3000;

// Static Data for the API
const fs = require('fs');
const geojsonData = JSON.parse(fs.readFileSync('National_Obesity_By_State.geojson', 'utf8'));

// GET /api/states
app.get('/api/states', (req, res) => {
    const stateList = geojsonData.features.map((feature) => ({
      id: feature.properties.FID, 
      name: feature.properties.NAME, 
    }));
  
    res.json(stateList);
  });

// GET /api/state/:identifier
  app.get('/api/state/:identifier', (req, res) => {
    const { identifier } = req.params;
  
    const stateFeature = geojsonData.features.find((feature) => {
        const idMatch = feature.properties.FID === identifier;
        const nameMatch = feature.properties.NAME.toLowerCase() === identifier.toLowerCase();
        return idMatch || nameMatch;
      });
  
    if (!stateFeature) {
      return res.status(404).json({ error: 'State not found' });
    }
    const id = stateFeature.properties.FID;
    const name = stateFeature.properties.NAME;
    const obesity = stateFeature.properties.Obesity;
    const coordinates = stateFeature.geometry.coordinates;
  
    res.json({ id, name, obesity, coordinates });
  });

  // GET /api/summary
app.get('/api/summary', (req, res) => {
    
    // state with highest obesity
    const stateWithHighestObesity = geojsonData.features.reduce((maxState, currentState) => {
    return currentState.properties.Obesity > maxState.properties.Obesity ? currentState : maxState;
    });

    // state with lowest obesity
    const stateWithLowestObesity = geojsonData.features.reduce((minState, currentState) => {
    return currentState.properties.Obesity < minState.properties.Obesity ? currentState : minState;
    });

    // average country obesity
    const totalObesity = geojsonData.features.reduce((total, state) => total + state.properties.Obesity, 0);
    const averageCountryObesity = totalObesity / geojsonData.features.length;

    const summaryData = {
      stateWithHighestObesity: {
        name: stateWithHighestObesity.properties.NAME,
        value: stateWithHighestObesity.properties.Obesity,
      },
      stateWithLowestObesity: {
        name: stateWithLowestObesity.properties.NAME,
        value: stateWithLowestObesity.properties.Obesity,
      },
      averageCountryObesity: averageCountryObesity,
    };
  
    res.json(summaryData);
  });
  
  

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
