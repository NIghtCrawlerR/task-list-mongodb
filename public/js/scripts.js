//Events

$('#add_card').on('hidden.bs.modal', function () {
    Card.reset($('#add_card'))
})

$(document).on('click', '.show-form', function (e) {
    $('#add_card .modal-title').text('New card')
    $(".for-add").show();
    $(".for-edit").hide();
})

$(document).on('click', '.add_card', function (e) {
    e.preventDefault();
    Card.add($('.new_card'))
})
$(document).on('click', '.edit_card', function (e) {
    e.preventDefault();
    Card.edit($('.new_card'))
})
$(document).on('click', '.delete-task', function () {
    $(this).closest('p').remove();
})
$(document).on('change', '[name=data_list]', function () {
    var bool = $(this).prop('checked') ? 1 : 0
    $(this).val(bool)
})
$(document).on('click', '.card', function () {
    var id = $(this).data('id')
    var title = $(this).find('.card-title').text()
    $(".for-add").hide();
    $(".for-edit").show();
    $('#add_card .modal-title').text(title)
    Card.get(id)
})
$(document).on('click', '.delete_card', function () {
    swal({
        title: "Are you sure?",
        icon: "warning",
        buttons: true,
        dangerMode: true,
    })
        .then((willDelete) => {
            if (willDelete) Card.delete()
            else return
        });
})
$(document).on('click', '.add_list', function () {
    var listname = $('.task-list').length
    $(this).before(`<div class="form-group task-list" data-listname="${listname}"><div class="handle">|||</div>
    <editable-content class='list-name'>List ${listname}</editable-content>
    <input type="text" class="form-control mb-3 task-field" name="task" placeholder="Add task..."></div>`)
    editable()
})

$(document).on('keydown', '.task-field', function (e) {
    var listname = $(this).closest('.form-group').data('listname')
    if (e.keyCode == 13) {
        var id = rand()
        e.preventDefault()
        $(this).before(`<p><input type="checkbox" name="data_list" data-field="${listname}" data-task="${$(this).val()}" value="0">
        <span class="checkbox"><span>
        <editable-content class="task">${$(this).val()}</editable-content><button type="button" class="close delete-task"><span>&times;</span></button></p>`)
        $(this).val('')
    }
})


//functions
function rand() {
    return Math.floor(Math.random() * 9999)
}

function sortableList() {
    var list = document.querySelector('.task-list-wrap');
    var sortable = Sortable.create(list, {
        handle: '.handle',
        ghostClass: 'ghost',
    });
}
function sortableCards() {
    var el = document.querySelector('.cards');
    var sortable = Sortable.create(el, {
        ghostClass: 'ghost',
        store: {
            set: function (sortable) {
                var order = sortable.toArray();
                $.ajax({
                    url: "cards",
                    contentType: "application/json",
                    method: "PUT",
                    data: JSON.stringify(order),
                    success: function (data) {
                        
                    }
                })
                console.log(order)
            }
        }
    });
}
sortableCards()

function editable() {
    const element = document.querySelectorAll('.list-name');
    element.forEach(function (el) {
        el.addEventListener('edit', (e) => {
            var newVal = e.target.innerHTML
            $(e.target).closest('.task-list').find('[name=data_list]').attr('data-field', newVal)
        });
    })
    const task = document.querySelectorAll('.task');
    task.forEach(function (el) {
        el.addEventListener('edit', (e) => {
            var newVal = e.target.innerHTML
            $(e.target).closest('p').find('input').attr('data-task', newVal)
        });
    })
}