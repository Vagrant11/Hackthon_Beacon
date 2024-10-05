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
}

export function parseBeaconMessage(message: string): BeaconData {
    const regex = /Message (\d+).*D\[([^\]]+)\].*L\[([-\d.]+),([-\d.]+),([-\d.]+)\].*R\[([-\d.]+),([-\d.]+),([-\d.]+)\].*RD\[([^\]]+)\]/;

    const match = message.match(regex);

    if (!match) {
        throw new Error("Invalid message format");
    }

    const [
        ,
        messageId,
        timestamp,
        x,
        y,
        z,
        yaw,
        pitch,
        roll,
        realTimestamp
    ] = match;

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
        }
    };
}