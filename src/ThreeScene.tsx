import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

interface ThreeSceneProps {
    position: { x: number; y: number; z: number }; // 위치 정보를 위한 props 타입 정의
}

const ThreeScene: React.FC<ThreeSceneProps> = ({ position }) => {
    const mountRef = useRef<HTMLDivElement | null>(null);
    const cubeRef = useRef<THREE.Mesh | null>(null); // 정육면체 참조
    

    useEffect(() => {
        // 씬 초기 설정
        let scene = new THREE.Scene();
        let camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 1000);
        camera.position.set(15, 20, 30);

        let renderer = new THREE.WebGLRenderer({ antialias: true });
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

    // 위치가 변경될 때마다 상자의 위치만 업데이트
    useEffect(() => {
        if (cubeRef.current) {
            cubeRef.current.position.set(position.x, position.y, position.z); // 상자의 위치만 변경
        }
    }, [position]); // position 값이 변경될 때만 실행

    return <div ref={mountRef} />;
};

export default ThreeScene;
