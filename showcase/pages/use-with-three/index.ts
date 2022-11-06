import {
  AmbientLight,
  BoxGeometry,
  CanvasTexture,
  DoubleSide, Group,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  PlaneGeometry, PointLight,
  Scene,
  WebGLRenderer
} from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { SVGAPlus } from '@svgaplus/core'

import { getElement } from '../../utils'

const canvas = getElement('#app-stage') as HTMLCanvasElement
const camera = new PerspectiveCamera(75, canvas.width / canvas.height, 0.1, 2000)
const svgaMaterial = new MeshStandardMaterial({
  side: DoubleSide,
  transparent: true
})
const renderer = new WebGLRenderer({
  canvas,
  alpha: true
})
renderer.shadowMap.enabled = true

const setSize = () => {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  camera.aspect = canvas.width / canvas.height
  camera.updateProjectionMatrix()
  renderer.setSize(canvas.width, canvas.height)
}

const initThree = async () => {
  const scene = new Scene()

  camera.position.set(5, 3, 3)
  scene.add(camera)

  const control = new OrbitControls(camera, canvas)
  control.enableDamping = true
  control.dampingFactor = 0.05

  const boardGroup = new Group()

  const fbxLoader = new FBXLoader()
  const board = await fbxLoader.loadAsync('/board/board.fbx')
  board.scale.set(0.12, 0.1, 0.12)
  board.position.set(0, 0, 0)
  board.traverse(obj => {
    if (obj instanceof Mesh) {
      obj.castShadow = true
    }
  })
  boardGroup.add(board)

  const svgaMesh = new Mesh(new PlaneGeometry(3, 4.2), svgaMaterial)
  svgaMesh.rotateY(Math.PI / (180 / 90))
  svgaMesh.position.set(0.245, 2.4, 1.8)
  boardGroup.add(svgaMesh)

  const boardLights = [
    [9, 43, 24],
    [9, 43, 5.8]
  ] as [number, number, number][]
  boardLights.forEach(position => {
    const light = new PointLight('#ffffff', 1.2, 5, 1)
    light.position.set(...position)
    light.scale.set(10, 10, 10)
    board.add(light)
  })

  boardGroup.position.set(0, 0, -2.2)
  boardGroup.rotateY(Math.PI / (180 / -45))
  scene.add(boardGroup)

  const groundGroup = new Group()
  const groundUpper = new Mesh(
    new BoxGeometry(5, 0.25, 5),
    new MeshStandardMaterial({
      color: '#5EB569'
    })
  )
  groundUpper.receiveShadow = true
  const groundLower = new Mesh(
    new BoxGeometry(5, 0.25, 5),
    new MeshStandardMaterial({
      color: '#877167'
    })
  )
  groundLower.position.y = -0.25
  groundGroup.add(groundUpper)
  groundGroup.add(groundLower)
  scene.add(groundGroup)

  const ambientLight = new AmbientLight(0xffffff, 0.3)
  scene.add(ambientLight)

  const pointLight = new PointLight('#fdf4e5', 0.2, 20, 0.2)
  pointLight.position.set(2, 3, 0)
  pointLight.castShadow = true
  scene.add(pointLight)

  const tick = () => {
    renderer.render(scene, camera)
    control.update()
    requestAnimationFrame(tick)
  }

  tick()
}

const initSvga = async () => {
  const canvas = document.createElement('canvas')
  const svgaBuffer = await SVGAPlus.loadSvgaFile('/tv.svga')

  const player = new SVGAPlus({
    element: canvas,
    buffer: svgaBuffer
  })

  await player.init()
  player.play()

  const tick = () => {
    svgaMaterial.map = new CanvasTexture(canvas)
    svgaMaterial.needsUpdate = true
    requestAnimationFrame(tick)
  }
  tick()
}

window.addEventListener('resize', setSize)
setSize()
await initSvga()
await initThree()
