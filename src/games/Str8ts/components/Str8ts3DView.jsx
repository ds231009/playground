import React, {useRef} from 'react';
import {Canvas, useFrame} from '@react-three/fiber';
import { useSpring, a } from '@react-spring/three';
import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';


function CameraController() {
    const { camera } = useThree();

    useEffect(() => {
        camera.position.set(-12, 10, -12); // where the camera is
        camera.lookAt(0, 0, 0);          // what it looks at (center of grid)
    }, [camera]);

    return null;
}

const style = {
    "initial": {color: "#0cd6bf", size: [0.9,0.9,0.9]},
    "guessed": {color: "#af7113", size: [0.8,0.8,0.8]},
    "solved": {color: "#40ff00", size: [0.8,0.8,0.8]},
    "machine-solved": {color: "#40ff00", size: [0.85,0.85,0.85]},
    // "machine-filled": {color: "#da6424", size: [0.85,0.85,0.85]},
    "machine-guessed": {color: "#da6424", size: [0.85,0.85,0.85]},
    "empty": {color: "#5e5e5e", size: [0.8,0.8,0.8]},
    "null": {color: "red", size: [0.8,0.8,0.8]}
}

function SpinningCamera() {
    const { camera } = useThree();

    useFrame(({ clock }) => {
        const t = clock.getElapsedTime();
        camera.position.x = Math.sin(t/ 10) * 12;
        camera.position.y = 12;
        camera.position.z = Math.cos(t/ 10) * 12;
        camera.lookAt(0, 0, 0);
    });

    return null;
}

const Cube = ({cell,boardState}) => {
    const cellState = boardState === "solved" ? cell.state === "initial" ? cell.state : "solved" : cell.state
    const displayValue = cell.machineValue || 0;
    const x = cell.position.row - 4;
    const z = cell.position.col - 4;
    const targetY = displayValue > 0 ? displayValue : 0;

    const {position} = useSpring({
        position: [x,targetY, z],
        config: { mass: 1, tension: 170, friction: 26 }
    })

    return (
        <a.mesh position={position}>
            <boxGeometry args={cellState ? style[cellState].size :  [0.8,0.8,0.8]} />
            <meshStandardMaterial color={cellState ? style[cellState].color : "#5e5e5e"}/>
        </a.mesh>
    );
}

const CandidCube = ({cell,candidate}) => {
    console.log(candidate)
    const displayValue = candidate || 0;
    const x = cell.position.row - 4;
    const z = cell.position.col - 4;
    const targetY = displayValue > 0 ? displayValue : 0;

    const {position} = useSpring({
        position: [x,targetY, z],
        config: { mass: 1, tension: 170, friction: 26 }
    })

    return (
        <a.mesh position={position}>
            <boxGeometry args={[0.2,0.2,0.2]} />
            <meshStandardMaterial color={"#d3d3d3"}/>
        </a.mesh>
    );
}

export default function Str8ts3DView({board, boardState}) {
    return (
            <Canvas fov={15} style={{ height: '300px', width: '300px' }}>
                <CameraController />
                <SpinningCamera />

                <ambientLight intensity={0.3} />
                <directionalLight position={[5, 5, 10]} intensity={3} />
                {board.map((cell, i) =>
                    <React.Fragment key={i}>

                    <Cube key={i} cell={cell} boardState={boardState}/>
                        {/*{cell.machineCandidates?.map((candidate) => (*/}
                        {/*<CandidCube*/}
                        {/*    key={candidate}*/}
                        {/*    cell={cell}*/}
                        {/*    candidate={candidate}*/}
                        {/*/>*/}
                        {/*))}*/}
                    </ React.Fragment>
                )}
            </Canvas>
    );
}