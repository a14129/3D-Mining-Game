import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160/build/three.module.js";

// ===== SCENE =====
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

const camera = new THREE.PerspectiveCamera(75, innerWidth/innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

// LIGHT
scene.add(new THREE.AmbientLight(0xffffff, 0.7));
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(10,20,10);
scene.add(light);

// ===== WORLD =====
const blocks = [];
const geo = new THREE.BoxGeometry();
const mat = new THREE.MeshLambertMaterial({color:0x44aa44});

function createWorld(){
for(let x=-15;x<15;x++){
for(let z=-15;z<15;z++){

const b = new THREE.Mesh(geo, mat);
b.position.set(x,0,z);

scene.add(b);
blocks.push(b);

}
}
}

createWorld();

// ===== PLAYER =====
camera.position.y = 2;
let velocityY = 0;
let onGround = true;

// ===== STATS =====
let coins = 0;
let broken = 0;

// ===== INPUT =====
const keys = {};

addEventListener("keydown",(e)=>{
keys[e.key]=true;

if(e.code==="Space" && onGround){
velocityY = 0.2;
onGround = false;
}
});

addEventListener("keyup",(e)=>{
keys[e.key]=false;
});

// ===== POINTER LOCK =====
document.getElementById("start").onclick = async () => {
document.getElementById("start").style.display="none";
await document.body.requestPointerLock();
};

// ===== MOUSE LOOK =====
addEventListener("mousemove",(e)=>{
if(document.pointerLockElement===document.body){
camera.rotation.y -= e.movementX * 0.002;
camera.rotation.x -= e.movementY * 0.002;
}
});

// ===== RAYCAST =====
const ray = new THREE.Raycaster();

// BREAK BLOCK
addEventListener("click",()=>{
ray.setFromCamera({x:0,y:0},camera);

const hit = ray.intersectObjects(blocks);

if(hit.length){
scene.remove(hit[0].object);
blocks.splice(blocks.indexOf(hit[0].object),1);

coins += 10;
broken++;

updateUI();
}
});

// PLACE BLOCK
addEventListener("contextmenu",(e)=>{
e.preventDefault();

ray.setFromCamera({x:0,y:0},camera);

const hit = ray.intersectObjects(blocks);

if(hit.length){

const pos = hit[0].object.position.clone();
pos.y += 1;

const newBlock = new THREE.Mesh(geo, mat);
newBlock.position.copy(pos);

scene.add(newBlock);
blocks.push(newBlock);

}
});

// ===== COLLISION (SIMPLE) =====
function canMove(x,z){
for(let b of blocks){
const dx = x - b.position.x;
const dz = z - b.position.z;

if(Math.sqrt(dx*dx + dz*dz) < 0.5){
return false;
}
}
return true;
}

// ===== UI =====
function updateUI(){
document.getElementById("coins").innerText = coins;
document.getElementById("blocks").innerText = broken;
}

// ===== LOOP =====
function animate(){
requestAnimationFrame(animate);

let speed = 0.08;

// movement
let nx = camera.position.x;
let nz = camera.position.z;

if(keys["w"]){
nx -= Math.sin(camera.rotation.y)*speed;
nz -= Math.cos(camera.rotation.y)*speed;
}
if(keys["s"]){
nx += Math.sin(camera.rotation.y)*speed;
nz += Math.cos(camera.rotation.y)*speed;
}
if(keys["a"]){
nx -= Math.cos(camera.rotation.y)*speed;
nz += Math.sin(camera.rotation.y)*speed;
}
if(keys["d"]){
nx += Math.cos(camera.rotation.y)*speed;
nz -= Math.sin(camera.rotation.y)*speed;
}

// apply collision
if(canMove(nx,nz)){
camera.position.x = nx;
camera.position.z = nz;
}

// gravity
velocityY -= 0.01;
camera.position.y += velocityY;

if(camera.position.y <= 2){
camera.position.y = 2;
velocityY = 0;
onGround = true;
}

renderer.render(scene,camera);
}

animate();

addEventListener("resize",()=>{
camera.aspect = innerWidth/innerHeight;
camera.updateProjectionMatrix();
renderer.setSize(innerWidth,innerHeight);
});