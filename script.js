let renderer,
    camera,
    planet,
    moon,
    moon2,
    sphereBg,
    terrainGeometry,
    container = document.getElementById("canvas_container"),
    timeout_Debounce,
    frame = 0,
    cameraDx = 0.05,
    count = 0,
    t = 0,
    t2= 0;

/*   Lines values  */
let lineTotal = 1000;
let linesGeometry = new THREE.BufferGeometry();
linesGeometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(6 * lineTotal), 3));
linesGeometry.setAttribute("velocity", new THREE.BufferAttribute(new Float32Array(2 * lineTotal), 1));
let l_positionAttr = linesGeometry.getAttribute("position");
let l_vertex_Array = linesGeometry.getAttribute("position").array;
let l_velocity_Array = linesGeometry.getAttribute("velocity").array;


init();
animate();


function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color("#000000");
    scene.fog = new THREE.Fog("#3c1e02", 0.5, 50);

    camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.01, 1000)
    camera.position.set(0, 1, 32)

    pointLight1 = new THREE.PointLight("#ffffff", 1, 0);
    pointLight1.position.set(0, 30, 30);
    scene.add(pointLight1);

    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    const loader = new THREE.TextureLoader();

    // Planet
    const texturePlanet = loader.load('https://i0.wp.com/narceliodesa.com/wp-content/uploads/2013/06/1.jpg');
    texturePlanet.anisotropy = 16;
    const planetGeometry = new THREE.SphereBufferGeometry(10, 50, 50);
    const planetMaterial = new THREE.MeshLambertMaterial({
        map: texturePlanet,
        fog: false
    });
    planet = new THREE.Mesh(planetGeometry, planetMaterial);
    planet.position.set(0, 8, -30);
    scene.add(planet);


    //Moon
    const textureMoon = loader.load('https://i.ibb.co/64zn361/moon-ndengb.jpg');
    textureMoon.anisotropy = 16;
    let moonGeometry = new THREE.SphereBufferGeometry(2, 32, 32);
    let moonMaterial = new THREE.MeshPhongMaterial({
        map: textureMoon,
        fog: false
    });
    moon = new THREE.Mesh(moonGeometry, moonMaterial);
    moon.position.set(0, 8, 0);
    scene.add(moon);

    //Moon2
    const textureMoon2 = loader.load('data:image/png;base64,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');
    textureMoon2.anisotropy = 16;
    let moon2Geometry = new THREE.SphereBufferGeometry(2, 32, 32);
    let moon2Material = new THREE.MeshPhongMaterial({
        map: textureMoon2,
        fog: false
    });
    moon2 = new THREE.Mesh(moon2Geometry, moon2Material);
    moon.position.set(0, 8, 0);
    scene.add(moon2);

    // Sphere Background 
    const textureSphereBg = loader.load('https://i.ibb.co/JCsHJpp/stars2-qx9prz.jpg');
    textureSphereBg.anisotropy = 16;
    const geometrySphereBg = new THREE.SphereBufferGeometry(150, 32, 32);
    const materialSphereBg = new THREE.MeshBasicMaterial({
        side: THREE.BackSide,
        map: textureSphereBg,
        fog: false
    });
    sphereBg = new THREE.Mesh(geometrySphereBg, materialSphereBg);
    sphereBg.position.set(0, 50, 0);
    scene.add(sphereBg);


    //  Stars
    for (let i = 0; i < lineTotal; i++) {
        let x = THREE.MathUtils.randInt(-100, 100);
        let y = THREE.MathUtils.randInt(-30, 40);
        if (x < 7 && x > -7 && y < 20) x += 14;
        let z = THREE.MathUtils.randInt(0, -300);

        l_vertex_Array[6 * i + 0] = l_vertex_Array[6 * i + 3] = x;
        l_vertex_Array[6 * i + 1] = l_vertex_Array[6 * i + 4] = y;
        l_vertex_Array[6 * i + 2] = l_vertex_Array[6 * i + 5] = z;

        l_velocity_Array[2 * i] = l_velocity_Array[2 * i + 1] = 0;
    }
    let starsMaterial = new THREE.LineBasicMaterial({
        color: "#ffffff",
        transparent: true,
        opacity: 0.5,
        fog: false
    });
    let lines = new THREE.LineSegments(linesGeometry, starsMaterial);
    linesGeometry.getAttribute("position").setUsage(THREE.DynamicDrawUsage);
    scene.add(lines);
}



function animate() {
    planet.rotation.y += 0.002;
    sphereBg.rotation.x += 0.002;
    sphereBg.rotation.y += 0.002;
    sphereBg.rotation.z += 0.002;


    // Moon Animation
    moon.rotation.y -= 0.007;
    moon.rotation.x -= 0.007;
    moon.position.x = 15 * Math.cos(t) + 0;
    moon.position.z = 20 * Math.sin(t) - 35;
    t += 0.015;

    // Moon Animation
    moon2.rotation.y -= 0.007;
    
    moon2.position.x = 30 * Math.cos(t2) + 0;
    moon2.position.z = 40 * Math.sin(t2) - 35;
    t2 += 0.0015;

    //   Stars Animation  
    for (let i = 0; i < lineTotal; i++) {
        l_velocity_Array[2 * i] += 0.0049;
        l_velocity_Array[2 * i + 1] += 0.005;

        l_vertex_Array[6 * i + 2] += l_velocity_Array[2 * i];
        l_vertex_Array[6 * i + 5] += l_velocity_Array[2 * i + 1];

        if (l_vertex_Array[6 * i + 2] > 50) {
            l_vertex_Array[6 * i + 2] = l_vertex_Array[6 * i + 5] = THREE.MathUtils.randInt(-200, 10);
            l_velocity_Array[2 * i] = 0;
            l_velocity_Array[2 * i + 1] = 0;
        }
    }


    //Camera Movement
    camera.position.x += cameraDx;
    camera.position.y = -1.2 * (1 - Math.abs(frame / 2000 - 0.5) / 0.5);
    camera.lookAt(0, 0, 0);
    frame += 8;
    if (frame > 2000) frame = 0;
    if (camera.position.x > 18) cameraDx = -cameraDx;
    if (camera.position.x < -18) cameraDx = Math.abs(cameraDx);


    l_positionAttr.needsUpdate = true;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}




/*     Resize     */
window.addEventListener("resize", () => {
    clearTimeout(timeout_Debounce);
    timeout_Debounce = setTimeout(onWindowResize, 80);
});
function onWindowResize() {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}
