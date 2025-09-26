// ===== AUTENTICAÇÃO =====
// ATENÇÃO: Esta é uma autenticação client-side apenas para demonstração.
// NÃO é segura para uso em produção! Em um ambiente real, use autenticação server-side.

const CREDENTIALS = {
  username: "victoria",
  password: "minhaprincesa",
}

// Elementos do DOM
const loginPage = document.getElementById("login-page")
const mainPage = document.getElementById("main-page")
const loginForm = document.getElementById("login-form")
const errorMessage = document.getElementById("error-message")
const logoutBtn = document.getElementById("logout-btn")

// ===== FUNCIONALIDADES DE LOGIN =====
loginForm.addEventListener("submit", (e) => {
  e.preventDefault()

  const username = document.getElementById("username").value.trim()
  const password = document.getElementById("password").value

  // Validação das credenciais (client-side apenas para demo)
  if (username === CREDENTIALS.username && password === CREDENTIALS.password) {
    // Login bem-sucedido - transição suave para página principal
    loginPage.style.opacity = "0"
    setTimeout(() => {
      loginPage.classList.remove("active")
      mainPage.classList.add("active")
      mainPage.style.opacity = "0"
      setTimeout(() => {
        mainPage.style.opacity = "1"
      }, 50)
    }, 300)

    // Limpar formulário
    loginForm.reset()
    hideError()

    // Inicializar página principal
    initMainPage()
  } else {
    // Credenciais incorretas - mostrar erro amigável
    showError("Ops! Usuário ou senha incorretos. Tente novamente! 💙")

    // Limpar campos após erro
    document.getElementById("password").value = ""
    document.getElementById("username").focus()
  }
})

// Função para mostrar erro
function showError(message) {
  errorMessage.textContent = message
  errorMessage.style.display = "block"
  errorMessage.style.animation = "fadeInUp 0.3s ease-out"
}

// Função para esconder erro
function hideError() {
  errorMessage.style.display = "none"
}

// Logout
logoutBtn.addEventListener("click", () => {
  mainPage.style.opacity = "0"
  setTimeout(() => {
    mainPage.classList.remove("active")
    loginPage.classList.add("active")
    loginPage.style.opacity = "1"
  }, 300)
})

// ===== FUNCIONALIDADES DA PÁGINA PRINCIPAL =====
let mediaFiles = [] // Array para armazenar arquivos de mídia

function initMainPage() {
  // Definir data atual no rodapé
  const currentDate = new Date().toLocaleDateString("pt-BR")
  document.getElementById("current-date").textContent = currentDate

  loadSavedMedia()

  // Inicializar funcionalidades
  initRomanticText()
  initFileUpload()
  initModal()
}

function loadSavedMedia() {
  try {
    const savedMedia = localStorage.getItem("romanticSiteMedia")
    if (savedMedia) {
      mediaFiles = JSON.parse(savedMedia)

      // Recriar galeria com mídias salvas
      mediaFiles.forEach((mediaData, index) => {
        addToGallery(mediaData, index)
      })
    }
  } catch (error) {
    console.log("[v0] Erro ao carregar mídias salvas:", error)
    mediaFiles = []
  }
}

function saveMediaToStorage() {
  try {
    localStorage.setItem("romanticSiteMedia", JSON.stringify(mediaFiles))
  } catch (error) {
    console.log("[v0] Erro ao salvar mídia:", error)
    // Se localStorage estiver cheio, mostrar aviso
    if (error.name === "QuotaExceededError") {
      alert("Espaço de armazenamento cheio! Algumas mídias podem não ser salvas.")
    }
  }
}

// ===== TEXTO ROMÂNTICO =====
function initRomanticText() {
  const toggleBtn = document.getElementById("toggle-text-btn")
  const romanticText = document.getElementById("romantic-text")

  toggleBtn.addEventListener("click", () => {
    romanticText.classList.toggle("show")

    // Atualizar texto do botão
    if (romanticText.classList.contains("show")) {
      toggleBtn.textContent = "Ocultar Texto"
    } else {
      toggleBtn.textContent = "Mostrar/Editar Texto"
    }
  })
}

// ===== UPLOAD DE ARQUIVOS =====
function initFileUpload() {
  const uploadBtn = document.getElementById("upload-btn")
  const fileInput = document.getElementById("file-input")

  uploadBtn.addEventListener("click", () => {
    fileInput.click()
  })

  fileInput.addEventListener("change", (e) => {
    const files = Array.from(e.target.files)

    files.forEach((file) => {
      // Validar tipo de arquivo
      if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
        processFile(file)
      } else {
        alert("Por favor, selecione apenas imagens (JPG, PNG) ou vídeos (MP4).")
      }
    })

    // Limpar input para permitir re-upload do mesmo arquivo
    fileInput.value = ""
  })
}

