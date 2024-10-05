import { useState, useEffect } from 'react';
import * as THREE from 'three';

const EARTH_RADIUS = 6371; // km

export interface BeaconData {
    messageId: number;
    timestamp: string;
    position: {
        x: number;
        y: number;
        z: number;
    };
    rotation: {
        yaw: number;
        pitch: number;
        roll: number;
    };
    acceleration: {
        x: number;
        y: number;
        z: number;
    };
    latitude?: number;
    longitude?: number;
    altitude?: number;
    orbitParams?: OrbitParameters;
}

export interface OrbitParameters {
    semiMajorAxis: number;
    eccentricity: number;
    inclination: number;
}

export function parseBeaconMessage(message: string): BeaconData | null {
    const regex = /Message (\d+).*D\[([^\]]+)\].*L\[([-\d.]+),([-\d.]+),([-\d.]+)\].*R\[([-\d.]+),([-\d.]+),([-\d.]+)\].*A\[([-\d.]+),([-\d.]+),([-\d.]+)\].*RD\[([^\]]+)\]/;
    const match = message.match(regex);

    if (!match) return null;

    const [, messageId, , x, y, z, yaw, pitch, roll, ax, ay, az, realTimestamp] = match;

    // 添加经纬度和高度的解析（假设这些数据在消息中可用）
    const latLonAltRegex = /LL\[([-\d.]+),([-\d.]+),([-\d.]+)\]/;
    const latLonAltMatch = message.match(latLonAltRegex);

    let latitude, longitude, altitude;
    if (latLonAltMatch) {
        [, latitude, longitude, altitude] = latLonAltMatch.map(parseFloat);
    }

    return {
        messageId: parseInt(messageId),
        timestamp: realTimestamp,
        position: {
            x: parseFloat(x),
            y: parseFloat(y),
            z: parseFloat(z)
        },
        rotation: {
            yaw: parseFloat(yaw),
            pitch: parseFloat(pitch),
            roll: parseFloat(roll)
        },
        acceleration: {
            x: parseFloat(ax),
            y: parseFloat(ay),
            z: parseFloat(az)
        },
        latitude,
        longitude,
        altitude
    };
}

export function latLonToECI(lat: number, lon: number, alt: number): THREE.Vector3 {
    const EARTH_RADIUS = 6371; // km
    const radLat = lat * Math.PI / 180;
    const radLon = lon * Math.PI / 180;
    const r = EARTH_RADIUS + alt;
    const x = r * Math.cos(radLat) * Math.cos(radLon);
    const y = r * Math.cos(radLat) * Math.sin(radLon);
    const z = r * Math.sin(radLat);
    return new THREE.Vector3(x, y, z);
}

export function calculateVelocity(pos1: THREE.Vector3, pos2: THREE.Vector3, time: number): THREE.Vector3 {
    return new THREE.Vector3().subVectors(pos2, pos1).divideScalar(time);
}

export function calculateOrbitParameters(position: THREE.Vector3, velocity: THREE.Vector3) {
    const mu = 398600.4418; // 地球引力常数 (km^3/s^2)
    const r = position.length();
    const v = velocity.length();

    const specificEnergy = (v * v / 2) - (mu / r);
    const semiMajorAxis = -mu / (2 * specificEnergy);

    const angularMomentum = new THREE.Vector3().crossVectors(position, velocity);
    const h = angularMomentum.length();

    const eccentricity = Math.sqrt(1 + (2 * specificEnergy * h * h) / (mu * mu));
    const inclination = Math.acos(angularMomentum.z / h) * 180 / Math.PI;

    return {
        semiMajorAxis,
        eccentricity,
        inclination
    };
}

export function useBeaconData(filePath: string) {
    const [beaconDataArray, setBeaconDataArray] = useState<BeaconData[]>([]);

    useEffect(() => {
        fetch(filePath)
            .then(response => response.text())
            .then(text => {
                const messages = text.split('Message').filter(msg => msg.trim());
                const parsedData = messages.map(msg => parseBeaconMessage('Message' + msg)).filter((data): data is BeaconData => data !== null);

                const dataWithOrbitParams = parsedData.map((data, index, arr) => {
                    if (index === 0 || !data.latitude || !data.longitude || !data.altitude) return data;

                    const prevData = arr[index - 1];
                    if (!prevData.latitude || !prevData.longitude || !prevData.altitude) return data;

                    const pos1 = latLonToECI(prevData.latitude, prevData.longitude, prevData.altitude);
                    const pos2 = latLonToECI(data.latitude, data.longitude, data.altitude);
                    const timeDiff = (new Date(data.timestamp).getTime() - new Date(prevData.timestamp).getTime()) / 1000; // 转换为秒

                    const velocity = calculateVelocity(pos1, pos2, timeDiff);
                    const orbitParams = calculateOrbitParameters(pos2, velocity);

                    return { ...data, orbitParams };
                });

                setBeaconDataArray(dataWithOrbitParams);

                // 打印出每个数据的位置信息和轨道参数，检查是否解析正确
                dataWithOrbitParams.forEach((data, index) => {
                    console.log(`Message ${index}: Position = (${data.position.x}, ${data.position.y}, ${data.position.z}), Acceleration = (${data.acceleration.x}, ${data.acceleration.y}, ${data.acceleration.z})`);
                    if (data.orbitParams) {
                        console.log(`Orbit Parameters: Semi-Major Axis = ${data.orbitParams.semiMajorAxis.toFixed(2)} km, Eccentricity = ${data.orbitParams.eccentricity.toFixed(4)}, Inclination = ${data.orbitParams.inclination.toFixed(2)}°`);
                    }
                });
            })
            .catch(error => console.error('Error loading beacon data:', error));
    }, [filePath]);

    return beaconDataArray;
}