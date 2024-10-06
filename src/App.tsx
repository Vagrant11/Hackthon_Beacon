import React, { useState, useEffect } from 'react';
import { useBeaconData, BeaconData } from './components/DataParser';
import ThreeScene from './ThreeScene'; // Three.js 기반 3D 시각화 컴포넌트

// 위도, 경도, 고도를 x, y, z로 변환하는 함수
const convertLatLonAltToXYZ = (latitude: number, longitude: number, altitude: number) => {
    const earthRadius = 6371; // (Unit: km)
    const Radius = 6371 + altitude; // (Unit: km)

    // change (latitude, longitude) to radian
    const latRad = (latitude * Math.PI) / 180;
    const lonRad = (longitude * Math.PI) / 180;

    // change the orthogonal coordinates to spactial coordinates
    const x = Radius * Math.cos(latRad) * Math.cos(lonRad);
    const y = Radius * Math.sin(latRad); // 위도에 따른 높이
    const z = Radius * Math.cos(latRad) * Math.sin(lonRad);

    return { x, y, z };
};

const App: React.FC = () => {
    const beaconDataArray = useBeaconData('/updated_beacon_output.txt'); // 비콘 데이터를 불러옴
    const [processedData, setProcessedData] = useState<BeaconData[]>([]);
    const [currentPosition, setCurrentPosition] = useState<{ x: number; y: number; z: number } | null>(null);
    const [index, setIndex] = useState(0); // 데이터를 순차적으로 넘기기 위한 인덱스 상태
    const [currentRotation, setCurrentRotation] = useState<{ yaw: number; pitch: number; roll: number } | null>(null);
    const [currentAcceleration, setCurrentAcceleration] = useState<{ x: number; y: number; z: number } | null>(null);

    useEffect(() => {
        if (beaconDataArray.length > 0) {
            // 위도, 경도, 고도를 받아서 x, y, z로 변환
            const transformedData = beaconDataArray.map(data => {
                const { x, y, z } = convertLatLonAltToXYZ(data.position.x, data.position.y, data.position.z); // 위치 변환
                return {
                    ...data,
                    position: { x, y, z } // 변환된 좌표로 position 업데이트
                };
            });
            
            setProcessedData(transformedData); // 변환된 데이터를 상태에 저장
        }
    }, [beaconDataArray]);

    useEffect(() => {
        if (processedData.length > 0) {
            // 데이터가 순차적으로 업데이트되도록 설정
            const interval = setInterval(() => {
                const currentData = processedData[index];

                setCurrentPosition(currentData.position); // 순차적으로 변환된 데이터를 현재 위치로 설정
                setCurrentRotation(currentData.rotation); // rotation 데이터 설정
                setCurrentAcceleration(currentData.acceleration); // acceleration 데이터 설정

                setIndex((prevIndex) => (prevIndex + 1) % processedData.length); // 인덱스를 순환
            }, 1000); // 1초 간격으로 데이터 업데이트

            return () => clearInterval(interval); // 컴포넌트가 언마운트되면 interval 제거
        }
    }, [processedData, index]);

    return (
        <div>
            {currentPosition && currentRotation && currentAcceleration && (
                <ThreeScene
                    position={currentPosition}
                    rotation={currentRotation}
                    acceleration={currentAcceleration}
                />
            )}
        </div>
    );
};

export default App;
