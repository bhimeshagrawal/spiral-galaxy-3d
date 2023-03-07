import './style/main.css'
import * as THREE from 'three'
import * as dat from 'dat.gui'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'



// sizes and event listeners
const sizes = {}
sizes.width = window.innerWidth
sizes.height = window.innerHeight
window.addEventListener('resize', () => {
    // Save sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()
    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
})
window.addEventListener('dblclick', () => {
    const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement
    if (!fullscreenElement) {
        if (canvas.requestFullscreen) {
            canvas.requestFullscreen()
        } else if (canvas.webkitRequestFullscreen) {
            canvas.webkitRequestFullscreen()
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen()
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen()
        }
    }
})



// GUI
const gui = new dat.GUI()



// Scene
const scene = new THREE.Scene()



// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 5
camera.position.y = 1
scene.add(camera)



// particles
let geometry = null
let material = null
let points = null
const parameters = {}
parameters.count = 100000
parameters.size = 0.01
parameters.radius = 10
parameters.spin = 1.5
parameters.branches = 5
parameters.deRandomnessPower = 2
parameters.insideColor = "#eb8cf2"
parameters.outsideColor = "#0946e3"
const generateGalaxy = () => {
    if (points !== null) {
        geometry.dispose()
        material.dispose()
        scene.remove(points)
    }
    geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(parameters.count * 3)
    const colors = new Float32Array(parameters.count * 3)
    const colorInside = new THREE.Color(parameters.insideColor)
    const colorOutside = new THREE.Color(parameters.outsideColor)
    for (let i = 0; i < parameters.count; i++) {
        const i3 = i * 3;
        const radius = Math.random() * parameters.radius
        const spinAngle = radius * parameters.spin
        const branchAngle = (i % parameters.branches) / parameters.branches * Math.PI * 2
        console.log(Math.cos(branchAngle) * radius)
        const randomX = (Math.pow(Math.random() - 0.5, parameters.deRandomnessPower) * (Math.random() < 0.5 ? 1 : -1))
        const randomY = Math.pow(Math.random() - 0.5, parameters.deRandomnessPower) * (Math.random() < 0.5 ? 1 : -1)
        const randomZ = Math.pow(Math.random() - 0.5, parameters.deRandomnessPower) * (Math.random() < 0.5 ? 1 : -1)
        positions[i3 + 0] = Math.cos(branchAngle + spinAngle) * radius + randomX
        positions[i3 + 1] = randomY
        positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ
        const mixedColor = colorInside.clone()
        mixedColor.lerp(colorOutside, radius / parameters.radius)
        colors[i3 + 0] = mixedColor.r
        colors[i3 + 1] = mixedColor.g
        colors[i3 + 2] = mixedColor.b
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    material = new THREE.PointsMaterial({
        size: parameters.size,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true
    })
    points = new THREE.Points(geometry, material)
    scene.add(points)
}
gui.add(parameters, 'size').min(0.001).max(0.1).step(0.001).onFinishChange(generateGalaxy)
gui.add(parameters, 'count').min(10).max(200000).step(100).onFinishChange(generateGalaxy)
gui.add(parameters, 'branches').min(1).max(20).step(1).onFinishChange(generateGalaxy)
gui.add(parameters, 'spin').min(-5).max(5).step(1).onFinishChange(generateGalaxy)
gui.add(parameters, 'radius').min(2).max(20).step(1).onFinishChange(generateGalaxy)
gui.add(parameters, 'deRandomnessPower').min(0).max(5).step(1).onFinishChange(generateGalaxy)
gui.addColor(parameters, 'insideColor').onFinishChange(generateGalaxy)
gui.addColor(parameters, 'outsideColor').onFinishChange(generateGalaxy)
generateGalaxy()



// Renderer
const canvas = document.querySelector('.webgl')
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setSize(sizes.width, sizes.height)



// controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true



// Loop
const clock = new THREE.Clock()
const loop = () => {
    const elapsedTime = clock.getElapsedTime()
    points.rotation.y = elapsedTime * Math.PI / 2
    controls.update();
    renderer.render(scene, camera)
    window.requestAnimationFrame(loop)
}
loop()