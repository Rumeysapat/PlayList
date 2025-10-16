//Elementlere ulasma
const prevButton = document.getElementById('prev');
const nextButton = document.getElementById('next');
const repeatButton = document.getElementById('repeat');
const shuffleButton = document.getElementById('shuffle');
const audio = document.getElementById('audio');
const songImage = document.getElementById('song-image');
const songName = document.getElementById('song-name');
const songArtist = document.getElementById('song-artist');
const pauseButton = document.getElementById('pause');
const playButton = document.getElementById('play');
const playListButton = document.getElementById('playlist');

const maxDuration = document.getElementById('max-duration');
const currentTimeRef = document.getElementById('current-time');

const progressBar = document.getElementById('progress-bar');
const playListContainer = document.getElementById('playlist-container');
const closeButton = document.getElementById('close-button');
const playListSongs = document.getElementById('playlist-songs');

const currentProgress = document.getElementById('current-progress');
const favoriteBtn = document.getElementById('favorite-btn');
const showFavoritesBtn = document.getElementById('show-favorites');

//sira
let index = 0;

let showingFavorites = false;
let isPlaying = false;
let animationId;

//dongu
let loop = true;

// repeat durumu
let shuffle = false; // shuffle durumu
//Tarayıcıdaki localStorage içinde "favorites" anahtarına ait bir değer var mı diye bakar.
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

//sarki listesi

const songsList = [
  {
    name: 'Etegi Belinde',
    link: 'assets/etegi_belinde.mp3',
    artist: 'Manuş Baba',
    image: 'assets/manus.jpeg',
  },
  {
    name: 'Haberin Varmı',
    link: 'assets/haberin_varmi.mp3',
    artist: 'Manuş Baba',
    image: 'assets/manus.jpeg',
  },
  {
    name: 'Kimler Gecti',
    link: 'assets/kimler_gecti.mp3',
    artist: 'Ajda Pekkan',
    image: 'assets/ajda.png',
  },
  {
    name: 'Telli Turnam',
    link: 'assets/telli_turnam.mp3',
    artist: 'Musa Eroğlu',
    image: 'assets/musa.png',
  },
];

//sarki atama 4
const setSong = (arrayIndex) => {
  index = arrayIndex; // aktif şarkı index’ini güncelledik
  console.log('Şarkı set edildi:', index);
  console.log(arrayIndex);
  //Bu satır JavaScript’te destructuring (yapı çözme) assignment adı verilen bir özelliktir ve objelerden veya dizilerden değerleri daha kısa ve temiz bir şekilde almak için kullanılır.Yukarıda queryselector ile tanımlanan değişkenler.
  let { name, link, artist, image } = songsList[arrayIndex];
  audio.src = link;
  songName.innerHTML = name;
  songArtist.innerHTML = artist;
  songImage.src = image;

  playListContainer.classList.add('hide');

  audio.onloadedmetadata = () => {
    maxDuration.innerText = timeFormatter(audio.duration);
  };

  playAudio();
  updateFavoriteIcon();
};

//canli izleme yap
audio.addEventListener('timeupdate', () => {
  currentTimeRef.innerText = timeFormatter(audio.currentTime);

  let value = (audio.currentTime / audio.duration.toFixed(3)) * 100 + '%';
  console.log('value: ', value);
  currentProgress.style.width = value;
});

//sarki bittiginde
audio.onended = () => {
  nextSong();
};

//sureyi tiklayarak degistir
progressBar.addEventListener('click', (event) => {
  //baslangic/sol
  let coordStart = progressBar.getBoundingClientRect().left;
  console.log('coordStart: ', coordStart);
  //bitis
  let coordEnd = event.clientX;
  console.log('coordEnd: ', coordEnd);
  console.log('progressBar offsetWidth: ', progressBar.offsetWidth);
  let progress = (coordEnd - coordStart) / progressBar.offsetWidth;
  console.log('progress ', progress);

  currentProgress.style.width = progress * 100 + '%';
  audio.currentTime = progress * audio.duration;
  playAudio();
});

