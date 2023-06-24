
window.addEventListener('scroll', function() {
  var tabContainer = document.querySelector('.tab-container');
  if (window.scrollY > 0) {
    tabContainer.classList.add('active');
  } else {
    tabContainer.classList.remove('active');
  }
});




// Xử lý sự kiện khi click vào tab
const tabs = document.querySelectorAll('.tab');
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        // Ẩn tất cả các section trước khi hiển thị section mới
        document.querySelectorAll('section').forEach(section => {
            section.style.display = 'none';
        });

        // Hiển thị section tương ứng với tab được click
        document.querySelector(`#${tab.dataset.tab}`).style.display = 'block';
        
    });
});
const tab = document.querySelectorAll('.tab');
  
// Lặp qua từng tab và thêm sự kiện click
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    // Lấy giá trị của thuộc tính data-tab của tab được click
    const tabId = tab.getAttribute('data-tab');
    
    // Chuyển hướng đến tab tương ứng
    window.location.hash = tabId;
  });
});


const popupImages = document.querySelectorAll('.popup-image');
const popups = document.querySelectorAll('.popup');
const closeButtons = document.querySelectorAll('.close-btn');

popupImages.forEach((image, index) => {
  image.addEventListener('click', () => {
    popups[index].style.display = 'block';
  });
});

closeButtons.forEach((button, index) => {
  button.addEventListener('click', () => {
    popups[index].style.display = 'none';
  });
});

window.addEventListener('click', (e) => {
  popups.forEach((popup) => {
    if (e.target === popup) {
      popup.style.display = 'none';
    }
  });
});


