//2 cars
//node js controls

function start_game() {
    var NUM_OBST = 0;


    var camera
    var scene
    var renderer;

    var material;
    var started = false;

    var t0 = new Date().getTime();
    var system;

    var redCar;
    var blueCar;
    var myCar;
    var otherCar;

    function init_obstacles(obstacles) {
	
	$.each(obstacles, function(i, obstacle) {

	    var radius = obstacle.radius;

	    var geometry = new Sphere( radius, 10, 10 );
	    var mesh = new THREE.Mesh( geometry, material );

	    mesh.matrixAutoUpdate = false;
	    mesh.overdraw = true;					

	    mesh.position.x = obstacle.x;
	    mesh.position.y = obstacle.y;
	    mesh.position.z = obstacle.z;

	    scene.addObject( mesh );

	    var sphere = new jiglib.JSphere( null, radius );
	    sphere.set_mass( 4 / 3 * Math.PI * Math.pow( radius, 3 ) );
	    sphere.moveTo( new Vector3D( mesh.position.x, mesh.position.y, mesh.position.z, 0 ) );
	    system.addBody( sphere );

	    mesh.rigidBody = sphere;

	});
    }

    function init_car(initial_pos, color) {
	var width = 4;
	var height = 1;
	var depth = 8;

	var material = new THREE.MeshBasicMaterial( { color: color, opacity: 0.6 });
        
	/*
	var material = new THREE.MeshLambertMaterial({
            map: ImageUtils.loadTexture("red_camouflage.jpg")
        });
	*/

	var mesh = new THREE.Mesh( new Cube( width, height, depth ), material );
	mesh.matrixAutoUpdate = false;
	mesh.overdraw = true;					
	mesh.position.x = 0;
	mesh.position.y = 0;
	mesh.position.z = 0;

	var numSegs = 10;
	var topRad = 1; 
	var botRad = 1; 
	var height = 1;
	var topOffset = 0; 
	var botOffset = 0;

	mesh.wheelFL = new THREE.Object3D();
	mesh.wheelFR = new THREE.Object3D();
	mesh.wheelBL = new THREE.Object3D();
	mesh.wheelBR = new THREE.Object3D();

	mesh.wheelFL.position.x = -2.2; mesh.wheelFL.position.y = -0.5; mesh.wheelFL.position.z = 4;
	mesh.wheelFR.position.x = 2.2; mesh.wheelFR.position.y = -0.5; mesh.wheelFR.position.z = 4;
	mesh.wheelBL.position.x = -2.2; mesh.wheelBL.position.y = -0.5; mesh.wheelBL.position.z = -4;
	mesh.wheelBR.position.x = 2.2; mesh.wheelBR.position.y = -0.5; mesh.wheelBR.position.z = -4;

	mesh.wheelFL.addChild(new THREE.Mesh( new Cylinder( numSegs, topRad, botRad, height, topOffset, botOffset ), material ));
	mesh.wheelFR.addChild(new THREE.Mesh( new Cylinder( numSegs, topRad, botRad, height, topOffset, botOffset ), material ));
	mesh.wheelBL.addChild(new THREE.Mesh( new Cylinder( numSegs, topRad, botRad, height, topOffset, botOffset ), material ));
	mesh.wheelBR.addChild(new THREE.Mesh( new Cylinder( numSegs, topRad, botRad, height, topOffset, botOffset ), material ));

	mesh.wheelFL.children[0].rotation.y = degToRad(90);
	mesh.wheelFR.children[0].rotation.y = degToRad(90);
	mesh.wheelBL.children[0].rotation.y = degToRad(90);
	mesh.wheelBR.children[0].rotation.y = degToRad(90);

	mesh.addChild( mesh.wheelFL );
	mesh.addChild( mesh.wheelFR );
	mesh.addChild( mesh.wheelBL );
	mesh.addChild( mesh.wheelBR );

	scene.addObject( mesh );

	var carBody = new jiglib.JCar(null);

	var maxSteerAngle = 50;
	var steerRate = 3;
	var driveTorque = 300;

	carBody.setCar(maxSteerAngle, steerRate, driveTorque);
	carBody.get_chassis().set_sideLengths(new Vector3D(width, height, depth, 0));
	carBody.get_chassis().moveTo(initial_pos);
	carBody.get_chassis().set_mass(20);

	system.addBody(carBody.get_chassis());

	mesh.carBody = carBody;
	mesh.rigidBody = carBody.get_chassis();

	var wheelRadius = 1;
	var travel = 1;
	var sideFriction = 1.2; //1.2;
	var fwdFriction = 1.2; // 1.2;
	var restingFrac = 0.3; // 0.6; // 0.5;
	var dampingFrac = 0.3; // 0.6;
	var rays = 2;

	carBody.setupWheel(0, new Vector3D(-2.2, -1,  4), sideFriction, fwdFriction, travel, wheelRadius, restingFrac, dampingFrac, rays, false);
	carBody.setupWheel(1, new Vector3D( 2.2, -1,  4), sideFriction, fwdFriction, travel, wheelRadius, restingFrac, dampingFrac, rays, false);
	carBody.setupWheel(2, new Vector3D(-2.2, -1, -4), sideFriction, fwdFriction, travel, wheelRadius, restingFrac, dampingFrac, rays, true);
	carBody.setupWheel(3, new Vector3D( 2.2, -1, -4), sideFriction, fwdFriction, travel, wheelRadius, restingFrac, dampingFrac, rays, true);

	carBody.wheelFL = carBody.get_wheels()[0];
	carBody.wheelFR = carBody.get_wheels()[1];
	carBody.wheelBL = carBody.get_wheels()[2];
	carBody.wheelBR = carBody.get_wheels()[3];

	
	return carBody;
    }

    function init() {

	var container = document.createElement( 'div' );
	document.body.appendChild( container );

	camera = new THREE.Camera( 60, window.innerWidth / window.innerHeight, 1, 10000 );
	camera.position.z = 20;
	camera.position.x = 0;
	camera.position.y = 10;

	scene = new THREE.Scene();

	material = new THREE.MeshNormalMaterial();

	
	redCar = init_car(new Vector3D(10, 0, -20), 0xff0000);
	blueCar = init_car(new Vector3D(-10, 0, -20), 0x0000ff);

	// renderer = new THREE.WebGLRenderer();
	renderer = new THREE.CanvasRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.sortObjects = false;
	container.appendChild( renderer.domElement );

    }


    function init_jiglib() {

	system = jiglib.PhysicsSystem.getInstance();
	// system.setCollisionSystem(); // CollisionSystemBrite
	system.setCollisionSystem(true); // CollisionSystemGrid
	// system.setSolverType("FAST");
	// system.setSolverType("NORMAL");
	system.setSolverType("ACCUMULATED");
	system.setGravity( new Vector3D( 0, -9.8, 0, 0 ) );

	var ground = new jiglib.JPlane();
	ground.set_y(-10);
	ground.set_rotationX(90);
	ground.set_movable(false);				
	system.addBody( ground );

    }


    function animate() {

	requestAnimationFrame( animate );
	updateDynamicsWorld();
	render();

    }

    function degToRad(deg) {
	return (deg*3.14159)/180;
    }

    function radToDeg(rad) {
	return rad*(180/3.14159);
    }

    function updateDynamicsWorld() {

	var t1 = new Date().getTime();
	var ms = t1 - t0;
	t0 = t1;

	system.integrate( ms / 1000 );				

	for ( var i = 0, l = scene.objects.length; i < l; i ++ ) {

	    var mesh = scene.objects[i];

	    if (mesh.rigidBody) {

		var pos = mesh.rigidBody.get_currentState().position;
		var dir = mesh.rigidBody.get_currentState().orientation.get_rawData();

		var matrix = new THREE.Matrix4();
		matrix.setTranslation( pos.x, pos.y, pos.z );
		var rotate = new THREE.Matrix4(dir[0], dir[1], dir[2], dir[3], dir[4], dir[5], 
					       dir[6], dir[7], dir[8], dir[9], dir[10], dir[11], dir[12], dir[13], dir[14], dir[15]);
		matrix.multiplySelf(rotate);


		mesh.matrix = matrix;
		mesh.update(false, true, camera);


	    }

	    if (mesh.carBody) {

		mesh.wheelFL.position.y = mesh.carBody.wheelFL.getActualPos().y;
		mesh.wheelFR.position.y = mesh.carBody.wheelFR.getActualPos().y;
		mesh.wheelBL.position.y = mesh.carBody.wheelBL.getActualPos().y;
		mesh.wheelBR.position.y = mesh.carBody.wheelBR.getActualPos().y;

		mesh.wheelFL.rotation.y = degToRad(mesh.carBody.wheelFL.getSteerAngle());
		mesh.wheelFR.rotation.y = degToRad(mesh.carBody.wheelFR.getSteerAngle());
		mesh.wheelBL.rotation.y = degToRad(mesh.carBody.wheelBL.getSteerAngle());
		mesh.wheelBR.rotation.y = degToRad(mesh.carBody.wheelBR.getSteerAngle());

		mesh.wheelFL.children[0].rotation.x = degToRad(mesh.carBody.wheelFL.getAxisAngle());
		mesh.wheelFR.children[0].rotation.x = degToRad(mesh.carBody.wheelFR.getAxisAngle());
		mesh.wheelBL.children[0].rotation.x = degToRad(mesh.carBody.wheelBL.getAxisAngle());
		mesh.wheelBR.children[0].rotation.x = degToRad(mesh.carBody.wheelBR.getAxisAngle());

		mesh.update(false, true, camera);

	    }

	    camera.lookAt(mesh.position);

	}



    }

    function render() {

	renderer.render( scene, camera );

    }

    function update_status(msg) {
	$('#status').html(msg);
    }

    function updateKeyDown(carBody, keyCode) {
	switch(keyCode)
	{
	case 32:
	    carBody.setHBrake(1);
	    return false;
	case 38:
	    carBody.setAccelerate(1);
	    return false;
	case 40:
	    carBody.setAccelerate(-1);
	    return false;
	case 37:
	    carBody.setSteer([0, 1], 1);
	    return false;
	case 39:
	    carBody.setSteer([0, 1], -1);
	    return false;
	}
    }

    function updateKeyUp(carBody, keyCode)
    {
	switch(keyCode)
	{
	case 32:
	    carBody.setHBrake(0);
	    return false;
	case 38:
	    carBody.setAccelerate(0);
	    return false;
	case 40:
	    carBody.setAccelerate(0);
	    return false;
	case 37:
	    carBody.setSteer([0, 1], 0);
	    return false;
	case 39:
	    carBody.setSteer([0, 1], 0);
	    return false;
	}
    }

   var socket = io.connect('/');

    document.onkeydown = function( e ) {
	if(!started) {
	    return;
	}
	socket.emit('key_down', {
	    keyCode: e.keyCode
	});
	return updateKeyDown(myCar, e.keyCode);
    }
    
    document.onkeyup = function( e ){
	if(!started) {
	    return;
	}
	socket.emit('key_up', {
	    keyCode: e.keyCode
	});
	return updateKeyUp(myCar, e.keyCode);
    }

    init_jiglib();
    init();

    update_status("waiting for game");

    socket.on('start', function(data) {
	update_status("game on!!, you are player: " + data.player);
	if(data.player == 'red') {
	    myCar = redCar;
	    otherCar = blueCar;
	}
	else if(data.player == 'blue') {
	    myCar = blueCar;
	    otherCar = redCar;
	}
	started = true;
	init_obstacles(data.obstacles);
	animate();
    });

    //keyup from other
    socket.on('key_up', function(data) {
	if(started) {
	    updateKeyUp(otherCar, data.keyCode);
	}
    });

    socket.on('key_down', function(data) {
	if(started) {
	    updateKeyDown(otherCar, data.keyCode);
	}
    });

    //announce our precence
    socket.emit('hello');
}