let data = {};
let currentCategory = "All";
let currentSort = "most-upvotes";

document.addEventListener("DOMContentLoaded", () => {
  const storedData = localStorage.getItem("feedbackData");

    if (storedData) {
      data = JSON.parse(storedData);
      updateSuggestionsView();
      updateRoadmapCounts();
    } else {
      fetch("data.json")
        .then(res => res.json())
        .then(json => {
          data = json;
          saveToLocalStorage(); // guarda lo que trajo del JSON
          updateSuggestionsView();
          updateRoadmapCounts();
        });
    }

    // Mostrar vista para añadir nuevo feedback
    document.querySelectorAll("#add-feedback").forEach(btn => {
      btn.addEventListener("click", () => {
        document.getElementById("layout").classList.add("hidden");
        document.getElementById("roadmap-view").style.display = "none";
        document.getElementById("detail-view").classList.add("hidden");
        document.getElementById("feedback-form-view").classList.remove("hidden");
      });
    });

    // Cancelar y volver a vista principal
    document.getElementById("cancel-feedback").addEventListener("click", () => {
        document.getElementById("feedback-form-view").classList.add("hidden");
        document.getElementById("layout").classList.remove("hidden");
    });

    document.getElementById("go-back-form").addEventListener("click", () => {
      document.getElementById("feedback-form-view").classList.add("hidden");
      document.getElementById("layout").classList.remove("hidden");
    });

    document.getElementById("submit-feedback").addEventListener("click", () => {
      const title = document.getElementById("feedback-title").value.trim();
      const category = document.getElementById("feedback-category").value;
      const description = document.getElementById("feedback-detail").value.trim();

      if (!title || !description) {
        const error = document.querySelector(".error-message");
        error.classList.remove("hidden");
        return;
      } else {
        document.querySelector(".error-message").classList.add("hidden");
      }

      const newFeedback = {
        id: Date.now(), // único
        title,
        category,
        description,
        upvotes: 0,
        status: "suggestion",
        comments: []
      };

      data.productRequests.push(newFeedback);
      saveToLocalStorage(); 
      updateSuggestionsView();
      updateRoadmapCounts();
      document.getElementById("feedback-form-view").classList.add("hidden");
      document.getElementById("main-view").classList.remove("hidden");

      // Limpia campos del formulario
      document.getElementById("feedback-title").value = "";
      document.getElementById("feedback-category").value = "Feature";
      document.getElementById("feedback-detail").value = "";

      
    });


    document.getElementById("category-buttons").addEventListener("click", e => {
      if (e.target.tagName === "BUTTON") {
        currentCategory = e.target.dataset.category;
        updateSuggestionsView();
      }
    });

    document.getElementById("sort-options").addEventListener("change", e => {
      currentSort = e.target.value;
      updateSuggestionsView();
    });

    document.getElementById("view-roadmap").addEventListener("click", () => {
      document.getElementById("layout").classList.add("hidden");
      document.getElementById("roadmap-view").style.display = "block";
      updateRoadmapView();
    });

    document.getElementById("back-to-main").addEventListener("click", () => {
      document.getElementById("roadmap-view").style.display = "none";
      document.getElementById("layout").classList.remove("hidden");
      updateSuggestionsView();
    });

    
  
});

function saveToLocalStorage() {
      localStorage.setItem("feedbackData", JSON.stringify(data));
    }

