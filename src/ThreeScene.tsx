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
    const controlsRef = useRef<OrbitControls | null>(null); // OrbitControls 참조
    const [visited, setVisited] = useState<{ x: number; y: number; z: number }[]>([]); // 방문한 위치들 저장
    const sceneRef = useRef<THREE.Scene | null>(null); // THREE.Scene 참조 추가
    const globeRef = useRef<HTMLElement | null>(null); // DOM 참조

    useEffect(() => {
        // rendering setting
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        if (mountRef.current) {
            mountRef.current.appendChild(renderer.domElement);
        }

        // camera setting
        const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 20000);
        camera.position.set(15, 20, 30);
        cameraRef.current = camera; // 카메라 참조 저장
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.minDistance = 10;
        controls.maxDistance = 6000;
        controls.maxPolarAngle = Math.PI;
        controlsRef.current = controls; // OrbitControls 참조 저장

        // Backgound
        const scene = new THREE.Scene();
        sceneRef.current = scene; // Scene 참조 저장
        scene.add(new THREE.AmbientLight(0x666666));

        const light = new THREE.PointLight(0xffffff, 3, 0, 0);
        camera.add(light);
        scene.add(camera);

        scene.add(new THREE.AxesHelper(20));

        const group = new THREE.Group();
        scene.add(group);   

        // 지구 텍스처 로드
        const textureLoader = new THREE.TextureLoader();
        const earthTexture = textureLoader.load('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg'); // 다운받은 지구 텍스처 파일
        const bumpMap = textureLoader.load('//unpkg.com/three-globe/example/img/earth-topology.png');

        // 지구 생성
        const earthGeometry = new THREE.SphereGeometry(6371, 256, 256);
        const earthMaterial = new THREE.MeshPhongMaterial({
            map: earthTexture,
            bumpMap: bumpMap,
            bumpScale: 0.05, // 높이 효과
        });
        const earth = new THREE.Mesh(earthGeometry, earthMaterial);
        scene.add(earth); // 씬에 지구 추가

        // 비콘 생성 및 초기 위치 설정
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

        // Window setting
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

        if (controlsRef.current) {
            // OrbitControls의 target을 비콘의 위치로 설정
            controlsRef.current.target.set(position.x, position.y, position.z);
            controlsRef.current.update(); // OrbitControls 업데이트
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
