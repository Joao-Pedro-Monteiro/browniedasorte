const backgroundMusicMP3 = new Audio("./roleta/js/music/Talk Show Tonight  Music for content creator.mp3");
const wheelSoundMP3 = new Audio("./roleta/js/music/Spinning Wheel Sound Effect.mp3");
const winSoundMP3 = new Audio("./roleta/js/music/Win.mp3");

backgroundMusicMP3.volume = 0.5;
backgroundMusicMP3.loop = true;

wheelSoundMP3.volume = 0.5;
winSoundMP3.volume = 0.5;

let isBackgroundMusicPlaying = false;
let isWheelSoundPlaying = false;
let isWinSoundPlaying = false;
let currentRotation = 0;
let isSpinning = false;

let username = JSON.parse(sessionStorage.getItem("brownie_participant")).nome;

function logWheel(message, extra = {}) {
  console.log(`[Wheel] ${message}`, extra);
}

function backgroundMusic(action) {
  switch (action) {
    case "play":
      backgroundMusicMP3.play();
      isBackgroundMusicPlaying = true;
      logWheel("Musica de fundo iniciada");
      break;
    case "pause":
      backgroundMusicMP3.pause();
      isBackgroundMusicPlaying = false;
      logWheel("Musica de fundo pausada");
      break;
    case "stop":
      backgroundMusicMP3.pause();
      backgroundMusicMP3.currentTime = 0;
      isBackgroundMusicPlaying = false;
      logWheel("Musica de fundo parada");
      break;
    default:
      console.warn('[Wheel] Acao invalida para backgroundMusic. Use "play", "pause" ou "stop".');
  }
}

function wheelSound(action) {
  switch (action) {
    case "play":
      wheelSoundMP3.currentTime = 0;
      wheelSoundMP3.play();
      isWheelSoundPlaying = true;
      logWheel("Som da roleta iniciado");
      break;
    case "pause":
      wheelSoundMP3.pause();
      isWheelSoundPlaying = false;
      logWheel("Som da roleta pausado");
      break;
    case "stop":
      wheelSoundMP3.pause();
      wheelSoundMP3.currentTime = 0;
      isWheelSoundPlaying = false;
      logWheel("Som da roleta parado");
      break;
    default:
      console.warn('[Wheel] Acao invalida para wheelSound. Use "play", "pause" ou "stop".');
  }
}

function winSound(action) {
  switch (action) {
    case "play":
      winSoundMP3.currentTime = 0;
      winSoundMP3.play();
      isWinSoundPlaying = true;
      logWheel("Som de vitoria iniciado");
      break;
    case "pause":
      winSoundMP3.pause();
      isWinSoundPlaying = false;
      logWheel("Som de vitoria pausado");
      break;
    case "stop":
      winSoundMP3.pause();
      winSoundMP3.currentTime = 0;
      isWinSoundPlaying = false;
      logWheel("Som de vitoria parado");
      break;
    default:
      console.warn('[Wheel] Acao invalida para winSound. Use "play", "pause" ou "stop".');
  }
}

function spinWheel() {
  if (isSpinning) {
    logWheel("Tentativa ignorada porque a roleta ainda esta girando");
    return;
  }

  const savedUsername = (localStorage.getItem(STORAGE_KEYS.username) || "").trim();

  if (!savedUsername) {
    document.getElementById("overlay").classList.add("show");
    document.getElementById("usernameInput").focus();
    logWheel("Tentativa de sorteio sem usuario identificado");
    return;
  }

  const prizeResult = getCurrentPrizeEntry();
  addSpinToHistory(savedUsername, prizeResult);
  const totalRotation = calculateTotalRotation(prizeResult.angle);

  isSpinning = true;
  logWheel("Sorteio iniciado", prizeResult);

  if (isBackgroundMusicPlaying) {
    backgroundMusicMP3.volume = 0.375;
  }

  wheelSound("play");
  applyWheelRotation(totalRotation);

  window.setTimeout(() => {
    isSpinning = false;
    wheelSound("stop");
    backgroundMusicMP3.volume = 0.5;
    showPrizeResult(prizeResult);
    logWheel("Sorteio finalizado", prizeResult);
  }, 9300);
}