// Muestra sugerencias en la vista principal
function updateSuggestionsView() {
  const list = document.getElementById("feedback-list");
  list.innerHTML = "";

  // Empieza con TODOS los productRequests
  let filtered = [...data.productRequests];

  // Filtra por categoría, solo si no es "All"
  if (currentCategory !== "All") {
    filtered = filtered.filter(req =>
      req.category.toLowerCase() === currentCategory.toLowerCase()
    );
  }

  // Ordena según la opción seleccionada
  switch (currentSort) {
  case "most-upvotes":
    filtered.sort((a, b) => b.upvotes - a.upvotes);
    break;
  case "least-upvotes":
    filtered.sort((a, b) => a.upvotes - b.upvotes);
    break;
  case "most-comments":
    filtered.sort((a, b) => (b.comments?.length || 0) - (a.comments?.length || 0));
    break;
  case "least-comments":
    filtered.sort((a, b) => (a.comments?.length || 0) - (b.comments?.length || 0));
    break;
  }

  // Mostrar en pantalla
  filtered.forEach(req => {
    const card = document.createElement("div");
    card.className = "feedback-card";

    card.innerHTML = `
      <div class="info">
        <h3>${req.title}</h3>
        <p>${req.description}</p>
        <span class="category">${req.category}</span>
      </div>
      <div class="votes-comments">
        <button class="upvote-btn">⬆ <span>${req.upvotes}</span></button>
        <span>💬 ${req.comments?.reduce((sum, c) => sum + 1 + (c.replies?.length || 0), 0)}</span>
      </div>
    `;

    list.appendChild(card);
    
    const upvoteBtn = card.querySelector(".upvote-btn");
    upvoteBtn.addEventListener("click", () => {
      req.upvotes++;
      upvoteBtn.querySelector("span").textContent = req.upvotes; // actualiza DOM
      saveToLocalStorage();
    });

    card.addEventListener("click", (e) => {
      if (e.target.closest(".upvote-btn")) return; // ignora si fue en el voto
      showDetailView(req.id);
    });
  });

  const countSuggestions = filtered.filter(req => req.status === "suggestion").length;
  document.getElementById("suggestions-count").textContent = countSuggestions;
}

// Cuenta para el roadmap
function updateRoadmapCounts() {
  const planned = data.productRequests.filter(r => r.status === "planned").length;
  const inProgress = data.productRequests.filter(r => r.status === "in-progress").length;
  const live = data.productRequests.filter(r => r.status === "live").length;

  document.getElementById("count-planned").textContent = planned;
  document.getElementById("count-inprogress").textContent = inProgress;
  document.getElementById("count-live").textContent = live;
}

// Muestra la vista roadmap
function updateRoadmapView() {
  const columns = {
    planned: document.getElementById("planned-column"),
    inprogress: document.getElementById("inprogress-column"),
    live: document.getElementById("live-column")
  };

  Object.values(columns).forEach(col => {
    const cardsContainer = col.querySelector(".cards");
    if (cardsContainer) cardsContainer.innerHTML = "";
  });

  data.productRequests.forEach(req => {
    if (req.status === "planned" || req.status === "in-progress" || req.status === "live") {
      const statusKey = req.status === "in-progress" ? "inprogress" : req.status;
      const card = document.createElement("div");
      card.className = `roadmap-card ${statusKey}`;
      card.innerHTML = `
        <h4>${req.title}</h4>
        <p>${req.description}</p>
        <span class="category">${req.category}</span>
        <div class="votes-comments">
          <button class="upvote-btn">⬆ <span>${req.upvotes}</span></button>
          <span class="comment-count">💬 ${req.comments?.length || 0}</span>
        </div>
      `;

      const upvoteBtn = card.querySelector(".upvote-btn");
      upvoteBtn.addEventListener("click", (e) => {
        e.stopPropagation(); // ← evita que se dispare showDetailView al votar
        req.upvotes++;
        upvoteBtn.querySelector("span").textContent = req.upvotes;
        saveToLocalStorage();
      });

      card.addEventListener("click", () => {
        
        showDetailView(req.id);
      });

      
      columns[statusKey].querySelector(".cards").appendChild(card);
    }
  });

  // Actualizar contadores por columna
  document.getElementById("planned-total").textContent =
    data.productRequests.filter(r => r.status === "planned").length;

  document.getElementById("inprogress-total").textContent =
    data.productRequests.filter(r => r.status === "in-progress").length;

  document.getElementById("live-total").textContent =
    data.productRequests.filter(r => r.status === "live").length;

}

