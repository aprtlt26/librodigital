
        const firebaseConfig = {
            apiKey: "AIzaSyB6ATVR7zP3Xuuk62Y6MXa8kCkX7diFVoE",
            authDomain: "libro-digital-ccf11.firebaseapp.com",
            projectId: "libro-digital-ccf11",
            storageBucket: "libro-digital-ccf11.appspot.com",
            messagingSenderId: "869085974070",
            appId: "1:869085974070:web:14a6500caf903bd2749297",
            measurementId: "G-G57LE45QYR"
        };

       
        firebase.initializeApp(firebaseConfig);
        const storage = firebase.storage();

        const images = [
            '0.gif', '01.gif', '02.gif', '03.gif', '04.gif', '05.gif', '06.gif', '07.gif',
            '08.gif', '09.gif', '10.gif', '11.gif', '02.webp', '03.webp', '04.webp', '05.webp',
            '06.webp', '07.webp', '08.webp', '09.webp', '10.webp', '11.webp', '12.webp', '14.webp', '15.webp'
        ];

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
            '11.gif': '11.mp3',
            '02.webp': '',
            '03.webp': '',
            '04.webp': '',
            '05.webp': ''
        };

        let collageImageAudioMap = new Map();
        let audiosImages = [];

        document.addEventListener('DOMContentLoaded', function() {
            loadImagesFromFirebase();
        });

        function loadImagesFromFirebase() {
            const galleryContainer = document.querySelector('#gallery-container');
            images.forEach(image => {
                loadFirebaseImage(image).then(url => {
                    const img = document.createElement('img');
                    img.src = url;
                    img.style.width = '100px';
                    img.addEventListener('click', function(e) {
                        e.stopPropagation();
                        const collageImg = img.cloneNode();
                        collageImg.classList.add('draggable');
                        collageImg.style.position = 'absolute';
                        collageImg.style.left = '0px';
                        collageImg.style.top = '0px';
                        document.getElementById('collage-container').appendChild(collageImg);
                        makeImageInteractive(collageImg);

                        const audioSrc = imageAudioMap[image];
                        if (audioSrc) {
                            collageImageAudioMap.set(collageImg, audioSrc);
                            playAudio(audioSrc); // Reproduce el audio cuando se coloca la imagen
                        }
                    });
                    galleryContainer.appendChild(img);
                }).catch(error => {
                    console.error(`Error al cargar la imagen ${image}:`, error);
                });
            });
        }

        function loadFirebaseImage(fileName) {
            const storageRef = storage.ref();
            const imageRef = storageRef.child(fileName);
            return imageRef.getDownloadURL();
        }

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
                    autoScroll: true
                })
                .resizable({
                    edges: { left: true, right: true, bottom: true, top: true },
                    listeners: {
                        move(event) {
                            let target = event.target;
                            let x = (parseFloat(target.getAttribute('data-x')) || 0);
                            let y = (parseFloat(target.getAttribute('data-y')) || 0);

                            target.style.width = event.rect.width + 'px';
                            target.style.height = event.rect.height + 'px';

                            x += event.deltaRect.left;
                            y += event.deltaRect.top;

                            target.style.transform = `translate(${x}px, ${y}px) rotate(${target.getAttribute('data-angle') || 0}deg)`;

                            target.setAttribute('data-x', x);
                            target.setAttribute('data-y', y);
                        }
                    }
                });

            img.addEventListener('dblclick', function() {
                let angle = parseInt(this.getAttribute('data-angle') || '0');
                angle = (angle + 180) % 360;
                this.style.transform = `translate(${this.getAttribute('data-x') || 0}px, ${this.getAttribute('data-y') || 0}px) rotate(${angle}deg)`;
                this.setAttribute('data-angle', angle.toString());
            });

            img.addEventListener('click', function(e) {
                if (e.ctrlKey || e.metaKey) {
                    img.classList.toggle('selected');
                } else {
                    document.querySelectorAll('.draggable.selected').forEach(selectedImg => {
                        if (selectedImg !== img) {
                            selectedImg.classList.remove('selected');
                        }
                    });
                    img.classList.add('selected');
                }
            });
        }

        function playAudio(src) {
            const audio = new Audio(src);
            audio.play();
            audiosImages.push(audio);
        }

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

        document.getElementById('print-button').addEventListener('click', function() {
            window.print();
        });

        document.getElementById('resetButton').addEventListener('click', function() {
            clearCanvas();
        });

        function clearCanvas() {
            const collageContainer = document.getElementById('collage-container');
            const images = collageContainer.querySelectorAll('img');
            images.forEach(img => {
                collageContainer.removeChild(img);
            });

            audiosImages.forEach(audio => {
                if (!audio.paused) {
                    audio.pause();
                }
            });
            audiosImages = [];
            collageImageAudioMap.clear();
        }

        document.getElementById('newGameButton').addEventListener('click', function() {
            window.location.href = 'index.html';
        });

        document.getElementById('paintButton').addEventListener('click', function() {
            window.location.href = 'paint.html';
        });

        const backgroundImages = [
             'florez.webp',
            'past.webp',
            'lago.webp',
           
        ];

        let currentIndex = 0;

        function changeBackground() {
            const collageContainer = document.getElementById('collage-container');
            collageContainer.style.backgroundImage = `url('${backgroundImages[currentIndex]}')`;
            collageContainer.style.backgroundSize = 'cover';

            currentIndex = (currentIndex + 1) % backgroundImages.length;
        }

        document.addEventListener('DOMContentLoaded', changeBackground);
        document.getElementById('change-background-button').addEventListener('click', changeBackground);

        var storyAudio = new Audio('cuento.wav');
        var missionAudio = new Audio('elcollage.wav');

        function playSingleAudio(audio) {
            storyAudio.pause();
            storyAudio.currentTime = 0;
            missionAudio.pause();
            missionAudio.currentTime = 0;

            audio.play();
        }

        document.getElementById('storyButton').addEventListener('click', function() {
            if (storyAudio.paused) {
                playSingleAudio(storyAudio);
            }
        });

        document.getElementById('misionButton').addEventListener('click', function() {
            if (missionAudio.paused) {
                playSingleAudio(missionAudio);
            }
        });

        document.getElementById('play-button').addEventListener('click', function() {
            const allImages = document.querySelectorAll('#collage-container img');
            allImages.forEach(img => {
                const audioSrc = collageImageAudioMap.get(img);
                if (audioSrc) {
                    playAudio(audioSrc);
                }
            });
        });
    