function calculateTotalRotation(prizeAngle) {
  const normalizedRotation = currentRotation % 360;
  const extraSpins = 3 + Math.floor(Math.random() * 4);
  const extraRotation = extraSpins * 360;
  const targetRotation = (360 - prizeAngle) % 360;
  const adjustmentRotation = (targetRotation - normalizedRotation + 360) % 360;
  const totalRotation = currentRotation + extraRotation + adjustmentRotation;

  logWheel("Rotacao calculada", {
    currentRotation,
    normalizedRotation,
    extraSpins,
    prizeAngle,
    adjustmentRotation,
    totalRotation
  });

  return totalRotation;
}

function applyWheelRotation(totalRotation) {
  const wheel = document.getElementById("wheel");
  wheel.style.transition = "transform 9s cubic-bezier(0.17, 0.67, 0.12, 0.99)";
  wheel.style.transform = `rotate(${totalRotation}deg)`;
  currentRotation = totalRotation;
  logWheel("Rotacao aplicada", { currentRotation });
}

function showPrizeResult(prizeResult) {
  check_offer();
  const savedUsername = localStorage.getItem(STORAGE_KEYS.username) || "";
  const firstName = savedUsername.trim().split(/\s+/)[0] || "";
  const usernameNode = document.getElementById("resultUsername");
  const prizeText = document.getElementById("prizeText");

  if (usernameNode) {
    usernameNode.textContent = firstName;
  }

  prizeText.textContent = prizeResult.label;
  winSound("play");
  document.getElementById("overlay").classList.add("show");
  document.getElementById("resultPopup").style.display = "block";

  logWheel("Popup de resultado exibido", {
    username: firstName,
    prize: prizeResult
  });
}

function closeResult() {
  document.getElementById("overlay").classList.remove("show");
  winSound("stop");
  currentRotation = 0;
  logWheel("Resultado fechado e rotacao reiniciada");
}

function usernameRegistration() {
  const username = document.getElementById("usernameInput").value.trim();

  if (username === "") {
    console.warn("[Wheel] Nome de usuario vazio. O popup de login sera mantido.");
    document.getElementById("usernameInput").focus();
    return;
  }
  
  document.getElementById("resultPopup").style.display = "none";
  logWheel("Usuario registrado", { username });
  backgroundMusic('play')
}

function initializeApp() {
    const state = controller();
    const savedUsername = localStorage.getItem(STORAGE_KEYS.username);
    const usernameInput = document.getElementById("usernameInput");

    document.getElementById("resultPopup").style.display = "none";
    document.getElementById("overlay").classList.add("show");

    if (usernameInput) {
      usernameInput.value = ""; // Limpa o campo de entrada para evitar confusão
      usernameInput.focus();
    }

    logWheel("Aplicacao iniciada aguardando identificacao do usuario", {
      username: savedUsername || null,
      state
    });
}

//* LISTENNERS
document.addEventListener("DOMContentLoaded", initializeApp);

//! Pular etapa de login
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("overlay").classList.remove("show");
  localStorage.setItem(STORAGE_KEYS.username, username);
  addUserToHistory(username);
  document.addEventListener("DOMContentLoaded", backgroundMusic("play"));
});

// Música
window.addEventListener("dblclick", () => {
  if (isBackgroundMusicPlaying) {
    backgroundMusic("pause");
    return;
  }

  backgroundMusic("play");
});

// Historico
document.getElementById("historySection").addEventListener("dblclick", () => {
  window.location.href = "reset.html";
});

//*EXPONDO FUNCOES
window.backgroundMusic = backgroundMusic;
window.wheelSound = wheelSound;
window.winSound = winSound;
window.spinWheel = spinWheel;
window.closeResult = closeResult;