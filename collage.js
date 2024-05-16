
  
    
     
         let audiosImages = [];
        
     
     
           document.addEventListener('DOMContentLoaded', function() {
     
         const container = document.querySelector('#collage-container');
     
     
         let history = [];
     
         
         });
         function printCollage() {
       window.print();
     }
     const images = ['0.gif', '01.gif', '02.gif', '03.gif', '04.gif', '05.gif', '06.gif', '07.gif', '08.gif', '09.gif', '10.gif', '11.gif', '02.webp','03.webp','04.webp', '05.webp', '06.webp', '07.webp', '08.webp', '09.webp', '10.webp', '11.webp',  '12.webp',   '14.webp', '15.webp' ];
     

   
    
     
                 const imageAudioMap = {
                     
                     
            
          '0.gif': '0.mp3',
         '01.gif': '01.mp3',
         '02.gif': '02.mp3',
         '03.gif': '03.mp3',
         '04.gif': '04.mp3',
         '05.gif': '05.mp3',
         '06.gif': '06.mp3',
         '07.gif': '07.mp3',
         '08.gif': '08.mp3',
         '09.gif': '09.mp3',
         '10.gif': '10.mp3',
         '11.gif':  '11.mp3',
         '02.webp': '',
         '03.webp': '',
         '04.webp': '',
         '05.webp': '',
         
         
        
     };
          
             
     let collageImageAudioMap = new Map();
     
     
     images.forEach(image => {
        const img = document.createElement('img');
        img.src = image;
        img.style.width = '100px';
        img.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent click from affecting parent elements
            const collageImg = img.cloneNode();
            collageImg.classList.add('draggable');
            collageImg.style.position = 'absolute';
            collageImg.style.left = '0px';
            collageImg.style.top = '0px';
            collageContainer.appendChild(collageImg);
            makeImageInteractive(collageImg);
    
            const audioSrc = imageAudioMap[image];
            if (audioSrc) {
                const audio = new Audio(audioSrc);
                audio.play();
                audiosImages.push(audio);
            }
        });
        document.querySelector('#gallery-container').appendChild(img);
    });
    
    
         
         function moveSelectedImages(deltaX, deltaY) {
         const selectedImages = document.querySelectorAll('.draggable.selected');
         selectedImages.forEach(img => {
             // Calcula las nuevas posiciones basadas en deltaX y deltaY.
             let x = (parseFloat(img.getAttribute('data-x')) || 0) + deltaX;
             let y = (parseFloat(img.getAttribute('data-y')) || 0) + deltaY;
             img.style.transform = `translate(${x}px, ${y}px)`;
             img.setAttribute('data-x', x);
             img.setAttribute('data-y', y);
         });
     }
         
     
     interact('.draggable')
       .resizable({
         edges: { left: true, right: true, bottom: true, top: true },
       })
       .on('resizemove', function (event) {
         var target = event.target;
         var x = (parseFloat(target.getAttribute('data-x')) || 0);
         var y = (parseFloat(target.getAttribute('data-y')) || 0);
     
         target.style.width = event.rect.width + 'px';
         target.style.height = event.rect.height + 'px';
     
         x += event.deltaRect.left;
         y += event.deltaRect.top;
     
         target.style.transform = 'translate(' + x + 'px,' + y + 'px)';
     
         target.setAttribute('data-x', x);
         target.setAttribute('data-y', y);
         target.setAttribute('data-angle', target.getAttribute('data-angle') || 0);
       });
     
     interact('.draggable').draggable({
             listeners: {
                 move(event) {
                     if (event.target.classList.contains('selected')) {
                         document.querySelectorAll('.draggable.selected').forEach(selectedImg => {
                             let x = (parseFloat(selectedImg.getAttribute('data-x')) || 0) + event.dx;
                             let y = (parseFloat(selectedImg.getAttribute('data-y')) || 0) + event.dy;
                             selectedImg.style.transform = `translate(${x}px, ${y}px)`;
                             selectedImg.setAttribute('data-x', x);
                             selectedImg.setAttribute('data-y', y);
                         });
                     } else {
                         let x = (parseFloat(event.target.getAttribute('data-x')) || 0) + event.dx;
                         let y = (parseFloat(event.target.getAttribute('data-y')) || 0) + event.dy;
                         event.target.style.transform = `translate(${x}px, ${y}px)`;
                         event.target.setAttribute('data-x', x);
                         event.target.setAttribute('data-y', y);
                     }
                 }
             }
         });
         
        
         document.addEventListener('click', function(e) {
         if (e.target.classList.contains('draggable')) {
             if (e.ctrlKey || e.metaKey) {
                 e.target.classList.toggle('selected');
             } else {
                 document.querySelectorAll('.draggable.selected').forEach(selectedImg => {
                     if (selectedImg !== e.target) {
                         selectedImg.classList.remove('selected');
                     }
                 });
                 e.target.classList.add('selected');
             }
         } else {
             if (!e.ctrlKey && !e.metaKey) {
                 document.querySelectorAll('.draggable.selected').forEach(selectedImg => {
                     selectedImg.classList.remove('selected');
                 });
             }
         }
     });
     
     
     
     document.getElementById('move-up').addEventListener('click', function() {
         const selectedImage = document.querySelector('.draggable.selected');
         if (selectedImage) {
             let zIndex = parseInt(window.getComputedStyle(selectedImage).zIndex, 10);
             zIndex = isNaN(zIndex) ? 1 : zIndex + 1;
             selectedImage.style.zIndex = zIndex;
         }
     });
     
     document.getElementById('move-down').addEventListener('click', function() {
         const selectedImage = document.querySelector('.draggable.selected');
         if (selectedImage) {
             let zIndex = parseInt(window.getComputedStyle(selectedImage).zIndex, 10);
             zIndex = isNaN(zIndex) ? 0 : zIndex - 1;
             selectedImage.style.zIndex = zIndex;
         }
     });
     
     
     
     function allowDrop(event) {
     event.preventDefault();
     }
     
         const collageContainer = document.querySelector('#collage-container');
         collageContainer.addEventListener('dragover', e => e.preventDefault());
         collageContainer.addEventListener('drop', e => {
             e.preventDefault();
             const src = e.dataTransfer.getData('text');
             const img = document.createElement('img');
             img.src = src;
     
     
             if (imageAudioMap[src.split('/').pop()]) {
     const audioSrc = imageAudioMap[src.split('/').pop()];
     const audio = new Audio(audioSrc);
     audio.play();
         
     
     
     if (!collageAudios.some(audio => audio.src === audioSrc)) {
     collageAudios.push(audio);
     }
     
             } 
     }); 
     
         
     
     function makeImageInteractive(img) {
     interact(img)
         .draggable({
             listeners: {
                 start(event) {
                     let target = event.target;
                     target.style.zIndex = 1000;
                 },
                 move(event) {
                     let target = event.target,
                         x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
                         y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
     
                     target.style.transform = `translate(${x}px, ${y}px) rotate(${target.getAttribute('data-angle') || 0}deg)`;
     
                     target.setAttribute('data-x', x);
                     target.setAttribute('data-y', y);
                 }
             },
     
             
             inertia: true,
             modifiers: [
                 interact.modifiers.restrictRect({
                     restriction: 'parent',
                     endOnly: true
                 })
             ],
             autoScroll: true,
             onmove: window.dragMoveListener
             
         });
     
             img.addEventListener('dblclick', function() {
         let angle = parseInt(this.getAttribute('data-angle') || '0');
         angle = (angle + 180) % 360;
         this.style.transform = `translate(${this.getAttribute('data-x') || 0}px, ${this.getAttribute('data-y') || 0}px) rotate(${angle}deg)`;
         this.setAttribute('data-angle', angle.toString());
         
     });

         }
         
         document.getElementById('play-button').addEventListener('click', function() {
         const allImages = [...document.querySelectorAll('#collage-container img'), ];
     
     
   
     

         document.getElementById('play-button').addEventListener('click', function() {
            const allImages = document.querySelectorAll('#collage-container img');
            allImages.forEach(img => {
                const imageName = img.src.split('/').pop();
                const audioSrc = imageAudioMap[imageName];
                if (audioSrc) {
                    const audio = new Audio(audioSrc);
                    audio.play();
                }
            });
        });
                 
        


         document.querySelectorAll('.draggable').forEach(img => {
         let startY; 
     
         img.addEventListener('touchstart', e => {
             startY = e.touches[0].clientY; 
         }, {passive: true});
     
         img.addEventListener('touchmove', e => {
             const moveY = e.touches[0].clientY; 
             const diffY = moveY - startY; 
     
             if (Math.abs(diffY) > Math.abs(e.touches[0].clientX - e.touches[0].screenX)) {
                 e.preventDefault(); 
             }
         }, {passive: false});
     });});
     
     document.addEventListener('touchmove [0].clientY', function(e) {
         e.preventDefault();
     }, { passive: false });
     
     

     
     document.getElementById('print-button').addEventListener('click', function() {
             window.print();
         });
     
    
     document.getElementById('delete-button').addEventListener('click', function() {
         const selectedImages = document.querySelectorAll('.draggable.selected');
         selectedImages.forEach(img => {
             img.remove();
             const audio = collageImageAudioMap.get(img);
             if (audio) {
                 audio.pause();
                 collageImageAudioMap.delete(img);
             }
             img.remove();
         });
     });
     const backgroundImages = [
       
        'pasto.webp',
        'jardin.webp',
        'morado.webp',
        'campo.webp',
        'florez.webp',

    ];
    

    
    let currentIndex = 0;  // Variable para llevar la cuenta del índice de la imagen actual
    
    function changeBackground() {
        const collageContainer = document.getElementById('collage-container');
        collageContainer.style.backgroundImage = `url('${backgroundImages[currentIndex]}')`;
        collageContainer.style.backgroundSize = 'cover'; // Asegura que la imagen de fondo cubra todo el contenedor
    
        // Incrementa el índice para la próxima imagen
        currentIndex = (currentIndex + 1) % backgroundImages.length;
    }
    
    // Evento para cambiar el fondo al cargar la página y cada vez que se haga clic
    document.addEventListener('DOMContentLoaded', changeBackground);
    document.getElementById('change-background-button').addEventListener('click', changeBackground);
    
    
     
     document.querySelectorAll('.draggable').forEach(img => {
         img.addEventListener('touchstart', function(e) {
             e.preventDefault(); 
         });
     
         img.addEventListener('touchmove', function(e) {
             e.preventDefault(); 
         });
     
         img.addEventListener('touchend', function(e) {
         });
     });
     
    
     
     let isRotating = false; // Flag para controlar el estado de la rotación
         let rotationInterval; // Variable para almacenar el intervalo de rotación
     
         // Función para iniciar la rotación
         function startRotation() {
             const selectedImage = document.querySelector('.draggable.selected');
             if (!selectedImage || isRotating) return;
             
             isRotating = true;
             let angle = parseInt(selectedImage.getAttribute('data-angle') || '0');
             
             rotationInterval = setInterval(() => {
                 angle = (angle + 10) % 360; // Ajusta el ángulo de rotación
                 selectedImage.style.transform = `translate(${selectedImage.getAttribute('data-x') || 0}px, ${selectedImage.getAttribute('data-y') || 0}px) rotate(${angle}deg)`;
                 selectedImage.setAttribute('data-angle', angle.toString());
             }, 20); // Ajusta la velocidad de rotación modificando el tiempo del intervalo
         }
     
         // Función para detener la rotación
         function stopRotation() {
             if (!isRotating) return;
             
             clearInterval(rotationInterval);
             isRotating = false;
         }
     
         // Escuchar eventos de teclado para iniciar/detener la rotación
         document.addEventListener('keydown', function(e) {
             if (e.key === '<') { // Reemplaza '<' por la tecla específica que deseas usar
                 startRotation();
             }
         });
     
         document.addEventListener('keyup', function(e) {
             if (e.key === '<') { // Reemplaza '<' por la tecla específica que deseas usar
                 stopRotation();
             }
         });
     document.addEventListener('touchstart', function() {
         document.body.classList.add('no-scroll');
     });
     
     document.addEventListener('touchend', function() {
         document.body.classList.remove('no-scroll');
     });
     
     document.addEventListener('touchcancel', function() {
         document.body.classList.remove('no-scroll');
     });
         
     var storyAudio = new Audio('cuento.wav');  // Create the audio object for the story
     var missionAudio = new Audio('elcollage.wav');  // Create the audio object for the mission
     
     // Function to stop all audios and play the provided audio
     function playSingleAudio(audio) {
         // Stop all audios first
         storyAudio.pause();
         storyAudio.currentTime = 0;  // Reset the current time to start over when played again
         missionAudio.pause();
         missionAudio.currentTime = 0;  // Reset the current time to start over when played again
     
         // Play the passed audio
         audio.play();
     }
     
     document.getElementById('storyButton').addEventListener('click', function() {
         if (storyAudio.paused) {  // Check if the story audio is not currently playing
             playSingleAudio(storyAudio);
         }
     });
     
     document.getElementById('misionButton').addEventListener('click', function() {
         if (missionAudio.paused) {  // Check if the mission audio is not currently playing
             playSingleAudio(missionAudio);
         }
     });
     

document.getElementById('resetButton').addEventListener('click', function() {
    // Assuming your canvas can be cleared with a function like clearCanvas();
    clearCanvas(); // You will need to define this function to match how your canvas is implemented
});

document.getElementById('newGameButton').addEventListener('click', function() {
    window.location.href = 'index.html'; // Redirecciona al usuario a la página "abejas.html"
});

document.getElementById('paintButton').addEventListener('click', function() {
    window.location.href = 'paint.html'; // Redirecciona al usuario a la página "abejas.html"
});



function clearCanvas() {
    const collageContainer = document.getElementById('collage-container');
    // Encuentra y elimina solo los elementos <img> dentro del contenedor
    const images = collageContainer.querySelectorAll('img');
    images.forEach(img => {
        collageContainer.removeChild(img);
    });

    // Si tienes audios asociados a imágenes, también los pausas y eliminas
    audiosImages.forEach(audio => {
        if (!audio.paused) {
            audio.pause();  // Pausa el audio si está en reproducción
        }
    });
    audiosImages = [];  // Reinicia la lista de audios
}


document.getElementById('resetButton').addEventListener('click', function() {
    clearCanvas();  // Llama a la función que limpia el canvas
});

  
    
     
        
