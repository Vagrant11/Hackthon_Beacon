import React, { useState, useEffect } from 'react';
import ThreeScene from './ThreeScene';

const App: React.FC = () => {
    const [position, setPosition] = useState({ x: 0, y: 0, z: 0 });

    useEffect(() => {
        const positions = [
            { x: 0, y: 0, z: 0 },
            { x: 5, y: 5, z: 5 },
            { x: 10, y: 10, z: 10 }
        ];

        let currentStep = 0;
        const interval = setInterval(() => {
            // 위치 변경
            setPosition(positions[currentStep]);
            currentStep = (currentStep + 1) % positions.length; // 위치 순환
        }, 2000); // 2초마다 위치 변경

        return () => clearInterval(interval); // 컴포넌트가 언마운트될 때 인터벌 제거
    }, []);

    return (
        <div>
            <h1>ANT61 Beacon Visualizer</h1>
            {/* ThreeScene 컴포넌트에 동적인 위치 정보 전달 */}
            <ThreeScene position={position} />
        </div>
    );
};

export default App;
