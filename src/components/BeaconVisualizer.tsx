import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import ThreeGlobe from 'three-globe';
import { BeaconData } from './DataParser';

const Globe = ({ beaconDataArray }: { beaconDataArray: BeaconData[] }) => {
    const globeRef = useRef<any>();
    const { scene } = useThree();
    const [globeReady, setGlobeReady] = useState(false);

    useEffect(() => {
        if (!globeRef.current) {
            const globe = new ThreeGlobe()
                .globeImageUrl('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
                .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
                .showAtmosphere(true)
                .atmosphereColor('#3a228a')
                .atmosphereAltitude(0.25);

            globe.onGlobeReady(() => {
                setGlobeReady(true);
            });

            globeRef.current = globe;
            scene.add(globe);
        }

        if (globeReady && beaconDataArray.length > 0) {
            // 添加轨道路径
            const pathData = beaconDataArray.map(d => ({
                startLat: d.position.y,
                startLng: d.position.x,
                endLat: d.position.y,
                endLng: d.position.x,
                alt: Math.max(0.1, d.position.z / 6371) // 调整高度比例，确保可见
            }));

            globeRef.current
                .arcsData(pathData)
                .arcColor(() => 'rgba(255,165,0,0.8)') // 橙色轨道
                .arcAltitude('alt')
                .arcStroke(1) // 增加轨道宽度
                .arcDashLength(0.9)
                .arcDashGap(4)
                .arcDashAnimateTime(1000);
        }

    }, [beaconDataArray, scene, globeReady]);

    useFrame(() => {
        if (globeRef.current) {
            globeRef.current.rotation.y += 0.002;
        }
    });

    return null;
};

const BeaconVisualizer: React.FC<{ beaconDataArray: BeaconData[] }> = ({ beaconDataArray }) => {
    return (
        <div style={{ width: '100%', height: '600px' }}>
            <Canvas camera={{ position: [0, 0, 300], fov: 60 }} style={{ background: 'black' }}>
                <ambientLight intensity={0.3} />
                <pointLight position={[100, 100, 100]} intensity={0.6} />
                <pointLight position={[-100, -100, -100]} intensity={0.6} />
                <Globe beaconDataArray={beaconDataArray} />
                <OrbitControls enablePan={false} enableZoom={true} enableRotate={true} />
            </Canvas>
        </div>
    );
};

export default BeaconVisualizer;