// Elementos del DOM
const cardTask = document.querySelector(".cardTask");/* Donde van los post its */
const formTarea = document.querySelector(".formAnnadir"); /* Formulario */
const dialogConfirm = document.querySelector("#customDialogConfirm");/* Dialog con mensaje de aceptar */
const btnAccept = document.querySelector("#accept");
const btnCancel = document.querySelector("#cancel");
const btnCloseDialog = document.querySelector("#close-button-confirm"); /* X dialog */
const btnEnviar = document.querySelector(".btnEnviar");
const inputTitle = document.querySelector("#title-task");
const inputDescription = document.querySelector("#description-task");
const inputDate = document.querySelector("#date-task");
const inputPriority = document.querySelector("#priority-task");
const hiddenParagraph = document.querySelector("#hiddenParagraph");

/* Variables globales */
let taskIdToDelete = null;
let isEditing = false;

/* Para que las tareas se carguen al iniciar la página, también llaman a las toasts */
document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("arrayTasks")) {
    renderTasks();
    checkUpcomingTasks();
  }
});
function checkUpcomingTasks() {
  const arrayTasks = JSON.parse(localStorage.getItem("arrayTasks")) || [];
  const today = new Date();/* Crea un objeto Date con la fecha y hora actual del sistema, y lo guarda en la variable today*/
  
  arrayTasks.forEach(task => {
    const taskDate = new Date(task.date);/* Convierte la fecha de vencimiento de la tarea (task.date, que es un string) en un objeto Date, y lo guarda en taskDate */
    const diffTime = taskDate - today;/* Resta today a taskDate para obtener la diferencia de tiempo en milisegundos entre la fecha de la tarea y la fecha actual. */
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));/* Convierte esa diferencia de milisegundos a días: */

    if (diffDays >= 0 && diffDays < 3 && !task.completed) {
      showToast( `¡La tarea "${task.title}" vence en ${diffDays} día(s)!`);/*  Llama a la función showToast */
    }
  });
}
function showToast(message) {/* Esta función crea y muestra una notificación tipo "toast". */
  const toastContainer = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `
    <span>${message}</span>
    <div class="toast-progress"></div>
  `;

 
  toastContainer.appendChild(toast);

  // Esperar 4 segundos, luego reproducir animación de salida y eliminar
  setTimeout(() => {
    toast.style.animation = "slideOut 0.5s ease forwards";
    setTimeout(() => toast.remove(), 500); // esperar que acabe la animación
  }, 5000);
}

// Guardar nueva tarea
formTarea.addEventListener("submit", saveTask);

/* ---------------------------------------------------------------------------------------------- */
/*                              FUNCTION SAVETASK                                                 */
/* ---------------------------------------------------------------------------------------------- */
function saveTask(e) {
  e.preventDefault();

  const titleTask = inputTitle.value;
  const descriptionTask = inputDescription.value;
  const dateTask = inputDate.value;
  const priorityTask = inputPriority.value;

  let color;
  const today = new Date().toISOString().split("T")[0]; // "2025-06-19"
  
  if (priorityTask === "Baja") {
    color = "#acdeaa";
  } else if (priorityTask === "Media") {
    color = "#ffda7d";
  } else if (priorityTask === "Alta") {
    color = "#ff8c5f";
  } else {
    color = "#fad7dc";
  }
  
  if (dateTask < today) {
    color = "#ccc"; // Prioridad secundaria: si está vencida, se sobrepone el color
  }

// Validación de campos vacíos con mensajes y estilos
let hasError = false;

// Validar título
if (titleTask === "") {
  inputTitle.style.border = "2px solid #e22424";
  hasError = true;
} else {
  inputTitle.style.border = "1px solid #aaa";
}
// Validar fecha
if (dateTask === "") {
  inputDate.style.border = "2px solid #e22424";
  hasError = true;
} else {
  inputDate.style.border = "1px solid #aaa";
}

if (hasError) return;

  const arrayTasks = JSON.parse(localStorage.getItem("arrayTasks")) || [];

  if (isEditing) {
   const arrayTasks = JSON.parse(localStorage.getItem("arrayTasks")) || [];
    const id = parseInt(btnEnviar.getAttribute("data-id"));
    
    arrayTasks.forEach(task => {
      if (task.id === id) {
        task.title = titleTask;
        task.description = descriptionTask;
        task.date = dateTask;
        task.priority = priorityTask;
        task.color = color;
      }
    })
    localStorage.setItem("arrayTasks", JSON.stringify(arrayTasks));
    renderTasks();
    formTarea.reset();
    isEditing = false;
    btnEnviar.textContent = "Añadir tarea";
    formTarea.style.border = "none";
    btnEnviar.removeAttribute("data-id");
    return;
  }
    const task = {
      id: Date.now(),
      title: titleTask,
      description: descriptionTask,
      date: dateTask,
      priority: priorityTask,
      completed: false,
      color: color,
    };

    arrayTasks.push(task); 
  

  localStorage.setItem("arrayTasks", JSON.stringify(arrayTasks));
  formTarea.reset();

  renderTasks();
}



