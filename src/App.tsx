import React, { useState, useEffect } from 'react';
import { useBeaconData, BeaconData } from './components/DataParser';
import ThreeScene from './ThreeScene'; // Three.js 기반 3D 시각화 컴포넌트

// 위도, 경도, 고도를 x, y, z로 변환하는 함수
const convertLatLonAltToXYZ = (latitude: number, longitude: number, altitude: number) => {
    const earthRadius = 6371; // (Unit: km)
    const Radius = 6371 + altitude; // (Unit: km)

    const latRad = (latitude * Math.PI) / 180;
    const lonRad = (longitude * Math.PI) / 180;

    const x = Radius * Math.cos(latRad) * Math.cos(lonRad);
    const y = Radius * Math.sin(latRad);
    const z = Radius * Math.cos(latRad) * Math.sin(lonRad);

    return { x, y, z };
};

const App: React.FC = () => {
    const beaconDataArray = useBeaconData('/updated_beacon_output.txt'); // 비콘 데이터를 불러옴
    const [processedData, setProcessedData] = useState<BeaconData[]>([]);
    const [currentPosition, setCurrentPosition] = useState<{ x: number; y: number; z: number } | null>(null);
    const [originalPosition, setOriginalPosition] = useState<BeaconData | null>(null); // 원래의 비콘 데이터 저장
    const [index, setIndex] = useState(0); // 데이터를 순차적으로 넘기기 위한 인덱스 상태

    useEffect(() => {
        if (beaconDataArray.length > 0) {
            // 위도, 경도, 고도를 받아서 x, y, z로 변환
            const transformedData = beaconDataArray.map(data => {
                const { x, y, z } = convertLatLonAltToXYZ(data.position.x, data.position.y, data.position.z);
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
                setCurrentPosition(processedData[index].position); // 순차적으로 변환된 데이터를 현재 위치로 설정
                setOriginalPosition(beaconDataArray[index]); // 원래 데이터를 저장
                setIndex((prevIndex) => (prevIndex + 1) % processedData.length); // 인덱스를 순환
            }, 1000); // 1초 간격으로 데이터 업데이트

            return () => clearInterval(interval); // 컴포넌트가 언마운트되면 interval 제거
        }
    }, [processedData, index, beaconDataArray]);

    return (
        <div>
            {/* 오른쪽 상단에 정보를 표시하는 박스 */}
            <div style={{ position: 'absolute', top: '10px', right: '10px', padding: '10px', backgroundColor: 'rgba(0, 0, 0, 0.7)', color: 'white', borderRadius: '5px', fontFamily: 'Arial, sans-serif' }}>
                <h3>Beacon Info</h3>
                {originalPosition && currentPosition ? (
                    <>
                        <p>latitude: {originalPosition.position.x.toFixed(2)}</p>
                        <p>longitude: {originalPosition.position.y.toFixed(2)}</p>
                        <p>altitude: {originalPosition.position.z.toFixed(2)}</p>
                        
                        <p>rotation yaw (X): {originalPosition.rotation?.yaw.toFixed(2) ?? 'N/A'}</p>
                        <p>rotation pitch (Y): {originalPosition.rotation?.pitch.toFixed(2) ?? 'N/A'}</p>
                        <p>rotation roll (Z): {originalPosition.rotation?.roll.toFixed(2) ?? 'N/A'}</p>


                        <p>Acceleration X: {originalPosition.acceleration?.x.toFixed(2) ?? 'N/A'}</p>
                        <p>Acceleration Y: {originalPosition.acceleration?.y.toFixed(2) ?? 'N/A'}</p>
                        <p>Acceleration Z: {originalPosition.acceleration?.z.toFixed(2) ?? 'N/A'}</p>

                    </>
                ) : (
                    <p>Loading...</p>
                )}
            </div>

            {/* ThreeScene에 변환된 현재 위치 데이터 전달 */}
            {currentPosition && <ThreeScene position={currentPosition} />}
        </div>
    );
};

export default App;
