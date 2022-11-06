import {
  Scene,
  WebGLRenderer,
  PerspectiveCamera,
  Mesh,
  PlaneGeometry,
  MeshStandardMaterial,
  AmbientLight, Color,
  AxesHelper
} from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

import { getElement } from '../../utils'

const canvas = getElement('#app-stage') as HTMLCanvasElement

const scene = new Scene()

const camera = new PerspectiveCamera(75, canvas.width / canvas.height, 0.1, 2000)
camera.position.set(-2, 2, 3)
scene.add(camera)

const plane = new PlaneGeometry(2, 3)

const material = new MeshStandardMaterial({})

const mesh = new Mesh(plane, material)
scene.add(mesh)

const ambient = new AmbientLight(new Color(0xffffff), 1)
scene.add(ambient)

const axesHelper = new AxesHelper()
scene.add(axesHelper)

const renderer = new WebGLRenderer({
  canvas
})
renderer.setSize(canvas.width, canvas.height)

const control = new OrbitControls(camera, canvas)

const tick = () => {
  renderer.render(scene, camera)
  control.update()
  requestAnimationFrame(tick)
}

tick()
