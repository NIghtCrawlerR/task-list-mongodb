var addBtn = $('.add_card'),
    deleteBtn = $('.delete_card'),
    card = $('.card')

var cardId = 0;
var Card = {
    add: function (formEl) {
        var data = this.createData(formEl)
        console.log(data)
        $.ajax({
            url: "cards",
            contentType: "application/json",
            method: "POST",
            data: JSON.stringify({ data }),
            success: function (data) {
                Card.reset(formEl);
                Card.render(data)
                $('#add_card').modal('hide')
            }
        })
    },
    delete: function (card) {
        $.ajax({
            url: 'cards/' + cardId,
            contentType: 'applicaton/json',
            method: 'DELETE',
            success: function () {
                $(".card[data-id=" + cardId + "]").remove()
                $('#add_card').modal('hide')
            }
        })

    },
    edit: function (formEl) {
        var data = this.createData(formEl)
        $.ajax({
            url: "cards/" + cardId,
            contentType: "application/json",
            method: "PUT",
            data: JSON.stringify({ data }),
            success: function (data) {
                Card.reset(formEl);
                Card.update(data);
                $('#add_card').modal('hide')
            }
        })
    },
    get: function (id) {
        $.ajax({
            url: 'cards/' + id,
            contentType: 'application/json',
            method: 'GET',
            success: function (data) {
                cardId = data._id
                for (var key in data) {
                    $('#add_card').find("input[data-field=" + key + "], textarea[data-field=" + key + "]").val(data[key])
                }
                if (data.hasOwnProperty('list')) Card.genList(data['list'])
                $('#add_card').modal('show')
                editable()
            }
        })
    },
    createData: function (formEl) {
        var data = {}
        var invalid = false
        //var inputs = formEl.find('input, textarea, select').not(':input[type=button], :input[type=submit], :input[type=reset]');
        var inputs = formEl.find('[name=data]')
        var list = formEl.find('[name=data_list]')
        $(inputs).each(function () {
            if ($(this).attr('required') && !$(this).val()) {
                $(this).addClass('emptyval')
                invalid = true
                return !1
            }
            data[$(this).data('field')] = $(this).val()
        });
        data['list'] = {}
        $(list).each(function () {
            var fName = $(this).data('field')
            if (data['list'][fName] == undefined) data['list'][fName] = [[$(this).data('task'), $(this).val()]]
            else data['list'][fName].push([$(this).data('task'), $(this).val()])
        })
        if (invalid) return !1
        return data
    },
    reset: function (formEl) {
        var inputs = formEl.find('input, textarea').not(':input[type=button], :input[type=submit], :input[type=reset]');
        $(inputs).each(function () {
            $(this).val('')
        });
        formEl.find('.task-list').remove()
    },
    render: function (data) {
        var html = `<div class="card m-2" style="width: 16rem;" data-id="${data._id}">
            <div class="card-body">
                <h5 class="card-title">${data.title}</h5>
                <p class="card-text">${data.descr}</p>
            </div>
        </div>`
        $('.cards').append(html)
    },
    update: function (data) {
        for (var key in data) {
            $(".card[data-id=" + data._id + "]").find(".card-" + key).text(data[key])
        }
    },
    genList: function (list) {
        var html = ''
        for (var key in list) {
            html += `<div class="form-group task-list" data-listname="${key}">
                <editable-content class="list-name" contenteditable="true">${key}</editable-content>`
            list[key].map((el, i) => {
                var checked = el[1] == 1 ? 'checked' : ''
                html += ` <p><input type="checkbox" id="${key}${i}" name="data_list" data-field="${key}" data-task="${el[0]}" value="${el[1]}" ${checked}>
                <label for="${key}${i}">${el[0]}</label>
                <button type="button" class="close delete-task"><span>&times;</span></button></p>`

            })
            html += `<input type="text" class="form-control mb-3 task-field" name="task" placeholder="Add task..."></div>`
        }

        $('#add_card .modal-body .add_list').before(html)
    }
}


$('#add_card').on('hidden.bs.modal', function () {
    Card.reset($('#add_card'))
})

$(document).on('click', '.show-form', function(e) {
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
    var listname = rand()
    $(this).before(`<div class="form-group task-list" data-listname="${listname}">
    <editable-content class='list-name'>List ${listname}</editable-content>
    <input type="text" class="form-control mb-3 task-field" name="task" placeholder="Add task..."></div>`)
    editable()
})


function rand() {
    return Math.floor(Math.random() * 9999)
}
$(document).on('keydown', '.task-field', function (e) {
    var listname = $(this).closest('.form-group').data('listname')
    if (e.keyCode == 13) {
        var id = rand()
        e.preventDefault()
        $(this).before(`<p><input type="checkbox" id="${id}" name="data_list" data-field="${listname}" data-task="${$(this).val()}" value="0">
        <label for="${id}">${$(this).val()}</label><button type="button" class="close delete-task"><span>&times;</span></button></p>`)
        $(this).val('')
    }
})

var el = document.querySelector('.cards');
var sortable = Sortable.create(el, {
    onSort: function (evt) {
        console.log(evt)
    }
});

function editable() {
    const element = document.querySelectorAll('.list-name');
    element.forEach(function (el) {
        el.addEventListener('edit', (e) => {
            var newVal = e.target.innerHTML
            $(e.target).closest('.task-list').find('[name=data_list]').attr('data-field', newVal)
        });
    })

}

