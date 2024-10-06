import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

interface ThreeSceneProps {
    position: { x: number; y: number; z: number };
    rotation: { yaw: number; pitch: number; roll: number };
    acceleration: { x: number; y: number; z: number };
}

const ThreeScene: React.FC<ThreeSceneProps> = ({ position, rotation, acceleration }) => {
    const mountRef = useRef<HTMLDivElement | null>(null);
    const cubeRef = useRef<THREE.Mesh | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const controlsRef = useRef<OrbitControls | null>(null);
    const [visited, setVisited] = useState<{ x: number; y: number; z: number }[]>([]);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const [selectedInfo, setSelectedInfo] = useState<string>('position');

    // 각 축에 대한 ArrowHelper 참조
    const arrowHelperXRef = useRef<THREE.ArrowHelper | null>(null);
    const arrowHelperYRef = useRef<THREE.ArrowHelper | null>(null);
    const arrowHelperZRef = useRef<THREE.ArrowHelper | null>(null);

    // 기존 시각적 요소 삭제 함수
    const removeExistingVisuals = () => {
        if (sceneRef.current) {
            // 기존 화살표 제거
            if (arrowHelperXRef.current) {
                sceneRef.current.remove(arrowHelperXRef.current);
                arrowHelperXRef.current = null;
            }
            if (arrowHelperYRef.current) {
                sceneRef.current.remove(arrowHelperYRef.current);
                arrowHelperYRef.current = null;
            }
            if (arrowHelperZRef.current) {
                sceneRef.current.remove(arrowHelperZRef.current);
                arrowHelperZRef.current = null;
            }
        }
    };

    useEffect(() => {
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        if (mountRef.current) {
            mountRef.current.appendChild(renderer.domElement);
        }

        const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 20000);
        camera.position.set(15, 20, 30);
        cameraRef.current = camera;
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.minDistance = 10;
        controls.maxDistance = 6000;
        controls.maxPolarAngle = Math.PI;
        controlsRef.current = controls;

        const scene = new THREE.Scene();
        sceneRef.current = scene;
        scene.add(new THREE.AmbientLight(0x666666));

        const light = new THREE.PointLight(0xffffff, 3, 0, 0);
        camera.add(light);
        scene.add(camera);

        scene.add(new THREE.AxesHelper(20));

        const group = new THREE.Group();
        scene.add(group);

        const textureLoader = new THREE.TextureLoader();
        const earthTexture = textureLoader.load('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg');
        const bumpMap = textureLoader.load('//unpkg.com/three-globe/example/img/earth-topology.png');

        const earthGeometry = new THREE.SphereGeometry(6371, 256, 256);
        const earthMaterial = new THREE.MeshPhongMaterial({
            map: earthTexture,
            bumpMap: bumpMap,
            bumpScale: 0.05,
        });
        const earth = new THREE.Mesh(earthGeometry, earthMaterial);
        scene.add(earth);

        const boxGeometry = new THREE.BoxGeometry(10, 2.5, 10);
        const boxMaterial = new THREE.MeshLambertMaterial({
            color: 0xfc6601,
            opacity: 0.8,
            transparent: true,
        });

        const cube = new THREE.Mesh(boxGeometry, boxMaterial);
        cube.position.set(position.x, position.y, position.z);
        group.add(cube);

        cubeRef.current = cube;

        const animate = () => {
            renderer.render(scene, camera);
        };

        renderer.setAnimationLoop(animate);

        const onWindowResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };

        window.addEventListener('resize', onWindowResize);

        return () => {
            window.removeEventListener('resize', onWindowResize);
            mountRef.current?.removeChild(renderer.domElement);
        };
    }, []);

    // 비콘에 회전 정보 적용
    useEffect(() => {
        if (cubeRef.current) {
            // yaw: y축, pitch: x축, roll: z축 회전 적용
            cubeRef.current.rotation.set(
                THREE.MathUtils.degToRad(rotation.pitch),  // pitch -> x축 회전
                THREE.MathUtils.degToRad(rotation.yaw),    // yaw -> y축 회전
                THREE.MathUtils.degToRad(rotation.roll)    // roll -> z축 회전
            );
        }
    }, [rotation]);

    // 위치가 변경될 때마다 상자의 위치 업데이트 + 이전 위치 기록
    useEffect(() => {
        if (cubeRef.current) {
            cubeRef.current.position.set(position.x, position.y, position.z);
            setVisited((prevVisited) => [...prevVisited, { x: position.x, y: position.y, z: position.z }]);
        }

        if (controlsRef.current) {
            controlsRef.current.target.set(position.x, position.y, position.z);
            controlsRef.current.update();
        }
    }, [position]);

    // visited 배열에 기반하여 past path 점 표시
    useEffect(() => {
        if (sceneRef.current && visited.length > 0) {
            visited.forEach((pos) => {
                const dotGeometry = new THREE.SphereGeometry(0.5, 16, 16);
                const dotMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
                const dot = new THREE.Mesh(dotGeometry, dotMaterial);
                dot.position.set(pos.x, pos.y, pos.z);
                sceneRef.current?.add(dot); // 점 추가
            });
        }
    }, [visited]);

    // 선택된 정보에 따른 시각적 요소 처리
    useEffect(() => {
        removeExistingVisuals(); // 새로운 정보가 선택될 때 기존 요소 제거

        if (selectedInfo === 'acceleration' && sceneRef.current) {
            const directionX = new THREE.Vector3(1, 0, 0).normalize();
            const lengthX = Math.abs(acceleration.x);
            const arrowHelperX = new THREE.ArrowHelper(directionX, new THREE.Vector3(position.x, position.y, position.z), lengthX * 50, 0xff0000);
            sceneRef.current.add(arrowHelperX);
            arrowHelperXRef.current = arrowHelperX;

            const directionY = new THREE.Vector3(0, 1, 0).normalize();
            const lengthY = Math.abs(acceleration.y);
            const arrowHelperY = new THREE.ArrowHelper(directionY, new THREE.Vector3(position.x, position.y, position.z), lengthY * 50, 0x00ff00);
            sceneRef.current.add(arrowHelperY);
            arrowHelperYRef.current = arrowHelperY;

            const directionZ = new THREE.Vector3(0, 0, 1).normalize();
            const lengthZ = acceleration.z;
            const arrowHelperZ = new THREE.ArrowHelper(directionZ, new THREE.Vector3(position.x, position.y, position.z), lengthZ * 50, 0x0000ff);
            sceneRef.current.add(arrowHelperZ);
            arrowHelperZRef.current = arrowHelperZ;
        }
    }, [rotation, acceleration, selectedInfo]);

    const renderInfo = () => {
        switch (selectedInfo) {
            case 'position':
                return (
                    <>
                        <p>X: {position.x.toFixed(2)}</p>
                        <p>Y: {position.y.toFixed(2)}</p>
                        <p>Z: {position.z.toFixed(2)}</p>
                    </>
                );
            case 'rotation':
                return (
                    <>
                        <p>Yaw: {rotation.yaw.toFixed(2)}</p>
                        <p>Pitch: {rotation.pitch.toFixed(2)}</p>
                        <p>Roll: {rotation.roll.toFixed(2)}</p>
                    </>
                );
            case 'acceleration':
                return (
                    <>
                        <p>Acceleration X: {acceleration.x.toFixed(2)}</p>
                        <p>Acceleration Y: {acceleration.y.toFixed(2)}</p>
                        <p>Acceleration Z: {acceleration.z.toFixed(2)}</p>
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <div style={{ position: 'relative' }}>
            <div ref={mountRef} />

            <div style={{ position: 'absolute', top: '10px', right: '10px', padding: '10px', backgroundColor: 'rgba(0, 0, 0, 0.7)', color: 'white', borderRadius: '5px', fontFamily: 'Arial, sans-serif' }}>
                <h3>Beacon Info</h3>
                {renderInfo()}

                <div style={{ marginTop: '10px' }}>
                    <button onClick={() => setSelectedInfo('position')} style={{ marginRight: '5px' }}>Position</button>
                    <button onClick={() => setSelectedInfo('rotation')} style={{ marginRight: '5px' }}>Rotation</button>
                    <button onClick={() => setSelectedInfo('acceleration')}>Acceleration</button>
                </div>
            </div>
        </div>
    );
};

export default ThreeScene;