function showDetailView(id) {
  const feedback = data.productRequests.find(f => f.id === id);
  if (!feedback) return;
  
  document.getElementById("detail-view").dataset.id = id;

  // Ocultar vistas innecesarias
  document.getElementById("roadmap-view").style.display = "none";
  document.getElementById("layout").classList.add("hidden");
  document.getElementById("detail-view").classList.remove("hidden");

  const detail = document.getElementById("detail-container");
  detail.innerHTML = `
    <div class="feedback-card">
      <div class="info">
        <h3>${feedback.title}</h3>
        <p>${feedback.description}</p>
        <span class="category">${feedback.category}</span>
      </div>
      <div class="votes-comments">
        <button class="upvote-btn">⬆ <span>${feedback.upvotes}</span></button>
        <span class="comment-count">💬 0</span>
      </div>
    </div>

    <h3 class="comments-title">0 Comments</h3>
    <div id="comments-list">
      ${renderComments(feedback.comments || [])}
    </div>

    <div class="comment-box">
      <h3>Add Comment</h3>
      <textarea id="new-comment" maxlength="250" placeholder="Type your comment here"></textarea>
      <button id="post-comment">Post Comment</button>
    </div>
  `;

  // Upvote button
  const detailUpvoteBtn = detail.querySelector(".upvote-btn");
  detailUpvoteBtn.addEventListener("click", () => {
    feedback.upvotes++;
    detailUpvoteBtn.querySelector("span").textContent = feedback.upvotes;
    saveToLocalStorage();
  });

  // Post Comment
  detail.querySelector("#post-comment").addEventListener("click", () => {
    const text = detail.querySelector("#new-comment").value.trim();
    if (!text) return alert("Comment can't be empty.");

    const newComment = {
      id: Date.now(),
      content: text,
      user: data.currentUser
    };

    feedback.comments = feedback.comments || [];
    feedback.comments.push(newComment);
    saveToLocalStorage();

    const updatedHTML = renderComments(feedback.comments);
    detail.querySelector("#comments-list").innerHTML = updatedHTML;

    const totalComments = feedback.comments.reduce(
      (sum, c) => sum + 1 + (c.replies?.length || 0), 0
    );
    detail.querySelector(".comment-count").textContent = `💬 ${totalComments}`;
    detail.querySelector(".comments-title").textContent = `${totalComments} Comments`;

    detail.querySelector("#new-comment").value = "";
    activateReplyEvents(detail, feedback.id);
  });

  // Edit feedback
  const editBtn = document.getElementById("edit-feedback");
  if (editBtn) {
    editBtn.onclick = () => showEditFeedbackView(feedback.id);
  }

  const goBackBtn = document.getElementById("go-back");
  if (goBackBtn) {
    goBackBtn.onclick = () => {
      document.getElementById("detail-view").classList.add("hidden");
      document.getElementById("layout").classList.remove("hidden");
      updateSuggestionsView(); // refresca datos si hubo cambios
    };
  }

  // Inicializa replies
  const totalComments = feedback.comments.reduce(
    (sum, c) => sum + 1 + (c.replies?.length || 0), 0
  );
  detail.querySelector(".comment-count").textContent = `💬 ${totalComments}`;
  detail.querySelector(".comments-title").textContent = `${totalComments} Comments`;

  activateReplyEvents(detail, feedback.id);
}

function activateReplyEvents(scope) {

  const feedbackId = Number(document.getElementById("detail-view").dataset.id);

  scope.querySelectorAll(".reply-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const commentDiv = e.target.closest(".comment");
      commentDiv.querySelector(".reply-box").classList.toggle("hidden");
    });
  });

  scope.querySelectorAll(".send-reply-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const commentDiv = e.target.closest(".comment");
      const commentId = Number(commentDiv.dataset.commentId);
      const textarea = commentDiv.querySelector("textarea");
      const replyText = textarea.value.trim();
      if (!replyText) return;

      const feedback = data.productRequests.find(f => f.id === feedbackId);
      const parentComment = feedback.comments.find(c => c.id === commentId);

      parentComment.replies = parentComment.replies || [];
      parentComment.replies.push({
        content: replyText,
        replyingTo: parentComment.user.username,
        user: data.currentUser
      });

      saveToLocalStorage();

      // actualizar comentarios
      const updatedHTML = renderComments(feedback.comments);
      const commentsList = document.getElementById("comments-list");
      commentsList.innerHTML = updatedHTML;

      // actualizar contador
      const totalComments = feedback.comments.reduce(
        (sum, c) => sum + 1 + (c.replies?.length || 0), 0
      );
      document.querySelector(".comment-count").textContent = `💬 ${totalComments}`;
      document.querySelector(".comments-title").textContent = `${totalComments} Comments`;

      // volver a activar los listeners
      activateReplyEvents(document.getElementById("detail-container"), feedbackId);


    });
  });
}


