var cardId = 0;
var Card = {
    add: function (formEl) {
        $('#add_card').find('[data-field=index]').val($('.card').length)
        var data = this.createData(formEl)
        $.ajax({
            url: "cards",
            contentType: "application/json",
            method: "POST",
            data: JSON.stringify({ data }),
            success: function (data) {
                Card.reset(formEl);
                Card.renderCard(data)
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
                $('#add_card').find('[data-field=index]').val(data.index)
                $('#add_card').modal('show')
                editable()
                sortableList()
                console.log(data)
            }
        })
    },
    createData: function (formEl) {
        var data = {}
        var invalid = false
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
        console.log(data)
        return data
    },
    reset: function (formEl) {
        var inputs = formEl.find('input, textarea').not(':input[type=button], :input[type=submit], :input[type=reset]');
        $(inputs).each(function () {
            $(this).val('')
        });
        formEl.find('.task-list').remove()
    },
    renderCard: function (data) {
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
            html += `<div class="form-group task-list" data-listname="${key}"><div class="handle">|||</div>
                <editable-content class="list-name" contenteditable="true">${key}</editable-content>`
            list[key].map((el, i) => {
                var checked = el[1] == 1 ? 'checked' : ''
                html += ` <p><input type="checkbox" name="data_list" data-field="${key}" data-task="${el[0]}" value="${el[1]}" ${checked}><span class="checkbox"></span>
                <editable-content class="task">${el[0]}</editable-content>
                <button type="button" class="close delete-task"><span>&times;</span></button></p>`

            })
            html += `<input type="text" class="form-control mb-3 task-field" name="task" placeholder="Add task..."></div>`
        }

        $('#add_card .modal-body .add_list').before(html)
    }
}