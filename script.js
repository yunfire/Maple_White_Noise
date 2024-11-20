let player;
let isReady = false;

// 楓之谷音樂列表
const mapleSongs = [
    { id: 'CbALw2ISsXU', name: '精靈森林 Ellinia' },
    { id: 'VPeSIhYhm7w', name: '弓箭手村 Henesys' },
    { id: '0qj4hgJeSe4', name: '冒險起點 Beginner City' },
    { id: 'uMfj4BHzEqs', name: '天空之城 Orbis' },
    { id: 'buihtKnfYmA', name: '墮落城市 Kerning City' },
    { id: 'aE6YyEfeSp8', name: '魔法森林 Elluel' },
    { id: 'LKnQQLtYFGs', name: '冰原雪域 El Nath' },
    { id: 'PkUDqAIczXg', name: '水世界 Aquarium' },
    { id: 'MihzwOvd_MA', name: '玩具城 Ludibrium' },
    { id: 'EKmCHMNbTPw', name: '時間神殿 Temple of Time' }
];

// 背景圖片列表
const backgroundImages = [
    './picture/ellinia.jpg',     // 精靈森林背景
    './picture/henesys.jpg',     // 弓箭手村背景
    './picture/lith.jpg',        // 冒險起點背景
    './picture/orbis.jpg',       // 天空之城背景
    './picture/kerning.jpg',     // 墮落城市背景
    './picture/elluel.jpg',      // 魔法森林背景
    './picture/elnath.jpg',      // 冰原雪域背景
    './picture/aqua.jpg',        // 水世界背景
    './picture/ludi.jpg',        // 玩具城背景
    './picture/time.jpg'         // 時間神殿背景
];

// 追踪已播放的歌曲
let playedSongs = [];
let currentSongIndex = 0;

// 添加背景圖片處理函數
function loadBackgroundImage(imageUrl) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(imageUrl);
        img.onerror = () => reject();
        img.src = imageUrl;
    });
}

async function setValidBackground() {
    for (let imageUrl of backgroundImages) {
        try {
            await loadBackgroundImage(imageUrl);
            document.body.style.backgroundImage = `url('${imageUrl}')`;
            console.log('成功載入背景圖片：', imageUrl);
            break;
        } catch (error) {
            console.log('圖片載入失敗，嘗試下一張：', imageUrl);
            continue;
        }
    }
}

// 獲取隨機歌曲
function getNextSong() {
    if (playedSongs.length === mapleSongs.length) {
        playedSongs = [];
    }
    let availableSongs = mapleSongs.filter(song => !playedSongs.includes(song.id));
    let randomIndex = Math.floor(Math.random() * availableSongs.length);
    let nextSong = availableSongs[randomIndex];
    
    playedSongs.push(nextSong.id);
    console.log('正在播放: ' + nextSong.name);
    
    // 更新歌曲名稱顯示
    updateSongDisplay(nextSong.name);
    
    return nextSong.id;
}

// 添加更新歌曲顯示的函數
function updateSongDisplay(songName) {
    const currentSong = document.getElementById('currentSong');
    const currentSongDup = document.getElementById('currentSongDup');
    
    // 更新主要文字和副本文字（用於無縫循環）
    currentSong.textContent = songName;
    currentSongDup.textContent = songName;
}

function initializePlayer() {
    if (typeof YT === 'undefined' || typeof YT.Player === 'undefined') {
        setTimeout(initializePlayer, 100);
        return;
    }

    player = new YT.Player('player', {
        height: '0',
        width: '0',
        videoId: getNextSong(),
        playerVars: {
            'autoplay': 0,
            'controls': 0,
            'playsinline': 1,
            'rel': 0
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange,
            'onError': onPlayerError
        }
    });
}

function onPlayerError(event) {
    console.log('播放器錯誤：', event.data);
    let nextSongId = getNextSong();
    player.loadVideoById(nextSongId);
    player.playVideo();
}

function onYouTubeIframeAPIReady() {
    initializePlayer();
}

function onPlayerReady(event) {
    isReady = true;
    player.setVolume(50);
    const toggle = document.getElementById('toggle');
    
    // 模擬開關切換：先關閉再開啟
    setTimeout(() => {
        toggle.checked = false;  // 先關閉
        setTimeout(() => {
            toggle.checked = true;  // 再開啟
        }, 500);
    }, 500);
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.ENDED) {
        let nextSongId = getNextSong();
        player.loadVideoById(nextSongId);
        player.playVideo();
    }
}

document.addEventListener('DOMContentLoaded', function() {
    setValidBackground();

    const toggle = document.getElementById('toggle');
    const nextButton = document.getElementById('nextButton');

    toggle.checked = true;

    nextButton.addEventListener('click', function() {
        if (!player || !isReady) return;
        let nextSongId = getNextSong();
        player.loadVideoById(nextSongId);
        player.playVideo();
    });

    if (typeof YT === 'undefined') {
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    } else {
        initializePlayer();
    }

    toggle.addEventListener('change', function() {
        if (!player || !isReady) return;
        
        if (this.checked) {
            player.playVideo();
        } else {
            player.pauseVideo();
        }
    });

    // 保留點擊事件監聽器
    document.addEventListener('click', function initAudio() {
        if (player && isReady && toggle.checked) {
            player.playVideo();
        }
    }, { once: true });

    // 初始化歌曲名稱顯示
    updateSongDisplay(mapleSongs[0].name);
}); 