//sarkiyi oynat
const playAudio = () => {
  initAudioAnalyzer();
  audio.play();
  playButton.classList.add('hide');
  pauseButton.classList.remove('hide');
  isPlaying = true;
  cancelAnimationFrame(animationId);
  setBarsActive(); // barları başta aktif hâle getir
  animateVisualizer();
};

//sarkiyi durdur
const pauseAudio = () => {
  audio.pause();
  pauseButton.classList.add('hide');
  playButton.classList.remove('hide');
};

//zamani formatla. 98
const timeFormatter = (timeInput) => {
  let minute = Math.floor(timeInput / 60); //1
  minute = minute < 10 ? '0' + minute : minute;
  let second = Math.floor(timeInput % 60); // 38
  second = second < 10 ? '0' + second : second;
  return `${minute}:${second}`;
};

//siradaki sarkiya gec
const nextSong = () => {
  index = Number(index);
  if (loop) {
    if (index >= songsList.length - 1) {
      index = 0;
    } else {
      index += 1; //index = index + 1
    }
  } else {
    let randIndex = Math.floor(Math.random() * songsList.length);
    index = randIndex;
  }
  setSong(index);
};

//onceki sarkiya gec
const previousSong = () => {
  console.log(index);
  if (index > 0) {
    index -= 1; // index = index - 1
  } else {
    index = songsList.length - 1;
  }
  setSong(index);
};
console.log('loop:', loop, 'index:', index);

//liste ac button a tiklanirsa
playListButton.addEventListener('click', () => {
  showingFavorites = false;
  initializePlaylist();
  playListContainer.classList.remove('hide');
  playListContainer.style.display = 'block';
});

//sarili sarki listesini olustur
const initializePlaylist = () => {
  // 0 1 2 3 4
  playListSongs.innerHTML = '';
  for (let i in songsList) {
    playListSongs.innerHTML += `<li class="playlistSong"
            onclick="setSong(${i})">
                <div class="playlist-image-container">
                    <img src="${songsList[i].image}" />
                </div>
                <div class="playlist-song-details">
                    <span id="playlist-song-name">
                        ${songsList[i].name}
                    </span>
                    <span id="playlist-song-artist-album">
                        ${songsList[i].artist}
                    </span>
                </div>

            </li>
            `;
  }
};
// Favori ikonunu güncelle
const updateFavoriteIcon = () => {
  const isFavorite = favorites.includes(index);
  const icon = favoriteBtn.querySelector('i');
  if (isFavorite) {
    icon.classList.remove('fa-regular');
    icon.classList.add('fa-solid');
  } else {
    icon.classList.remove('fa-solid');
    icon.classList.add('fa-regular');
  }
};

// Favori butonuna tıklanınca
favoriteBtn.addEventListener('click', () => {
  if (favorites.includes(index)) {
    favorites = favorites.filter((fav) => fav !== index); // çıkar
  } else {
    favorites.push(index); // ekle
  }
  localStorage.setItem('favorites', JSON.stringify(favorites));
  updateFavoriteIcon();

  // daha açıklayıcı console çıktısı:
  const favs = JSON.parse(localStorage.getItem('favorites')) || [];
  console.log('Favori şarkı indexleri:', favs);

  // tablo halinde: index, isim, sanatçı
  console.table(
    favs.map((i) => ({
      index: i,
      name: songsList[i]?.name ?? 'Bilinmiyor',
      artist: songsList[i]?.artist ?? 'Bilinmiyor',
    }))
  );
});

showFavoritesBtn.addEventListener('click', () => {
  showingFavorites = true;
  playListSongs.innerHTML = '';

  if (favorites.length === 0) {
    playListSongs.innerHTML = '<li>Favori şarkı yok</li>';
  } else {
    favorites.forEach((favIndex) => {
      const song = songsList[favIndex];
      playListSongs.innerHTML += `
        <li class="playlistSong" onclick="setSong(${favIndex})">
          <div class="playlist-image-container">
            <img src="${song.image}" />
          </div>
          <div class="playlist-song-details">
            <span class="playlist-song-name">${song.name}</span>
            <span class="playlist-song-artist-album">${song.artist}</span>
          </div>
          <div class="playlist-song-favorite">
            <i class="fa-solid fa-heart"></i>
          </div>
        </li>
      `;
    });
  }

  playListContainer.classList.remove('hide');
  playListContainer.style.display = 'block';
});

