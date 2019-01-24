var addBtn = $('.add_card'),
    deleteBtn = $('.delete_card'),
    card = $('.card')

var cardId = 0;
var Card = {
    add: function (formEl) {
        if (cardId == 0) {
            var data = this.createData(formEl)
            console.log(data)

            $.ajax({
                url: "cards",
                contentType: "application/json",
                method: "POST",
                data: JSON.stringify({ data }),
                success: function (data) {
                    console.log(data)
                    Card.reset(formEl);
                    Card.render(data)
                    $('#add_card').modal('hide')
                }
            })
        }
        else {
            this.edit(formEl);
        }
    },
    delete: function (card) {
        $.ajax({
            url: 'cards/' + cardId,
            contentType: 'applicaton/json',
            method: 'DELETE',
            success: function () {
                $(".card[data-id=" + cardId + "]").remove()
                $('#add_card').modal('hide')
                cardId = 0
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
        cardId = 0;
    },
    get: function (id) {
        $.ajax({
            url: 'cards/' + id,
            contentType: 'application/json',
            method: 'GET',
            success: function (data) {
                cardId = data._id
                for (var key in data) {
                    $('#add_card').find("input[name=" + key + "], textarea[name=" + key + "]").val(data[key])
                }
                if (data.hasOwnProperty('list')) Card.genList(data['list'])
                $('#add_card').modal('show')
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
            if (data['list'][fName] == undefined) data['list'][fName] = [$(this).val()]
            else data['list'][fName].push($(this).val())
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
            console.log(data)
            $(".card[data-id=" + data._id + "]").find(".card-" + key).text(data[key])
        }
    },
    genList: function (list) {
        console.log(list)
        var html = ''
        for (var key in list) {
            html += `<div class="form-group task-list" data-listname="${key}">
                <editable-content class="list-name" contenteditable="true">List name ${key}</editable-content>`
            list[key].map((el) => {
                html += ` <p><input type="checkbox" id="${key}" name="data_list" data-field="${key}" value="${el}">
                <label for="${key}">${el}</label>
                </p>`

            })
            html += `<input type="text" class="form-control mb-3 task-field" name="task"></div>`
        }

        $('#add_card .modal-body .add_list').before(html)
    }
}


$('#add_card').on('hidden.bs.modal', function () {
    Card.reset($('#add_card'))
})

addBtn.click(function (e) {
    e.preventDefault();
    Card.add($('.new_card'))
})
deleteBtn.click(function () {
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
$(document).on('click', '.card', function () {
    var id = $(this).data('id')
    Card.get(id)
})

$('.add_list').click(function () {
    var listname = rand()
    $(this).before(`<div class="form-group task-list" data-listname="${listname}"><editable-content class='list-name'>List name ${listname}</editable-content><input type="text" class="form-control mb-3 task-field" name="task"></div>`)
})

function rand() {
    return Math.floor(Math.random() * 9999)
}
$(document).on('keydown', '.task-field', function (e) {
    var listname = $(this).closest('.form-group').data('listname')
    if (e.keyCode == 13) {
        var id = rand()
        e.preventDefault()
        $(this).before(`<p><input type="checkbox" id="${id}" name="data_list" data-field="${listname}" value="${$(this).val()}"><label for="${id}">${$(this).val()}</label></p>`)
        $(this).val('')
    }
})

var el = document.querySelector('.cards');
var sortable = Sortable.create(el, {
    onSort: function (evt) {
        console.log(evt)
    }
});

//const element = document.querySelector('.list-name');
$(document).on('edit', '.list-name', function (e) {
    console.log(e.target.innerHTML); // the new value
    console.log(e.target.previousInnerHTML); // old value
})


var data = {
    'title': '',
    'descr': '',
    'list': {
        'list name': ['1', '2', '...']
    }
}

