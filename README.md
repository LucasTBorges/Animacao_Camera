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