var video = document.getElementById("myVideo1");
  video.addEventListener("ended", function() {
    video.play();
  });



 // key features
            //      3d animation
            //      3d navigation

            let renderer,
                scene,
                camera,
                activeCamera,
                controls,
                container = document.getElementById("canvas-containers"),
                timeout_Debounce,
                planetNodes = [], 
                orbits = [],
                sun,
                timestamp = 0,
                currentNode,
                uniforms,
                metadata = {
                    urls: {
                        sun: {
                            surfaceMaterial: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/297733/sunSurfaceMaterial.jpg',
                            atmosphereMaterial: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/297733/sunAtmosphereMaterial.png'
                        }
                    }
                };

            const saturnRings = ['#3b2d27', '#876f5b', '#735c49', '#5e4a3d', '#3b2d27', '#241f1e', '#241f1e', '#735c49', '#735c49', '#735c49', '#5e4a3d', '#5e4a3d', '#3b2d27', '#3b2d27', '#3b2d27']

            const planets = {
                "mercury": {radius: 1, orbitRadius: 33, speed: 5, rotationSpeed: 0.01},
                "venus": {radius: 2, orbitRadius: 48, speed: 3, rotationSpeed: 0.005},
                "earth": {radius: 2.5, orbitRadius: 55, speed: 4, rotationSpeed: 0.02},
                "mars": {radius: 1.5, orbitRadius: 72, speed: 2, rotationSpeed: 0.01},
                "jupiter": {radius: 8, orbitRadius: 90, speed: 0.8, rotationSpeed: 0.04},
                "saturn": {radius: 6, orbitRadius: 120, speed: 0.5, rotationSpeed: 0.02},
                "uranus": {radius: 4, orbitRadius: 140, speed: 0.4, rotationSpeed: 0.01},
                "neptune": {radius: 4, orbitRadius: 180, speed: 0.2, rotationSpeed: 0.01}
            }

            const MEDIA_PREFIX = 'https://brynmtchll.github.io/codepen-assets/solar-system/';



            init();
            animate();
            // onWindowResize();


            function init() {
                scene = new THREE.Scene();

                // lighting
                let ambientLight = new THREE.AmbientLight("#ffffff", 0.4);
                ambientLight.position.set(0, 20, 20);
                scene.add(ambientLight);
            
                let pointLight = new THREE.PointLight(0xFFFFFF, 2.5);
                scene.add(pointLight);

                renderer = new THREE.WebGLRenderer({
                    antialias: true,
                    alpha: true
                });
                renderer.setSize(container.clientWidth, container.clientHeight);
                renderer.setPixelRatio(window.devicePixelRatio);
                container.appendChild(renderer.domElement);

                // main camera and orbit controls
                camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.01, 1000);
                camera.position.set(0,100,230);

                controls = new THREE.OrbitControls(camera, renderer.domElement);
                controls.autoRotate = true;
                controls.autoRotateSpeed = 0.5;
                controls.maxDistance = 400;
                controls.minDistance = 80;
                controls.enablePan = false;


                // globe background
                {
                    let loader = new THREE.TextureLoader(),
                        texture = loader.load('https://i.ibb.co/4gHcRZD/bg3-je3ddz.jpg');

                    texture.anisotropy = 20;

                    let geometry = new THREE.SphereBufferGeometry(200, 60, 60),
                        material = new THREE.MeshBasicMaterial({
                        side: THREE.BackSide,
                        map: texture,
                    });

                    globe = new THREE.Mesh(geometry, material);
                    scene.add(globe);
                }
                
            //   sun
                {
                    let fragmentShader =  `uniform float time;
                        uniform sampler2D texture1;
                        uniform sampler2D texture2;
                        varying vec2 texCoord;
                        void main( void ) {
                        vec4 noise = texture2D( texture1, texCoord );
                        vec2 T1 = texCoord + vec2( 1.5, -1.5 ) * time  * 0.01;
                        vec2 T2 = texCoord + vec2( -0.5, 2.0 ) * time *  0.01;
                        T1.x -= noise.r * 2.0;
                        T1.y += noise.g * 4.0;
                        T2.x += noise.g * 0.2;
                        T2.y += noise.b * 0.2;
                        float p = texture2D( texture1, T1 * 2.0 ).a + 0.3;
                        vec4 color = texture2D( texture2, T2 );
                        vec4 temp = color * 3.0 * ( vec4( p + 0.1, p - 0.2, p + 0.5, p + 0.5) ) + ( color * color);
            
                        gl_FragColor = temp;
                        }`;
                    let vertexShader = `varying vec2 texCoord;
                        void main() {
                            texCoord = uv;
                            vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
                            gl_Position = projectionMatrix * mvPosition;
                        }`;
            

                    let loader = new THREE.TextureLoader(),
                        textureSun1 = loader.load(metadata.urls.sun.atmosphereMaterial),
                        textureSun2 = loader.load(metadata.urls.sun.surfaceMaterial);
                    uniforms = {
                        time: {type: "f", value: 1.0},
                        texture1: {
                            type: "t",
                            value: 0,
                            texture: textureSun1
                        },
                        texture2: {
                            type: "t",
                            value: textureSun2,
                        }
                    };

                    let material = new THREE.ShaderMaterial({
                            uniforms: uniforms,
                            vertexShader: vertexShader,
                            fragmentShader: fragmentShader
                        }),
                        geometry = new THREE.SphereGeometry(28, 64, 64);
                    sun = new THREE.Mesh(geometry, material);

                    scene.add(sun);
                }
                
            //     planets
                let createPlanet = function(name, radius, orbitRadius) {
                    
                    // create planet
                    let loader = new THREE.TextureLoader(),
                        texture = loader.load( MEDIA_PREFIX + name + '.jpeg' ),
                        geometry = new THREE.SphereGeometry(radius, 32, 16),
                        material = new THREE.MeshLambertMaterial({map: texture,}),
                        planet = new THREE.Mesh(geometry, material);
                    
                    // saturn rings
                    if (name == "saturn") {
                        for (let i = 0; i < saturnRings.length; i++) {
                            let ringGeometry = new THREE.RingGeometry( i/4 + 6.5, i/4 + 6.75, 32 ),
                            ringMaterial = new THREE.MeshBasicMaterial( { color: saturnRings[i], side: THREE.DoubleSide } ),
                            ring = new THREE.Mesh( ringGeometry, ringMaterial );
                            ring.rotation.x = Math.PI/2;
                            planet.add(ring);
                        }  
                    }
                    
                    scene.add(planet);
                
                    // planet camera and controls
                    let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 1000);
                    camera.position.set(0, 100, 175);
                    let controls = new THREE.OrbitControls(camera, renderer.domElement);
                    controls.maxDistance = 400;
                    controls.minDistance = 80;
                    controls.enablePan = false;
                
                    // store planet
                    planetNodes.push({
                        planet: planet,
                        camera: camera,
                        controls: controls,
                        name: name
                    })

                    // create planet orbit line
                    let shape = new THREE.Shape();
                    shape.moveTo(orbitRadius, 0);
                    shape.absarc(0, 0, orbitRadius, 0, 2 * Math.PI, false);

                    let spacedPoints = shape.getSpacedPoints(128);

                    let orbitGeometry = new THREE.BufferGeometry().setFromPoints(spacedPoints); 
                    orbitGeometry.rotateX(-1.5707);

                    let orbitMaterial = new THREE.LineBasicMaterial({
                        color: "#5C5680",
                    });

                    let orbit = new THREE.Line(orbitGeometry, orbitMaterial);
                    scene.add(orbit);
                    orbits.push(orbit);
                };
            
                for (let [name, properties] of Object.entries(planets)) {
                    createPlanet(name, properties.radius, properties.orbitRadius);
                  
                    // Tạo đường tròn đường di chuyển
                    const orbitRadius = properties.orbitRadius;
                    const lineWidth = 0.2; // Độ dày của đường tròn
                    const orbitGeometry = new THREE.RingGeometry(orbitRadius - lineWidth, orbitRadius, 64);
                    const orbitMaterial = new THREE.MeshBasicMaterial({
                      color: 0xffffff, // Màu trắng
                      side: THREE.DoubleSide,
                      transparent: true, // Chế độ trong suốt
                      opacity: 0.4 // Độ trong suốt (0-1)
                    });
                    const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
                    orbit.rotation.x = -Math.PI / 2; // Xoay đường tròn để nằm trong mặt phẳng XY
                  
                    scene.add(orbit);


                    
                  }
                  

                orbits.forEach(orbit => orbit.visible = !orbit.visible);
                
                
                currentNode = planetNodes[5];
                activeCamera = camera;
                
            //     gui camera view changing
                planetNodes.forEach(function(node, i) {
                    $(`#${node.name}-button`).on('click', () => {
                        activeCamera = node.camera;
                        currentNode = node;
                        $('.active-button').removeClass("active-button");
                        $(`#${node.name}-button`).addClass('active-button');
                    })
                });
                $('#main-button').on('click', () => {
                    activeCamera = camera;
                    $('.active-button').removeClass("active-button");
                    $('#main-button').addClass('active-button');
                });
                
            //     gui orbit lines toggle
                $('#lines-button').on('click', () => {
                    if($('#lines-button').hasClass("visible")) $('#lines-button').removeClass('visible');
                    else $('#lines-button').addClass("visible");
                    orbits.forEach(orbit => orbit.visible = !orbit.visible);
                })
            }




            function animate() {
                
                // move and rotate planets
                timestamp = Date.now() * 0.0001;
                planetNodes.forEach(function({planet, name}) {
                    planet.position.x = Math.cos(timestamp * planets[name].speed) * planets[name].orbitRadius;
                    planet.position.z = Math.sin(timestamp * planets[name].speed) * planets[name].orbitRadius;
                    planet.rotation.y += planets[name].rotationSpeed;
                });
            
                sun.rotation.y += 0.001;
            

                // update planet controls
                const currentObjectPosition = new THREE.Vector3();
                currentNode.planet.getWorldPosition(currentObjectPosition);
                currentNode.planet.getWorldPosition(currentNode.controls.target);
                const cameraOffset = new THREE.Vector3(camera.position.x, camera.position.y, camera.position.z)

                currentNode.camera.position.copy(currentObjectPosition).add(cameraOffset);
                currentNode.controls.update();
            
                
                controls.update();
                renderer.render(scene, activeCamera);
                requestAnimationFrame(animate);
            }

            document.getElementById("solarTab").addEventListener("click", function() {
                clearTimeout(timeout_Debounce);
                timeout_Debounce = setTimeout(onWindowResize, 80);
            });

            // resize
            window.addEventListener("resize", () => {
                clearTimeout(timeout_Debounce);
                timeout_Debounce = setTimeout(onWindowResize, 80);
            });
            function onWindowResize() {
                camera.aspect = container.clientWidth / container.clientHeight;
                camera.updateProjectionMatrix();
            
                planetNodes.forEach((planetNode) => {
                planetNode.camera.aspect = container.clientWidth / container.clientHeight;
                planetNode.camera.updateProjectionMatrix();
                })  
            
                renderer.setSize(container.clientWidth, container.clientHeight);
            }


            var currentSlide = 0;
