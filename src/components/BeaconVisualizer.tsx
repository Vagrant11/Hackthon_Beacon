import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Line, PerspectiveCamera } from '@react-three/drei'; // 使用 @react-three/drei 的 PerspectiveCamera
import { BeaconData } from './DataParser';
import * as THREE from 'three';

interface BeaconProps {
    data: BeaconData;
}

function Beacon({ data }: BeaconProps) {
    const meshRef = useRef<THREE.Mesh>(null!);

    useEffect(() => {
        if (meshRef.current) {
            meshRef.current.position.set(0, 0, 0); // 圆心固定在 (0, 0, 0)
            meshRef.current.rotation.set(data.rotation.pitch, data.rotation.yaw, data.rotation.roll);
        }
    }, [data]);

    return (
        <mesh ref={meshRef}>
            <sphereGeometry args={[200, 32, 32]} />
            <meshStandardMaterial color="orange" />
        </mesh>
    );
}

function BeaconPath({ data }: { data: BeaconData[] }) {
    const points = useMemo(() => {
        return data.map(d => new THREE.Vector3(d.position.x, d.position.y, d.position.z));
    }, [data]);

    return <Line points={points} color="blue" lineWidth={2} />;
}

function AutoScaleScene({ beaconDataArray }: { beaconDataArray: BeaconData[] }) {
    const { camera, scene } = useThree();
    const controlsRef = useRef<any>(null);

    useEffect(() => {
        if (beaconDataArray.length === 0) return;

        const box = new THREE.Box3();

        beaconDataArray.forEach(data => {
            box.expandByPoint(new THREE.Vector3(data.position.x, data.position.y, data.position.z));
        });

        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        const maxDim = Math.max(size.x, size.y, size.z);

        if (camera instanceof THREE.PerspectiveCamera) {
            const fov = camera.fov * (Math.PI / 180);
            let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
            cameraZ *= 1.5; // Zoom out a little so objects don't fill the screen

            camera.position.set(center.x, center.y, center.z + cameraZ);
            camera.lookAt(center);
            camera.updateProjectionMatrix();

            // Update OrbitControls
            if (controlsRef.current) {
                controlsRef.current.target.set(center.x, center.y, center.z);
                controlsRef.current.update(); // 删除 minDistance 和 maxDistance 的设置
            }
        } else {
            // Handle OrthographicCamera if needed
            console.warn('OrthographicCamera is not fully supported in this auto-scaling function');
        }

    }, [beaconDataArray, camera, scene]);

    return (
        <>
            <OrbitControls ref={controlsRef} minDistance={1} maxDistance={10000} />
            <BeaconPath data={beaconDataArray} />
            {beaconDataArray.length > 0 && <Beacon data={beaconDataArray[beaconDataArray.length - 1]} />}
        </>
    );
}

interface BeaconVisualizerProps {
    beaconDataArray: BeaconData[];
}

export default function BeaconVisualizer({ beaconDataArray }: BeaconVisualizerProps) {
    return (
        <div style={{ width: '100%', height: '600px' }}>
            <Canvas>
                <PerspectiveCamera makeDefault position={[0, 0, 1000]} />
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} />
                <AutoScaleScene beaconDataArray={beaconDataArray} />
            </Canvas>
        </div>
    );
}
