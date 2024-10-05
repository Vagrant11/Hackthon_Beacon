import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { BeaconData } from './DataParser';
import * as THREE from 'three';

interface BeaconProps {
    data: BeaconData;
}

function Beacon({ data }: BeaconProps) {
    const meshRef = useRef<THREE.Mesh>(null!);

    useFrame(() => {
        if (meshRef.current) {
            meshRef.current.position.set(data.position.x, data.position.y, data.position.z);
            meshRef.current.rotation.set(data.rotation.pitch, data.rotation.yaw, data.rotation.roll);
        }
    });

    return (
        <mesh ref={meshRef}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="orange" />
        </mesh>
    );
}

interface BeaconVisualizerProps {
    beaconData: BeaconData;
}

export default function BeaconVisualizer({ beaconData }: BeaconVisualizerProps) {
    return (
        <div style={{ width: '100%', height: '400px' }}>
            <Canvas camera={{ position: [5, 5, 5] }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} />
                <Beacon data={beaconData} />
                <OrbitControls />
            </Canvas>
        </div>
    );
}