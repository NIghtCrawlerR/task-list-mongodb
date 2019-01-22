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
                $('#add_card').modal('show')
            }
        })
    },
    createData: function (formEl) {
        var data = {}
        var invalid = false
        var inputs = formEl.find('input, textarea, select').not(':input[type=button], :input[type=submit], :input[type=reset]');
        $(inputs).each(function () {
            if($(this).attr('required') && !$(this).val()) {
                $(this).addClass('emptyval')
                invalid = true
                return !1
            }
            data[$(this).attr('name')] = $(this).val()
        });
        if(invalid) return !1
        return data
    },
    reset: function (formEl) {
        var inputs = formEl.find('input, textarea').not(':input[type=button], :input[type=submit], :input[type=reset]');
        $(inputs).each(function () {
            $(this).val('')
        });
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
    }
}

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
$(document).on('click', '.card', function(){
    var id = $(this).data('id')
    Card.get(id)
})

$('.add_list').click(function () {
    $(this).before(`<div class="form-group"><editable-content class='list-name'>List name</editable-content><input type="text" class="form-control mb-3 task-field" name="task"></div>`)
})

function rand() {
    return Math.floor(Math.random() * 9999)
}
$(document).on('keydown', '.task-field', function (e) {
    var id = rand()
    console.log(id)
    if (e.keyCode == 13) {
        e.preventDefault()
        $(this).before(`<p><input type="checkbox" id="${id}" name="${id}"><label for="${id}">${$(this).val()}</label></p>`)
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
$(document).on('edit', '.list-name', function(e){
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