function renderComments(comments) {
  return comments.map(comment => {
    const repliesHtml = (comment.replies || []).map(reply => `
      <div class="reply">
        <img class="avatar" src="${getUserImage(reply.user.name)}" alt="${reply.user.name}" />
        <div class="reply-body">
          <strong>${reply.user.name}</strong> @${reply.user.username}
          <p><span class="mention">@${reply.replyingTo}</span> ${reply.content}</p>
        </div>
      </div>
    `).join("");

    return `
      <div class="comment" data-comment-id="${comment.id}">
        <div class="comment-header">
          <img class="avatar" src="${getUserImage(comment.user.name)}" alt="${comment.user.name}" />
          <div class="user-info">
            <strong>${comment.user.name}</strong>
            <span>@${comment.user.username}</span>
          </div>
          <button class="btn go-back reply-btn">Reply</button>
        </div>
        <p>${comment.content}</p>

        <div class="replies">
          ${repliesHtml}
        </div>

        <div class="reply-box hidden">
          <textarea placeholder="Type your reply here..."></textarea>
          <button class="send-reply-btn">Post Reply</button>
        </div>
      </div>
    `;
  }).join("");
}


document.getElementById("go-back").addEventListener("click", () => {
  document.getElementById("detail-view").classList.add("hidden");
  document.getElementById("main-view").classList.remove("hidden");
  document.getElementById("sidebar").classList.remove("hidden");
  document.querySelector("main").classList.remove("hidden");
  document.getElementById("layout").classList.remove("hidden");
  updateSuggestionsView();
});

function showEditFeedbackView(id) {
  const feedback = data.productRequests.find(f => f.id === id);
  if (!feedback) return;

  // Ocultar otras vistas
  document.getElementById("detail-view").classList.add("hidden");
  document.getElementById("edit-feedback-view").classList.remove("hidden");

  // Rellenar campos
  document.getElementById("edit-title").textContent = `Editing '${feedback.title}'`;
  document.getElementById("edit-feedback-title").value = feedback.title;
  document.getElementById("edit-feedback-category").value = feedback.category;
  document.getElementById("edit-feedback-status").value = feedback.status;
  document.getElementById("edit-feedback-detail").value = feedback.description;

  // Guardar cambios
  document.getElementById("save-feedback").onclick = () => {
    feedback.title = document.getElementById("edit-feedback-title").value.trim();
    feedback.category = document.getElementById("edit-feedback-category").value;
    feedback.status = document.getElementById("edit-feedback-status").value;
    feedback.description = document.getElementById("edit-feedback-detail").value.trim();

    saveToLocalStorage();
    updateSuggestionsView();
    updateRoadmapCounts();
    showDetailView(id);
    document.getElementById("edit-feedback-view").classList.add("hidden");
  };

  // Eliminar feedback
  document.getElementById("delete-feedback").onclick = () => {
    const index = data.productRequests.findIndex(f => f.id === id);
    if (index !== -1) {
      data.productRequests.splice(index, 1);
      saveToLocalStorage();
      updateSuggestionsView();
      updateRoadmapCounts();
      document.getElementById("edit-feedback-view").classList.add("hidden");
      document.getElementById("layout").classList.remove("hidden");
    }
  };

  // Cancelar sin guardar
  document.getElementById("edit-cancel").onclick = () => {
    document.getElementById("edit-feedback-view").classList.add("hidden");
    showDetailView(id);
  };

  // Go back
  document.getElementById("edit-go-back").onclick = () => {
    document.getElementById("edit-feedback-view").classList.add("hidden");
    showDetailView(id);
  };
}

function getUserImage(name) {
  const nameMap = {
    "Anne Valentine": "image-anne.jpg",
    "Elijah Moss": "image-elijah.jpg",
    "George Will": "image-george.jpg",
    "Jackson Barker": "image-jackson.jpg",
    "James Skinner": "image-james.jpg",
    "Javier Green": "image-javier.jpg",
    "Judah Mathis": "image-judah.jpg",
    "Roxanne Travis": "image-roxanne.jpg",
    "Ryan Welles": "image-ryan.jpg",
    "Suzanne Chang": "image-suzanne.jpg",
    "Thomas Hood": "image-thomas.jpg",
    "Victoria Mejia": "image-victoria.jpg",
    "Zena Kelley": "image-zena.jpg"
  };

  return `assets/user-images/${nameMap[name] || "image-default.jpg"}`;
}
