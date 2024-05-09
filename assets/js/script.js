// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks"));
let nextId = JSON.parse(localStorage.getItem("nextId"));


// Todo: create a function to generate a unique task id
function generateTaskId() {
    if (!nextId) {
        nextId = 1;
    } else {
        nextId++;
    }
    localStorage.setItem("nextId", JSON.stringify(nextId));
    return nextId;
}

function readTasksFromStorage() {
    let tasks = JSON.parse(localStorage.getItem("tasks"));
    if (!tasks) {
        tasks = [];
    }
    return tasks;
}

function saveTasksToStorage(tasks) {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}


// Todo: create a function to create a task card
function createTaskCard(task) {
    const taskCard = $('<div>')
        .addClass('card project-card draggable my-3')
        .attr('data-task-id', task.id)
    const taskCardHeader = $('<div>')
        .addClass('card-header h4')
        .text(task.name);
    const taskCardBody = $('<div>')
        .addClass('card-body')
    const taskCardDescription = ($('<p>')
        .addClass('card-text')
        .text(task.description));
    const taskCardDueDate = ($('<p>')
        .addClass('card-text')
        .text(task.dueDate));
    const taskCardDeleteBtn = $('<button>')
        .addClass('btn btn-danger delete-btn')
        .text('Delete')
        .attr('data-task-id', task.id);
    taskCardDeleteBtn.on('click', handleDeleteTask);

    if (task.dueDate && task.status !== 'done') {
        const now = dayjs();
        const taskDueDate = dayjs(task.dueDate, 'DD/MM/YYYY');

        if (now.isSame(taskDueDate, 'day')) {
            taskCard.addClass('bg-warning text-white');
        } else if (now.isAfter(taskDueDate)) {
            taskCard.addClass('bg-danger text-white');
            taskCardDeleteBtn.addClass('border-light');
        }
    }

    taskCardBody.append(taskCardDescription, taskCardDueDate, taskCardDeleteBtn);
    taskCard.append(taskCardHeader, taskCardBody);

    return taskCard;
}

// Todo: create a function to render the task list and make cards draggable
function renderTaskList() {
    const tasks = readTasksFromStorage();

    const todoList = $('#todo-cards');


    const inProgressList = $('#in-progress-cards');


    const doneList = $('#done-cards');

    todoList.empty();
    inProgressList.empty();
    doneList.empty();

    for (let task of tasks) {
        if (task.status === 'to-do') {
            todoList.append(createTaskCard(task));
        } else if (task.status === 'in-progress') {
            inProgressList.append(createTaskCard(task));
        } else if (task.status === 'done') {
            doneList.append(createTaskCard(task));
        }
    }

    $('.draggable').draggable({
        opacity: 0.7,
        zIndex: 100,
        helper: function (e) {
            const original = $(e.target).hasClass('ui-draggable')
                ? $(e.target)
                : $(e.target).closest('.ui-draggable');
            return original.clone().css({
                width: original.outerWidth(),
            });
        },
    });
}

// Todo: create a function to handle adding a new task
function handleAddTask(event){
    event.preventDefault();

    const taskName = $('#Task-Name').val();
    const taskDescription = $('#Task-Description').val();
    const taskDueDate = $('#Task-Due').val();

    const newTask = {
        id: generateTaskId(),
        name: taskName,
        description: taskDescription,
        dueDate: taskDueDate,
        status: 'to-do',
    };
    
    const tasks = readTasksFromStorage();
    tasks.push(newTask);

    saveTasksToStorage(tasks);
    renderTaskList();
    
    $('#Task-Name').val('');
    $('#Task-Description').val('');
    $('#Task-Due').val('');
}

// Todo: create a function to handle deleting a task
function handleDeleteTask(event){
    const taskId = $(this).data("task-id");
    const tasks = readTasksFromStorage();

    tasks.forEach((task, index) => {
    if (task.id === taskId) {
        tasks.splice(index, 1);
    }
    });

    saveTasksToStorage(tasks);

    renderTaskList();
}

// Todo: create a function to handle dropping a task into a new status lane
function handleDrop(event, ui) {

    const taskId = ui.draggable[0].dataset.taskId;

    const newStatus = event.target.id;

    const tasks = readTasksFromStorage();

    console.log(taskId);

    console.log(newStatus);

    for (let task of tasks) {
        if (task.id == taskId) {
        task.status = newStatus;
        }
    }

    saveTasksToStorage(tasks);
    renderTaskList();
}

$('#add-task-form').on('submit', handleAddTask);

// Todo: when the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
    
    renderTaskList();

    $('#Task-Due').datepicker({
        changeMonth: true,
        changeYear: true,
    })

    $('.lane').droppable({
        accept: '.draggable',
        drop: handleDrop
    });
});
