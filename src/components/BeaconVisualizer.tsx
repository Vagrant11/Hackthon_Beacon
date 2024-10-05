import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Line } from '@react-three/drei';
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
            <sphereGeometry args={[0.5, 32, 32]} />
            <meshStandardMaterial color="orange" />
        </mesh>
    );
}

function BeaconPath({ data }: { data: BeaconData[] }) {
    const points = useMemo(() => {
        return data.map(d => new THREE.Vector3(d.position.x, d.position.y, d.position.z));
    }, [data]);

    return <Line points={points} color="blue" lineWidth={1} />;
}

interface BeaconVisualizerProps {
    beaconDataArray: BeaconData[];
}

export default function BeaconVisualizer({ beaconDataArray }: BeaconVisualizerProps) {
    const latestData = beaconDataArray[beaconDataArray.length - 1];

    console.log("Rendering BeaconVisualizer with", beaconDataArray.length, "data points");

    return (
        <div style={{ width: '100%', height: '600px' }}>
            <Canvas camera={{ position: [0, 0, 1000] }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} />
                {latestData && <Beacon data={latestData} />}
                <BeaconPath data={beaconDataArray} />
                <OrbitControls />
            </Canvas>

        </div>
    );
}