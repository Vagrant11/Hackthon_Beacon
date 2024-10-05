import React from 'react';
import BeaconVisualizer from './components/BeaconVisualizer';
import { useBeaconData } from './components/DataParser';

const App: React.FC = () => {
    const beaconDataArray = useBeaconData('/updated_beacon_output.txt');

    console.log("Beacon data length:", beaconDataArray.length);

    return (
        <div>
            <h1>ANT61 Beacon Visualizer</h1>
            {beaconDataArray.length > 0 ? (
                <>
                    <p>Loaded {beaconDataArray.length} data points.</p>
                    <BeaconVisualizer beaconDataArray={beaconDataArray} />
                </>
            ) : (
                <p>Loading data...</p>
            )}
        </div>
    );
};

export default App;