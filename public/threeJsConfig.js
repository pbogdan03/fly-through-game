var renderer = new THREE.WebGLRenderer({
  antialias: true
}),
scene = new THREE.Scene(),
camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 10000),

// Lights
ambient_light     = new THREE.AmbientLight(0x222222),
directional_light = new THREE.DirectionalLight(0xffffff, 1),

// Used to load JSON models
loader = new THREE.JSONLoader(),

// Floor mesh
floor = new THREE.Mesh(new THREE.PlaneBufferGeometry(300,300), new THREE.MeshLambertMaterial({color: 0x22FF11})),

// Render loop
render = function(){

  // Render using scene and camera
  renderer.render(scene, camera);

  if (ship) { 
    
    // Rotate ship
    if (controller_state.steer) {

      // Gives a number ranging from 0 to 1
      var percentage_speed = (speed / 2);

      // Rotate the ship using the steer value
      // Multiplying it by the percentage speed makes the ship not turn
      // unless accelerating and turns quicker as the speed increases.
      ship.rotateY(controller_state.steer * percentage_speed);
    }

    // If controller is accelerating
    if (controller_state.accelerate) {

      // Add to speed until it is 2
      if (speed < 2) {
        speed += 0.05;
      } else {
        speed = 2;
      }

    // If controller is not accelerating
    } else {

      // Subtract from speed until 0
      if (0 < speed) {
        speed -= 0.05;
      } else {
        speed = 0;
      }
    }

    // Move ship "forward" at speed
    ship.translateZ(speed);

    // Collisions
    if (ship.position.x > 150) {
      ship.position.x = 150;
    }
    if (ship.position.x < -150) {
      ship.position.x = -150;
    }
    if (ship.position.z > 150) {
      ship.position.z = 150;
    }
    if (ship.position.z < -150) {
      ship.position.z = -150;
    }
  }
    
  // Call self
  requestAnimationFrame(render);
},
ship;

var speed = 0,
controller_state = {};

// Enable shadows
renderer.shadowMapEnabled = true;

// Moves the camera "backward" (z) and "up" (y)
camera.position.z = -300;
camera.position.y = 100;

// Points the camera at the center of the floor
camera.lookAt(floor.position);

// Moves the directional light
directional_light.position.y = 150; // "up" / "down"
directional_light.position.x = -100; // "left" / "right"
directional_light.position.z = 60; // "forward" / "backward"

// Make the light able to cast shadows
directional_light.castShadow = true;

// Rotates the floor 90 degrees, so that it is horizontal
floor.rotation.x = -90 * (Math.PI / 180)

// Make the floor able to recieve shadows
floor.receiveShadow = true;

// Add camera, lights and floor to the scene
scene.add(camera);
scene.add(ambient_light);
scene.add(directional_light);
scene.add(floor);

// Load the ship model
loader.load(
  'ship.js',

  function ( geometry, materials ) {

    // Create the mesh from loaded geometry and materials
    var material = new THREE.MeshFaceMaterial( materials );
    ship = new THREE.Mesh( geometry, material );

    // Can cast shadows
    ship.castShadow = true;

    // Add to the scene
    scene.add( ship );
  }
)

// Set size of renderer using window dimensions
renderer.setSize(window.innerWidth, window.innerHeight);

// Append to DOM
document.body.appendChild(renderer.domElement);

// This sets off the render loop
render();