// Processar arquivo usando FileReader
function processFile(file) {
  const reader = new FileReader()

  reader.onload = (e) => {
    const mediaData = {
      name: file.name,
      type: file.type,
      data: e.target.result,
      size: file.size,
      timestamp: Date.now(),
    }

    mediaFiles.push(mediaData)
    addToGallery(mediaData, mediaFiles.length - 1)

    saveMediaToStorage()
  }

  reader.readAsDataURL(file)
}

// Adicionar item à galeria
function addToGallery(mediaData, index) {
  const gallery = document.getElementById("gallery")

  // Remover mensagem de galeria vazia se existir
  const emptyGallery = gallery.querySelector(".empty-gallery")
  if (emptyGallery) {
    emptyGallery.remove()
  }

  // Criar elemento da galeria
  const galleryItem = document.createElement("div")
  galleryItem.className = "gallery-item"
  galleryItem.dataset.index = index

  if (mediaData.type.startsWith("image/")) {
    // Imagem
    galleryItem.innerHTML = `
            <img src="${mediaData.data}" alt="${mediaData.name}" loading="lazy">
            <div class="delete-btn" onclick="deleteMedia(${index})" title="Excluir">×</div>
        `
  } else if (mediaData.type.startsWith("video/")) {
    // Vídeo com ícone de play
    galleryItem.innerHTML = `
            <video src="${mediaData.data}" muted></video>
            <div class="play-icon">▶</div>
            <div class="delete-btn" onclick="deleteMedia(${index})" title="Excluir">×</div>
        `
  }

  // Adicionar evento de clique para abrir modal (evitar clique no botão delete)
  galleryItem.addEventListener("click", (e) => {
    if (!e.target.classList.contains("delete-btn")) {
      openModal(index)
    }
  })

  gallery.appendChild(galleryItem)
}

function deleteMedia(index) {
  if (confirm("Tem certeza que deseja excluir esta mídia?")) {
    // Remover do array
    mediaFiles.splice(index, 1)

    // Salvar no localStorage
    saveMediaToStorage()

    // Recriar galeria
    recreateGallery()
  }
}

function recreateGallery() {
  const gallery = document.getElementById("gallery")
  gallery.innerHTML = ""

  if (mediaFiles.length === 0) {
    gallery.innerHTML =
      '<p class="empty-gallery">Nenhuma foto ou vídeo ainda. Clique em "Adicionar Mídia" para começar!</p>'
  } else {
    mediaFiles.forEach((mediaData, index) => {
      addToGallery(mediaData, index)
    })
  }
}

// ===== MODAL PARA VISUALIZAÇÃO =====
function initModal() {
  const modal = document.getElementById("media-modal")
  const closeBtn = document.querySelector(".close-modal")

  // Fechar modal
  closeBtn.addEventListener("click", closeModal)

  // Fechar modal clicando fora do conteúdo
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal()
    }
  })

  // Fechar modal com tecla ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("show")) {
      closeModal()
    }
  })
}

function openModal(index) {
  const modal = document.getElementById("media-modal")
  const container = document.getElementById("modal-media-container")
  const mediaData = mediaFiles[index]

  // Limpar conteúdo anterior
  container.innerHTML = ""

  if (mediaData.type.startsWith("image/")) {
    // Exibir imagem
    const img = document.createElement("img")
    img.src = mediaData.data
    img.alt = mediaData.name
    container.appendChild(img)
  } else if (mediaData.type.startsWith("video/")) {
    // Exibir vídeo
    const video = document.createElement("video")
    video.src = mediaData.data
    video.controls = true
    video.autoplay = true
    container.appendChild(video)
  }

  // Mostrar modal
  modal.classList.add("show")
  document.body.style.overflow = "hidden" // Prevenir scroll da página
}

function closeModal() {
  const modal = document.getElementById("media-modal")
  const container = document.getElementById("modal-media-container")

  // Parar vídeos se estiverem tocando
  const videos = container.querySelectorAll("video")
  videos.forEach((video) => {
    video.pause()
    video.currentTime = 0
  })

  modal.classList.remove("show")
  document.body.style.overflow = "" // Restaurar scroll da página
}

// ===== INICIALIZAÇÃO =====
// Garantir que a página de login seja mostrada inicialmente
document.addEventListener("DOMContentLoaded", () => {
  loginPage.classList.add("active")
  document.getElementById("username").focus()
})

// Adicionar transições suaves às páginas
loginPage.style.transition = "opacity 0.3s ease-out"
mainPage.style.transition = "opacity 0.3s ease-out"