//button lara tiklanildigida
playButton.addEventListener('click', () => {
  initAudioAnalyzer();
  audio.play();
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  animateVisualizer();
  playButton.classList.add('hide');
  pauseButton.classList.remove('hide');
});

closeButton.addEventListener('click', () => {
  playListContainer.classList.add('hide');
});

//sarkiyi durdur
pauseButton.addEventListener('click', pauseAudio);

//siradaki sarkiyi cal
nextButton.addEventListener('click', nextSong);

//onceki sarkiyi ac
prevButton.addEventListener('click', previousSong);

repeatButton.addEventListener('click', () => {
  loop = !loop;
  repeatButton.classList.toggle('active', loop);
});

shuffleButton.addEventListener('click', () => {
  shuffle = !shuffle;
  shuffleButton.classList.toggle('active', shuffle);
});
playListButton.addEventListener('click', () => {
  playListContainer.style.display = 'block';
});

closeButton.addEventListener('click', () => {
  playListContainer.style.display = 'none';
});

window.onload = () => {
  index = 0;
  setSong(index);
  initializePlaylist();
  pauseAudio();
};
// 🔊 AudioContext oluştur
let audioContext;
let analyser;
let source;
let dataArray;
let bars;

// Sayfa yüklendiğinde bar elementlerini al
window.addEventListener('DOMContentLoaded', () => {
  bars = document.querySelectorAll('.visualizer .bar');
  console.log(bars.length, 'bar bulundu');
});

// 🎵 Ses analizini başlat (yalnızca bir kez oluştur)
function initAudioAnalyzer() {
  if (!audioContext) {
    audioContext = new AudioContext();
    analyser = audioContext.createAnalyser();
    source = audioContext.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(audioContext.destination);

    analyser.fftSize = 512; // analiz çözünürlüğü
    const bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);
  }
}
function animateVisualizer() {
  analyser.getByteFrequencyData(dataArray);

  const step = Math.floor(dataArray.length / bars.length);
  for (let i = 0; i < bars.length; i++) {
    const value = dataArray[i * 5]; // frekans verisi
    let height = (value / 255) * 100; // yüzdeye çevir
    const maxHeight = 80; // barların ulaşabileceği maksimum yükseklik (px)
    height = Math.min(height, maxHeight);
    bars[i].style.height = `${Math.max(height, 8)}px`;
    bars[i].style.backgroundColor = '#ff007f'; // her frame’de aktif renk
    bars[i].style.opacity = 1; // her frame’de görünür
  }

  // tekrar sadece müzik çalıyorsa çağır
  if (isPlaying) {
    animationId = requestAnimationFrame(animateVisualizer);
  }
}

// ▶️ Müzik başladığında
audio.addEventListener('play', () => {
  initAudioAnalyzer();
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  isPlaying = true;
  cancelAnimationFrame(animationId); // eski animasyon varsa durdur
  animateVisualizer();
});

// ⏸️ Müzik durduğunda
audio.addEventListener('pause', () => {
  isPlaying = false;
  cancelAnimationFrame(animationId); // animasyonu durdur
  bars.forEach((bar) => {
    bar.style.height = '8px';
    bar.style.opacity = 0.3;
    bar.style.backgroundColor = 'rgba(128, 128, 128, 0.3)';
  });
});
audio.addEventListener('ended', () => {
  if (!bars) return;
  bars.forEach((bar) => {
    bar.style.height = '8px';
    bar.style.backgroundColor = 'rgba(128, 128, 128, 0.3)'; // pasif renk
  });
});

function setBarsActive() {
  if (!bars) return;
  bars.forEach((bar) => {
    bar.style.backgroundColor = '#ff007f'; // aktif renk
    bar.style.opacity = 1;
    bar.style.height = '8px'; // minimum yükseklik
  });
}
