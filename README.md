# Project Report 1 - MATA65 (Computer Graphics)
## Introduction
This repository contains the final project for Unit 1 of the MATA65 - Computer Graphics course at UFBA (2024.2 semester), taught by Professor [Antônio Apolinário](https://computacao.ufba.br/pt-br/antonio-lopes-apolinario-junior), who provided the project specifications.

The goal was to develop an application using the [Three.js](https://threejs.org/) library to visualize a scene from two simultaneous perspectives: a static camera and a camera that follows an agent (a 3D model) traveling along a looped path.

Key requirements included:
 - The ability to switch between First Person, Third Person, and "Normal Drone" perspectives for the avatar view.
 - Smooth and realistic camera movement.
 - Controls to pause and play the animation.

## 3D Models
<img src="./imgs/bookModel.png" alt="3D Environment Model" width="500"/>
<img src="./imgs/passaro.png" alt="3D Avatar Model" width="500"/>

The project specifications allowed creative freedom for choosing the models. For the environment, I chose a [Medieval Fantasy Book](https://sketchfab.com/3d-models/medieval-fantasy-book-06d5a80a04fc4c5ab552759e9a97d91a) by user [Pixel](https://sketchfab.com/stefan.lengyel1) on Sketchfab. For the avatar, I opted for a [Low Poly Bird](https://sketchfab.com/3d-models/low-poly-bird-942ffdab96bb48a7bb1612b461386310) by user [AlexFerrart3D](https://sketchfab.com/alexferrart3D).

## Camera Movement

**Translation:** To create a fluid trajectory, the camera moves along a [Catmull-Rom spline](https://www.cs.cmu.edu/~fp/courses/graphics/asst5/catmullRom.pdf). This parametric curve is interpolating, meaning the defined control points are part of the generated path, allowing for precise circuit design. I utilized the [Three.js implementation](https://threejs.org/docs/#api/en/extras/curves/CatmullRomCurve3) of this curve.

**Rotation:** A benefit of the Catmull-Rom spline is its $C^1$ continuity. I used the curve's tangent to determine the camera's direction at any given point, ensuring natural orientation.

## Simultaneous Views

<img src="./imgs/moinho.png" alt="Frame captured during animation" width="500"/>

Each frame features two simultaneous views. On the left is a [Perspective Camera](https://threejs.org/docs/#api/en/cameras/PerspectiveCamera) that follows the avatar. On the right is an [Orthographic Camera](https://threejs.org/docs/#api/en/cameras/OrthographicCamera) (parallel projection) that remains static.

The orthographic view displays elements not visible in the first view:
 - A [Camera Helper](https://threejs.org/docs/#api/en/helpers/CameraHelper) for the active perspective camera.
 - A red curve showing the camera's trajectory (can be toggled via GUI).
 - Cyan spheres representing the control points. Using [InstancedMesh](https://threejs.org/docs/#api/en/objects/InstancedMesh), I optimized performance by reducing draw calls, as all spheres share the same geometry and material.

## Camera Modes

The application allows switching between First Person, Third Person, and Normal Drone views. I also included a "Cinematic" option.

---
 
 ### First Person:
 <img src="./imgs/firstPerson.png" alt="First Person View" width="350"/>
 Positioned to simulate the bird's experience, with the view partially obstructed by its beak.

---
  
 ### Third Person:
 <img src="./imgs/thirdPerson.png" alt="Third Person View" width="350"/>
 Positioned behind and slightly above the bird.

---

### Normal Drone:
 <img src="./imgs/droneNormal.png" alt="Normal Drone View" width="350"/>
 Similar to first person, but with an unobstructed view.

---

### Cinematic:
 <img src="./imgs/cinematica.png" alt="Cinematic View" width="350"/>
 This view stays at a fixed distance from the avatar but only shares translation transformations. This allows the viewer to see the bird from different angles as it rotates along the path. The rotation of this camera around the bird can be controlled manually via the GUI.

---

To position these cameras relative to the bird, I used Three.js [Groups](https://threejs.org/docs/?q=group#api/en/objects/Group). A "Translation Group" handles the spline movement, and a nested "Rotation Group" handles the orientation. The bird and the first three cameras are inside the rotation group, while the Cinematic camera is in the parent translation group, isolating it from the bird's automatic rotations.

## The Circuit

The flight path is interpolated from 12 points, following this route:
 1. Over the waterfall.
 2. Under the bridge near the fisherman.
 3. Over the deer.
 4. Around the windmill.
 5. Between the castle towers, followed by a "dive" through the building's doors.
 6. Right turn at the gray-roofed house.
 7. Over the sheep.
 8. Return to the starting point.

## Free Camera Mode
To assist in path creation, I added a "Free Exploration" mode using [Fly Controls](https://threejs.org/docs/#examples/en/controls/FlyControls). This allows free navigation to find coordinates for the spline points, which can be read from the "Information" debug panel.

## GUI (Graphical Interface)

<img src="./imgs/gui.png" alt="lil-gui interface" width="250"/>

Built with [lil-gui](https://lil-gui.georgealways.com/), the interface manages the following settings:

**Camera:**
 - **camera**: Dropdown to select the active perspective view (FirstPerson, ThirdPerson, NormalDrone, or Cinematic).
 - **CameraAngle**: Controls the rotation of the Cinematic camera around the bird.
 - **FOV**: Adjusts the Field of View.
 - **Far**: Adjusts the camera's far clipping plane.

**Animation:**
 - **AutoPlay (Play/Pause)**: Resumes or pauses the flight.
 - **Speed**: Adjusts the animation playback speed.
 - **t (Playback)**: Manually adjust or view the current position on the spline.

**Others:**
 - **Gravity**: Influences speed based on orientation; the bird accelerates when diving.
 - **ShowPath**: Toggles visibility of the trajectory curve.
 - **ShowKeyPoints**: Toggles visibility of the control point spheres.
 - **Information**: Toggles the debug information panel.

 ## Create your own circuit

To create a custom flight path, modify the `keypoints` array in `src/js/Circuito.js`. Each point is defined using `new THREE.Vector3(x, y, z)`, where `x`, `y`, and `z` are the coordinates in the 3D space. In order to assist in finding suitable coordinates, you can use the Free Camera mode as previously mentioned to navigate the scene and note down the desired positions. Check the "Information" checkbox on the Controls lil-gui menu in order to see debugging information, including the camera's position ("World Position") and move to the desired locations. Make sure to maintain the order of the points to ensure a smooth flight path.
By modifying the `t` property in `initValues`, you can set the initial position of the camera along the spline when the application starts. The value of `t` should be between `0` and `1`, where `0` represents the start of the path and `1` represents the end (which loops back to the start in this case). Adjusting this value allows you to control where the camera begins its journey along the defined circuit and, consequently, the initial orientation for the bird.

## Use your own 3d avatar model

To use your own 3D avatar model, replace the gltf path on the initModels method in `src/js/Aplicacao.js`. You may need to adjust the scale and rotation parameters to fit your model properly within the scene on the loadMeshToCameras method.
```