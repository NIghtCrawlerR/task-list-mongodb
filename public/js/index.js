var cardId = 0;
var Card = {
    add: function (formEl) {
        $('#add_card').find('[data-field=index]').val($('.card').length) //get index of new card
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
    delete: function () {
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
                console.log(data.badges)
                for (var key in data) {
                    $('#add_card').find("input[data-field=" + key + "], textarea[data-field=" + key + "]").val(data[key])
                    $('#add_card').find("select[data-field=" + key + "]")
                    $('#badges').select2('val', data.badges);
                }
                if (data.hasOwnProperty('list')) Card.genList(data['list'])
                $('#add_card').modal('show')
                editable()
                sortableList()
            }
        })
    },
    createData: function (formEl) {
        var data = {},
            invalid = false,
            inputs = formEl.find('[name=data]'),
            list = formEl.find('[name=data_list]')
        //get data from inputs
        $(inputs).each(function () {
            if ($(this).attr('required') && !$(this).val()) {
                $(this).addClass('emptyval')
                invalid = true
                return !1
            }
            var val = $(this).val()
            if ($(this).data('field') == 'index') { val = parseInt(val) }
           // if ($(this).data('field') == 'badges') { val = JSON.parse(val) }
            data[$(this).data('field')] = val
        });
        console.log(data)
        //get data from lists
        data['list'] = []
        var arr = []
        $('.task-list').each(function () {
            var list = {}
            var fName = $(this).data('listname')
            list[fName] = []
            $(this).find('[name=data_list]').each(function () {
                list[fName].push([$(this).data('task'), $(this).val()])
            })
            data['list'].push(list)
        })
        if (invalid) return !1
        return data
    },
    reset: function (formEl) {
        var inputs = formEl.find('[name=data]')
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
        list.map((l) => {
            for (var key in l) {
                var cTasks = 0
                html += `<div class="form-group task-list" data-listname="${key}"><div class="handle">|||</div>
                <editable-content class="list-name" contenteditable="true">${key}</editable-content>
                <div class="task-list-body">`
                l[key].map((el, i) => {
                    var checked = el[1] == 1 ? 'checked' : ''
                    if (el[1] == 1) cTasks++
                    html += ` <p class="${checked}" data-checked="${checked}">
                   
                <input type="checkbox" name="data_list" data-field="${key}" data-task="${el[0]}" value="${el[1]}" ${checked}>
                <span class="checkbox"></span>
                <editable-content class="task">${el[0]}</editable-content>
                <button type="button" class="close delete-task"><span>&times;</span></button> 
                </p>`
                })
                html += `</div><input type="text" class="form-control mb-3 task-field" name="task" placeholder="Add task...">
            <button type="button" class="btn btn-sm btn-link toggle_hidden">Toggle hidden</button>
            <button type="button" class="btn btn-sm btn-link btn-link-danger remove_list">Remove list</button>
            <p class="tasks-track"><span class="closed-tasks">${cTasks}</span> of ${l[key].length}</p>
            </div>`
            }
        })


        $('#add_card .modal-body .add_list').before(html)
    }
}

var Badge = {
    add: function (formEl, color, text) {
        var data = {};
        $('#add_badges #title').toggleClass('emptyval', $('#add_badges #title').val() == '')
        if($('#add_badges #title').val() == '') return !1
        $.each($(formEl).find('form').serializeArray(), function (_, el) {
            data[el.name] = el.value;
        });
        $('.badges').append(`<span class="badge badge-${data.color} mr-1 mb-2" data-color="${data.color}" data-title="${data.title}">${data.title}<span class='del'>✖</span></span>`)
        $('#add_badges #title').val('')
        this.update()
    },
    delete: function (badge) {
        badge.remove()
        this.update()
    },
    update: function () {
        var badges = {
            'badges': []
        }
        $('.badges .badge').each(function(){
            badges['badges'].push([$(this).data('title'), $(this).data('color')])
        })
        $.ajax({
            url: "badges",
            contentType: "application/json",
            method: "POST",
            data: JSON.stringify(badges),
            success: function (data) {
                console.log(data)
            }
        })
    }
}