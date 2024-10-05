import React, { useState, useEffect } from 'react';
import { useBeaconData, BeaconData } from './components/DataParser';
import ThreeScene from './ThreeScene';

const App: React.FC = () => {
    const beaconDataArray = useBeaconData('/updated_beacon_output.txt'); // 데이터를 불러옴
    const [currentPosition, setCurrentPosition] = useState({ x: 0, y: 0, z: 0 }); // 초기 위치 설정
    const [index, setIndex] = useState(0); // 데이터를 순차적으로 넘기기 위한 인덱스 상태

    useEffect(() => {
        if (beaconDataArray.length > 0) {
            const interval = setInterval(() => {
                // 데이터가 순차적으로 업데이트되도록 설정
                setCurrentPosition(beaconDataArray[index].position); 
                setIndex((prevIndex) => (prevIndex + 1) % beaconDataArray.length); // 인덱스를 순환
            }, 1000); // 1초 간격으로 데이터 업데이트

            return () => clearInterval(interval); // 컴포넌트가 언마운트되면 interval 제거
        }
    }, [beaconDataArray, index]); // 데이터가 변경될 때마다 업데이트

    return (
        <div>
            <h1>ANT61 Beacon Visualizer</h1>
            <p>Current Position: {JSON.stringify(currentPosition)}</p> {/* 현재 위치 출력 */}
            <ThreeScene position={currentPosition} /> {/* ThreeScene에 현재 위치 전달 */}
        </div>
    );
};

export default App;
