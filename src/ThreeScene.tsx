import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

interface ThreeSceneProps {
    position: { x: number; y: number; z: number }; // 위치 정보를 위한 props 타입 정의
}

const ThreeScene: React.FC<ThreeSceneProps> = ({ position }) => {
    const mountRef = useRef<HTMLDivElement | null>(null);
    const cubeRef = useRef<THREE.Mesh | null>(null); // 정육면체 참조
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null); // 카메라 참조
    const [visited, setVisited] = useState<{ x: number; y: number; z: number }[]>([]); // 방문한 위치들 저장
    const sceneRef = useRef<THREE.Scene | null>(null); // THREE.Scene 참조 추가

    useEffect(() => {
        // 씬 초기 설정
        const scene = new THREE.Scene();
        sceneRef.current = scene; // Scene 참조 저장
        const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 1000);
        camera.position.set(15, 20, 30);
        cameraRef.current = camera; // 카메라 참조 저장

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        if (mountRef.current) {
            mountRef.current.appendChild(renderer.domElement);
        }

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.minDistance = 20;
        controls.maxDistance = 50;
        controls.maxPolarAngle = Math.PI / 2;

        scene.add(new THREE.AmbientLight(0x666666));

        const light = new THREE.PointLight(0xffffff, 3, 0, 0);
        camera.add(light);
        scene.add(camera);

        scene.add(new THREE.AxesHelper(20));

        const group = new THREE.Group();
        scene.add(group);

        // 정육면체(BoxGeometry) 생성 및 초기 위치 설정
        const boxGeometry = new THREE.BoxGeometry(10, 2.5, 10);
        const boxMaterial = new THREE.MeshLambertMaterial({
            color: 0xfc6601,
            opacity: 0.8,
            transparent: true,
        });

        const cube = new THREE.Mesh(boxGeometry, boxMaterial);
        cube.position.set(position.x, position.y, position.z); // 초기 위치 설정
        group.add(cube);

        cubeRef.current = cube; // 정육면체 참조 저장

        const animate = () => {
            renderer.render(scene, camera); // 카메라와 씬의 상태를 유지하면서 렌더링
        };

        renderer.setAnimationLoop(animate); // 애니메이션 루프 설정

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

    // 위치가 변경될 때마다 상자의 위치 업데이트 + 이전 위치 기록
    useEffect(() => {
        if (cubeRef.current) {
            // 상자의 위치 업데이트
            cubeRef.current.position.set(position.x, position.y, position.z);

            // 새로운 위치를 visited 리스트에 추가
            setVisited((prevVisited) => [...prevVisited, { x: position.x, y: position.y, z: position.z }]);
        }

        if (cameraRef.current) {
            // 카메라가 정육면체를 따라가도록 설정 (비콘을 따라감)
            const cameraDistance = 30; // 카메라가 정육면체에서 떨어진 거리
            cameraRef.current.position.set(position.x + cameraDistance, position.y + cameraDistance, position.z + cameraDistance);
            cameraRef.current.lookAt(position.x, position.y, position.z); // 카메라가 정육면체를 바라보도록 설정
        }
    }, [position]);

    // 방문한 위치들에 점 추가
    useEffect(() => {
        if (sceneRef.current && visited.length > 0) {
            visited.forEach((pos) => {
                // 각 방문한 위치에 대해 작은 점(SphereGeometry)을 추가
                const dotGeometry = new THREE.SphereGeometry(0.5, 16, 16);
                const dotMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
                const dot = new THREE.Mesh(dotGeometry, dotMaterial);
                dot.position.set(pos.x, pos.y, pos.z);

                // 씬에 점을 추가
                sceneRef.current?.add(dot);
            });
        }
    }, [visited]); // visited 리스트가 변경될 때마다 실행

    return <div ref={mountRef} />;
};

export default ThreeScene;
