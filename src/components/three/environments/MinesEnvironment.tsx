'use client';



export default function MinesEnvironment() {
  return (
    <group>
      <mesh position={[0, 0, -15]} receiveShadow>
        <boxGeometry args={[8, 4, 40]} />
        <meshStandardMaterial color="#1a1a1a" roughness={1} />
      </mesh>
      
      <mesh position={[0, 4, -15]} receiveShadow>
        <boxGeometry args={[8, 0.5, 40]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.95} />
      </mesh>
      
      <mesh position={[-3.85, 2, -15]} receiveShadow>
        <boxGeometry args={[0.3, 4, 40]} />
        <meshStandardMaterial color="#252525" roughness={0.9} />
      </mesh>
      
      <mesh position={[3.85, 2, -15]} receiveShadow>
        <boxGeometry args={[0.3, 4, 40]} />
        <meshStandardMaterial color="#252525" roughness={0.9} />
      </mesh>
      
      <group position={[0, 0, -5]}>
        <mesh position={[0, 2, 0]} castShadow>
          <boxGeometry args={[0.4, 4, 0.4]} />
          <meshStandardMaterial color="#3a3a3a" />
        </mesh>
        <mesh position={[-2, 2, 0]} castShadow>
          <boxGeometry args={[0.4, 4, 0.4]} />
          <meshStandardMaterial color="#3a3a3a" />
        </mesh>
        <mesh position={[2, 2, 0]} castShadow>
          <boxGeometry args={[0.4, 4, 0.4]} />
          <meshStandardMaterial color="#3a3a3a" />
        </mesh>
        <mesh position={[0, 4.2, 0]} castShadow>
          <boxGeometry args={[4.5, 0.4, 0.4]} />
          <meshStandardMaterial color="#3a3a3a" />
        </mesh>
      </group>
      
      {[-10, -20, -30].map((z, i) => (
        <group key={i} position={[0, 0, z]}>
          <mesh position={[0, 2.5, 0]}>
            <cylinderGeometry args={[0.1, 0.15, 5, 8]} />
            <meshStandardMaterial color="#2a2a2a" />
          </mesh>
          <pointLight position={[0, 2, 0.5]} intensity={0.3} color="#ff4400" distance={5} decay={2} />
        </group>
      ))}
      
      <mesh position={[0, 0.1, -10]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[6, 15]} />
        <meshStandardMaterial color="#1a1a1a" roughness={1} />
      </mesh>
      
      <mesh position={[2, 0.3, -18]} rotation={[0, 0.3, 0]} castShadow>
        <boxGeometry args={[1.2, 0.6, 0.8]} />
        <meshStandardMaterial color="#3a2a1a" roughness={0.8} />
      </mesh>
      
      <mesh position={[-1.5, 0.2, -25]} castShadow>
        <dodecahedronGeometry args={[0.4, 0]} />
        <meshStandardMaterial color="#4a4a5a" roughness={0.9} />
      </mesh>
      
      <group position={[-2.5, 1, -12]}>
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.08, 0.08, 1.5, 6]} />
          <meshStandardMaterial color="#4a4a4a" />
        </mesh>
        <mesh position={[0, 0, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.08, 1.5, 6]} />
          <meshStandardMaterial color="#4a4a4a" />
        </mesh>
      </group>
      
      {[-8, -15, -22, -28].map((z, i) => (
        <mesh key={`stalactite-${i}`} position={[-2.5, 3.8, z]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.3, 1, 6]} />
          <meshStandardMaterial color="#3a3a3a" roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}