var slides = document.getElementsByClassName("slide");

function nextSlide() {
  slides[currentSlide].style.display = "none";
  currentSlide = (currentSlide + 1) % slides.length;
  slides[currentSlide].style.display = "block";

  var moon = document.getElementById("moon");
  var sun = document.getElementById("sun");

  if (moon) {
    moon.scrollIntoView({ behavior: 'smooth' });
  } else if (sun) {
    sun.scrollIntoView({ behavior: 'smooth' });
  } else {
    document.documentElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function prevSlide() {
  slides[currentSlide].style.display = "none";
  currentSlide = (currentSlide - 1 + slides.length) % slides.length;
  slides[currentSlide].style.display = "block";

  var moon = document.getElementById("moon");
  var sun = document.getElementById("sun");

  if (sun) {
    sun.scrollIntoView({ behavior: 'smooth' });
  } else if (moon) {
    moon.scrollIntoView({ behavior: 'smooth' });
  } else {
    document.documentElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}


document.querySelector('a[href="#register"]').addEventListener('click', function(e) {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  
AOS.init({
    duration: 2500 
});


let slider = document.querySelector('.slider .list');
let items = document.querySelectorAll('.slider .list .item');
let next = document.getElementById('next');
let prev = document.getElementById('prev');
let dots = document.querySelectorAll('.slider .dots li');

let lengthItems = items.length - 1;
let active = 0;
next.onclick = function(){
    active = active + 1 <= lengthItems ? active + 1 : 0;
    reloadSlider();
}
prev.onclick = function(){
    active = active - 1 >= 0 ? active - 1 : lengthItems;
    reloadSlider();
}
let refreshInterval = setInterval(()=> {next.click()}, 4000);
function reloadSlider(){
    slider.style.left = -items[active].offsetLeft + 'px';
    // 
    let last_active_dot = document.querySelector('.slider .dots li.active');
    last_active_dot.classList.remove('active');
    dots[active].classList.add('active');

    clearInterval(refreshInterval);
    refreshInterval = setInterval(()=> {next.click()}, 4000);

    
}

dots.forEach((li, key) => {
    li.addEventListener('click', ()=>{
         active = key;
         reloadSlider();
    })
})
window.onresize = function(event) {
    reloadSlider();
};


$(function() {
    $('.features').slick({
      arrows: true,
      dots: false,
      infinite: true,
      speed: 500,
      slidesToShow: 3,
      slidesToScroll: 1,
      responsive: [
        {
          breakpoint: 960,
          settings: {
            slidesToShow: 2,
            slidesToScroll: 1
          }
        },
        {
          breakpoint: 768,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1
          }
        }
      ]
    });
  });

  window.onscroll = function() {scrollFunction()};

  function scrollFunction() {
    if (document.body.scrollTop > 1000 || document.documentElement.scrollTop > 1000) {
      document.getElementById("back-to-top").style.display = "block";
    } else {
      document.getElementById("back-to-top").style.display = "none";
    }
  }
  
  function topFunction() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  }

  