/* ---------------------------------------------------------------------------------------------- */
/*                              FUNCTION RENDERTASK                                               */
/* ---------------------------------------------------------------------------------------------- */

function renderTasks() {
  const arrayTasks = JSON.parse(localStorage.getItem("arrayTasks")) || [];
  cardTask.innerHTML = "";

  arrayTasks.forEach((task) => {
    // Si está completada, forzamos el color a morado
    if (task.completed) {
      task.color = "#c1c8e3";
    }
   

    cardTask.innerHTML += `
      <div class="container" style="background-color: ${task.color}">
        <h2>${task.title}</h2>
        <p class="description">${task.description}</p>
        <div class="container-priority">
          <p class="fecha"><i class="fa-solid fa-calendar-days"></i> ${task.date}</p>
          <p><i class="fa-solid fa-triangle-exclamation"></i> ${task.priority}</p>
        </div>
        <div class="buttons">
          <button class="btn-delete" data-id="${task.id}"><i class="fa-regular fa-trash-can trash"></i></button>
          <button class="btn-edit" data-id="${task.id}"><i class="fa-solid fa-pen edit"></i></button>
          <button class="btn-complete" data-id="${task.id}">
            ${task.completed 
              ? '<i class="fa-regular fa-circle-check"></i>' 
              : '<i class="fa-regular fa-circle"></i>'}
          </button>
        </div>
        <i class="fa-solid fa-map-pin pin"></i>
      </div>
    `;
  });

  // Eventos para botones
  document.querySelectorAll(".btn-delete").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      taskIdToDelete = parseInt(e.currentTarget.dataset.id);
      dialogConfirm.style.display = "flex";
      dialogConfirm.showModal();
    });
  });

  document.querySelectorAll(".btn-edit").forEach((btn) => {
    btn.addEventListener("click", editTask);
  });

  document.querySelectorAll(".btn-complete").forEach((btn) => {
    btn.addEventListener("click", completeTask);
  });
}

// Confirmar eliminación
btnAccept.addEventListener("click", () => {
  if (taskIdToDelete !== null) {
    const arrayTasks = JSON.parse(localStorage.getItem("arrayTasks")) || [];
    const newArrayTasks = arrayTasks.filter(task => task.id !== taskIdToDelete);
    localStorage.setItem("arrayTasks", JSON.stringify(newArrayTasks));
    console.log("Array actualizado tras eliminar:", newArrayTasks);
    taskIdToDelete = null;
    closeDialog();
    renderTasks();
  }
});

// Cerrar el modal de confirmación
btnCancel.addEventListener("click", closeDialog);
btnCloseDialog.addEventListener("click", closeDialog);

/* ---------------------------------------------------------------------------------------------- */
/*                              FUNCTION CLOSEDIAlOG                                              */
/* ---------------------------------------------------------------------------------------------- */
function closeDialog() {
  dialogConfirm.close();
  dialogConfirm.style.removeProperty("display");
}

/* ---------------------------------------------------------------------------------------------- */
/*                              FUNCTION COMPLETETASK                                             */
/* ---------------------------------------------------------------------------------------------- */
function completeTask(e) {
  const id = parseInt(e.currentTarget.dataset.id);
  const arrayTasks = JSON.parse(localStorage.getItem("arrayTasks")) || [];

  arrayTasks.forEach(task => {
    if (task.id === id) {
      task.completed = !task.completed;
      console.log(`Tarea completada: ${task.title}`);
    }
  });

  localStorage.setItem("arrayTasks", JSON.stringify(arrayTasks));
  renderTasks();
}

// Placeholder para editar
function editTask(e) {
  const id = parseInt(e.currentTarget.dataset.id);
  const arrayTasks = JSON.parse(localStorage.getItem("arrayTasks"));
  const task = arrayTasks.find(task => task.id === id);


  inputTitle.value = task.title;
  inputDescription.value = task.description;
  inputDate.value = task.date;
  inputPriority.value = task.priority;

  btnEnviar.textContent = "Guardar cambios";
  formTarea.style.border = `4px solid ${task.color}`;

  btnEnviar.setAttribute("data-id", id);
  isEditing = true;
}
const hamburger =document.querySelector(".fa-bars");
const menuLateral = document.querySelector(".cuerpo");
  hamburger.addEventListener("click", ()=>{
    menuLateral.classList.toggle("show-menu")
  })
