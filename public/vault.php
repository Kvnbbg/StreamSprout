<?php
// Start the session (if needed)
session_start();
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vault Animation</title>
    <link rel="stylesheet" href="styles.css"> <!-- Link to your CSS file -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <style>
        /* Inline CSS for simplicity */
        body {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            background-color: #f0f0f0;
        }
    </style>
</head>
<body>
    <div id="vault" onclick="toggleVault()">
        Vault
    </div>
    <div id="threejs-container" style="width: 100%; height: 400px;"></div>

    <script>
        let scene, camera, renderer, vaultMesh;

        function initThree() {
            scene = new THREE.Scene();
            camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            renderer = new THREE.WebGLRenderer();
            renderer.setSize(window.innerWidth, window.innerHeight * 0.4);
            document.getElementById('threejs-container').appendChild(renderer.domElement);

            const geometry = new THREE.BoxGeometry(1, 1, 1);
            const material = new THREE.MeshBasicMaterial({ color: 0x333333 });
            vaultMesh = new THREE.Mesh(geometry, material);
            scene.add(vaultMesh);

            camera.position.z = 5;
            animate();
        }

        function animate() {
            requestAnimationFrame(animate);
            vaultMesh.rotation.y += 0.01; // Continuous rotation
            renderer.render(scene, camera);
        }

        function toggleVault() {
            const vaultElement = document.getElementById('vault');
            vaultElement.classList.toggle('vault-open');
            vaultMesh.rotation.y += Math.PI; // Flip the 3D vault
        }

        window.onload = initThree;

        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight * 0.4);
        });
    </script>
</body>
</html>
